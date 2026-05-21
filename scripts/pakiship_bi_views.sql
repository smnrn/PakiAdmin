-- =============================================================================
-- PakiShip Prescriptive BI — Analytical Views, Audit Table & RPC Function
-- Run this in Supabase → SQL Editor
-- =============================================================================
-- SECTION A: Legacy dwell-time / volume-forecast views (unchanged)
-- SECTION B: Northstar redesign — descriptive / predictive / prescriptive views
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. DESCRIPTIVE VIEW: vw_hub_dwell_times
--    Average dwell hours per hub. Flags parcels dwelling > 72h as SLA breach.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_hub_dwell_times AS
SELECT
  phr.hub_id,
  COALESCE(dop.name, 'Hub ' || phr.hub_id) AS hub_name,
  COUNT(phr.id) AS total_parcels,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (COALESCE(phr.picked_up_at, NOW()) - phr.received_at)) / 3600.0
    )::numeric, 1
  ) AS avg_dwell_hours,
  COUNT(phr.id) FILTER (
    WHERE phr.picked_up_at IS NULL
      AND EXTRACT(EPOCH FROM (NOW() - phr.received_at)) / 3600.0 > 72
  ) AS sla_breach_count,
  COUNT(phr.id) FILTER (
    WHERE phr.picked_up_at IS NULL
  ) AS currently_dwelling
FROM parcel_hub_records phr
LEFT JOIN drop_off_points dop ON dop.id::text = phr.hub_id::text
WHERE phr.received_at IS NOT NULL
GROUP BY phr.hub_id, dop.name;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PREDICTIVE VIEW: vw_hub_volume_forecast
--    Current stored + 24h incoming vs capacity → risk percentage.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_hub_volume_forecast AS
WITH stored AS (
  SELECT
    phr.hub_id,
    COUNT(*) AS current_stored
  FROM parcel_hub_records phr
  WHERE phr.picked_up_at IS NULL
    AND phr.received_at IS NOT NULL
  GROUP BY phr.hub_id
),
incoming AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*) AS incoming_24h
  FROM parcel_drafts pd
  WHERE pd.status IN ('submitted', 'in_transit')
    AND pd.drop_off_point_id IS NOT NULL
  GROUP BY pd.drop_off_point_id
)
SELECT
  COALESCE(s.hub_id, i.hub_id) AS hub_id,
  COALESCE(dop.name, 'Hub ' || COALESCE(s.hub_id, i.hub_id)) AS hub_name,
  COALESCE(s.current_stored, 0) AS current_stored,
  COALESCE(i.incoming_24h, 0) AS incoming_24h,
  COALESCE(s.current_stored, 0) + COALESCE(i.incoming_24h, 0) AS total_forecast,
  COALESCE(dop.max_capacity, 100) AS capacity,
  ROUND(
    (
      (COALESCE(s.current_stored, 0) + COALESCE(i.incoming_24h, 0))::numeric
      / NULLIF(COALESCE(dop.max_capacity, 100), 0)::numeric
    ) * 100, 1
  ) AS risk_pct
FROM stored s
FULL OUTER JOIN incoming i ON s.hub_id = i.hub_id
LEFT JOIN drop_off_points dop ON dop.id::text = COALESCE(s.hub_id, i.hub_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PRESCRIPTIVE VIEW: vw_pakiship_actionable_insights
--    Joins descriptive + predictive → outputs prescriptive action per hub.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_pakiship_actionable_insights AS
SELECT
  COALESCE(vf.hub_id, dw.hub_id) AS hub_id,
  COALESCE(vf.hub_name, dw.hub_name, 'Unknown Hub') AS hub_name,
  COALESCE(vf.risk_pct, 0) AS risk_pct,
  COALESCE(dw.avg_dwell_hours, 0) AS avg_dwell_hours,
  COALESCE(dw.sla_breach_count, 0) AS sla_breach_count,
  COALESCE(vf.current_stored, 0) AS current_stored,
  COALESCE(vf.incoming_24h, 0) AS incoming_24h,
  COALESCE(vf.capacity, 100) AS capacity,
  CASE
    WHEN COALESCE(vf.risk_pct, 0) > 90
      THEN 'CRITICAL: Trigger +₱50 Pickup Surge Bonus to Relay Drivers.'
    WHEN COALESCE(dw.avg_dwell_hours, 0) > 48
      THEN 'WARNING: Autonomously Reroute Incoming Bulk Senders.'
    ELSE 'Stable / Optimal Flow.'
  END AS prescriptive_action,
  CASE
    WHEN COALESCE(vf.risk_pct, 0) > 90 THEN 'CRITICAL'
    WHEN COALESCE(dw.avg_dwell_hours, 0) > 48 THEN 'WARNING'
    ELSE 'STABLE'
  END AS severity
FROM vw_hub_volume_forecast vf
FULL OUTER JOIN vw_hub_dwell_times dw ON vf.hub_id = dw.hub_id;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AUDIT TABLE: actuation_logs (shared with PakiPark)
--    platform column added to distinguish pakiship vs pakipark actions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actuation_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  platform        TEXT NOT NULL DEFAULT 'pakiship',
  location_id     TEXT NOT NULL,
  threat_detected TEXT NOT NULL,
  action_taken    TEXT NOT NULL
);

-- Idempotent: add platform column if migrating from old schema
ALTER TABLE actuation_logs
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'pakiship';

CREATE INDEX IF NOT EXISTS idx_actuation_logs_location
  ON actuation_logs (location_id);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_triggered
  ON actuation_logs (triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_platform
  ON actuation_logs (platform);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPC FUNCTION: fn_execute_surge_action (updated — accepts platform param)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_execute_surge_action(
  p_location_id TEXT,
  p_threat      TEXT,
  p_action      TEXT,
  p_platform    TEXT DEFAULT 'pakiship'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO actuation_logs (location_id, threat_detected, action_taken, platform)
  VALUES (p_location_id, p_threat, p_action, p_platform)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


-- =============================================================================
-- SECTION B: Northstar Redesign Views
-- North Star Metric: Hub Utilization Rate (Target: 75%)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- B-1. DESCRIPTIVE VIEW: vw_pakiship_descriptive
--      Hub Utilization Rate, SLA compliance, Relay vs Direct split.
--      Uses SQL Window Aggregations over parcel schema tables.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_pakiship_descriptive AS
WITH hub_base AS (
  SELECT
    dop.id::text                                                    AS hub_id,
    dop.name                                                        AS hub_name,
    COALESCE(dop.max_capacity, 100)                                 AS capacity,
    COUNT(phr.id) FILTER (WHERE phr.picked_up_at IS NULL
      AND phr.received_at IS NOT NULL)                              AS current_stored,
    COUNT(phr.id) FILTER (WHERE phr.picked_up_at IS NULL
      AND phr.received_at IS NOT NULL
      AND EXTRACT(EPOCH FROM (NOW() - phr.received_at)) / 3600.0 > 72)
                                                                    AS sla_breach_count,
    COUNT(phr.id)                                                   AS total_parcels
  FROM drop_off_points dop
  LEFT JOIN parcel_hub_records phr ON phr.hub_id::text = dop.id::text
  GROUP BY dop.id, dop.name, dop.max_capacity
),
delivery_split AS (
  SELECT
    pd.drop_off_point_id::text                                      AS hub_id,
    COUNT(*) FILTER (WHERE pd.drop_off_point_id IS NOT NULL)        AS relay_count,
    COUNT(*) FILTER (WHERE pd.drop_off_point_id IS NULL)            AS direct_count
  FROM parcel_drafts pd
  GROUP BY pd.drop_off_point_id
),
global_split AS (
  SELECT
    COUNT(*) FILTER (WHERE drop_off_point_id IS NOT NULL)           AS total_relay,
    COUNT(*) FILTER (WHERE drop_off_point_id IS NULL)               AS total_direct,
    COUNT(*)                                                        AS total_all
  FROM parcel_drafts
)
SELECT
  hb.hub_id,
  hb.hub_name,
  hb.capacity,
  hb.current_stored,
  hb.sla_breach_count,
  hb.total_parcels,
  -- Hub Utilization Rate: current stored vs. capacity
  ROUND(
    (hb.current_stored::numeric / NULLIF(hb.capacity, 0)::numeric) * 100, 1
  )                                                                 AS util_pct,
  -- Per-hub relay/direct parcels (from parcel_drafts)
  COALESCE(ds.relay_count, 0)                                       AS relay_count,
  COALESCE(ds.direct_count, 0)                                      AS direct_count,
  -- Network-wide Relay vs Direct split percentages
  ROUND(
    (gs.total_relay::numeric / NULLIF(gs.total_all, 0)::numeric) * 100, 1
  )                                                                 AS relay_pct,
  ROUND(
    (gs.total_direct::numeric / NULLIF(gs.total_all, 0)::numeric) * 100, 1
  )                                                                 AS direct_pct,
  -- SLA Compliance Rate (% of total parcels NOT in breach)
  ROUND(
    ((hb.total_parcels - hb.sla_breach_count)::numeric
      / NULLIF(hb.total_parcels, 0)::numeric) * 100, 1
  )                                                                 AS sla_ok_pct,
  -- Window: average utilization across all hubs (for the hero card)
  ROUND(
    AVG(
      (hb.current_stored::numeric / NULLIF(hb.capacity, 0)::numeric) * 100
    ) OVER (), 1
  )                                                                 AS avg_network_util_pct
FROM hub_base hb
LEFT JOIN delivery_split ds ON ds.hub_id = hb.hub_id
CROSS JOIN global_split gs;


-- ─────────────────────────────────────────────────────────────────────────────
-- B-2. PREDICTIVE VIEW: vw_pakiship_predictive
--      Moving averages on incoming parcel_drafts → 4h deadlock forecast
--      and 24h hub overflow forecast expressed as % of hub capacity.
--      Uses COUNT(*) FILTER on time windows as the moving average proxy.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_pakiship_predictive AS
WITH hub_capacity AS (
  SELECT
    id::text      AS hub_id,
    name          AS hub_name,
    COALESCE(max_capacity, 100) AS capacity
  FROM drop_off_points
),
stored_now AS (
  SELECT
    phr.hub_id,
    COUNT(*) AS current_stored
  FROM parcel_hub_records phr
  WHERE phr.picked_up_at IS NULL
    AND phr.received_at IS NOT NULL
  GROUP BY phr.hub_id
),
-- 4-hour moving window: parcels submitted/in-transit in last 4h → forecast incoming
incoming_4h AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*)                   AS arrivals_4h
  FROM parcel_drafts pd
  WHERE pd.status IN ('submitted', 'in_transit')
    AND pd.drop_off_point_id IS NOT NULL
    AND pd.created_at >= NOW() - INTERVAL '4 hours'
  GROUP BY pd.drop_off_point_id
),
-- 24-hour moving window
incoming_24h AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*)                   AS arrivals_24h
  FROM parcel_drafts pd
  WHERE pd.status IN ('submitted', 'in_transit')
    AND pd.drop_off_point_id IS NOT NULL
    AND pd.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY pd.drop_off_point_id
)
SELECT
  hc.hub_id,
  hc.hub_name,
  hc.capacity,
  COALESCE(sn.current_stored, 0)  AS current_stored,
  COALESCE(i4.arrivals_4h, 0)     AS forecast_4h,
  COALESCE(i24.arrivals_24h, 0)   AS forecast_24h,
  -- 4h forecast as % of capacity (deadlock risk)
  ROUND(
    ((COALESCE(sn.current_stored, 0) + COALESCE(i4.arrivals_4h, 0))::numeric
      / NULLIF(hc.capacity, 0)::numeric) * 100, 1
  )                               AS forecast_4h_pct,
  -- 24h forecast as % of capacity (overflow risk)
  ROUND(
    ((COALESCE(sn.current_stored, 0) + COALESCE(i24.arrivals_24h, 0))::numeric
      / NULLIF(hc.capacity, 0)::numeric) * 100, 1
  )                               AS forecast_24h_pct
FROM hub_capacity hc
LEFT JOIN stored_now sn      ON sn.hub_id = hc.hub_id
LEFT JOIN incoming_4h i4     ON i4.hub_id = hc.hub_id
LEFT JOIN incoming_24h i24   ON i24.hub_id = hc.hub_id;


-- ─────────────────────────────────────────────────────────────────────────────
-- B-3. PRESCRIPTIVE VIEW: vw_pakiship_prescriptive
--      Joins descriptive + predictive → outputs prescriptive_action per hub.
--      Thresholds:
--        4h deadlock forecast > 90% capacity → CRITICAL: +₱50 ALERT BONUS
--        Utilization < 40% OR > 85%          → WARNING: Hub Rebalance
--        Else                                → Stable (Near 75% Target)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_pakiship_prescriptive AS
SELECT
  d.hub_id,
  d.hub_name,
  d.util_pct,
  d.sla_ok_pct,
  d.relay_pct,
  d.direct_pct,
  d.current_stored,
  d.capacity,
  d.sla_breach_count,
  p.forecast_4h_pct,
  p.forecast_24h_pct,
  p.forecast_4h,
  p.forecast_24h,
  CASE
    WHEN COALESCE(p.forecast_4h_pct, 0) > 90
      THEN 'CRITICAL: Trigger +₱50 ALERT BONUS to Relay Drivers via Bypass Lane.'
    WHEN COALESCE(d.util_pct, 0) < 40 OR COALESCE(d.util_pct, 0) > 85
      THEN 'WARNING: Generate Hub Rebalance Recommendation.'
    ELSE 'Stable (Near 75% Target).'
  END AS prescriptive_action,
  CASE
    WHEN COALESCE(p.forecast_4h_pct, 0) > 90 THEN 'CRITICAL'
    WHEN COALESCE(d.util_pct, 0) < 40 OR COALESCE(d.util_pct, 0) > 85 THEN 'WARNING'
    ELSE 'STABLE'
  END AS severity
FROM vw_pakiship_descriptive d
LEFT JOIN vw_pakiship_predictive p ON p.hub_id = d.hub_id;
