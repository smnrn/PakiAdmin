-- =============================================================================
-- PakiShip Prescriptive BI — Analytical Views, Audit Table & RPC Function
-- Run this in Supabase → SQL Editor
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
-- 4. AUDIT TABLE: actuation_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actuation_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location_id     TEXT NOT NULL,
  threat_detected TEXT NOT NULL,
  action_taken    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_actuation_logs_location
  ON actuation_logs (location_id);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_triggered
  ON actuation_logs (triggered_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPC FUNCTION: fn_execute_surge_action
--    Called from the frontend to log an actuation event.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_execute_surge_action(
  p_location_id TEXT,
  p_threat TEXT,
  p_action TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO actuation_logs (location_id, threat_detected, action_taken)
  VALUES (p_location_id, p_threat, p_action)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
