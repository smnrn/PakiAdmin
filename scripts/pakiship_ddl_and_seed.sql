-- =============================================================================
--  PakiShip — Supabase DDL & Seed Script (No-Public-Schema Constraint)
--  PURPOSE: Creates missing tables and views, and seeds mock data.
--  HOW TO APPLY: Paste into Supabase → SQL Editor and run.
-- =============================================================================

-- CREATE SCHEMAS if they do not exist
CREATE SCHEMA IF NOT EXISTS parcel;
CREATE SCHEMA IF NOT EXISTS driver;
CREATE SCHEMA IF NOT EXISTS routing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Table: driver.driver_sessions
CREATE TABLE IF NOT EXISTS driver.driver_sessions (
  id              SERIAL PRIMARY KEY,
  driver_user_id  TEXT NOT NULL UNIQUE,
  is_online       BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: driver.driver_ratings
CREATE TABLE IF NOT EXISTS driver.driver_ratings (
  id            SERIAL PRIMARY KEY,
  driver_id     TEXT NOT NULL,
  rating        NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  customer_name TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: parcel.lost_parcel_cases
CREATE TABLE IF NOT EXISTS parcel.lost_parcel_cases (
  id                      TEXT PRIMARY KEY,
  parcel_id               TEXT NOT NULL,
  affected_customer       TEXT NOT NULL,
  customer_email          TEXT NOT NULL,
  route                   TEXT NOT NULL,
  parcel_value            NUMERIC NOT NULL,
  date_reported           TEXT NOT NULL, -- Stored as string to match existing date formats
  status                  TEXT NOT NULL DEFAULT 'open',
  status_history          JSONB NOT NULL DEFAULT '[]'::jsonb,
  refund                  JSONB,
  resolution_notification  JSONB,
  assigned_team           TEXT NOT NULL,
  last_known_location     TEXT NOT NULL,
  last_known_timestamp    TEXT NOT NULL,
  assigned_driver         JSONB NOT NULL,
  timeline                JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: parcel.lost_parcel_case_events
CREATE TABLE IF NOT EXISTS parcel.lost_parcel_case_events (
  id          SERIAL PRIMARY KEY,
  case_id     TEXT NOT NULL,
  status      TEXT NOT NULL,
  note        TEXT,
  updated_by  TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: routing.actuation_logs
CREATE TABLE IF NOT EXISTS routing.actuation_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  platform        TEXT NOT NULL DEFAULT 'pakiship',
  location_id     TEXT NOT NULL,
  threat_detected TEXT NOT NULL,
  action_taken    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_actuation_logs_location ON routing.actuation_logs (location_id);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_triggered ON routing.actuation_logs (triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_platform ON routing.actuation_logs (platform);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────

-- Seed driver sessions (Online Status)
INSERT INTO driver.driver_sessions (driver_user_id, is_online, last_active_at)
VALUES
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101', true, NOW()),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1102', true, NOW()),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1103', false, NOW() - INTERVAL '1 day'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1104', false, NOW() - INTERVAL '2 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1105', false, NOW() - INTERVAL '3 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1106', false, NOW() - INTERVAL '4 days')
ON CONFLICT (driver_user_id) 
DO UPDATE SET 
  is_online = EXCLUDED.is_online,
  last_active_at = EXCLUDED.last_active_at;

-- Seed driver ratings history
TRUNCATE TABLE driver.driver_ratings CASCADE;
INSERT INTO driver.driver_ratings (driver_id, rating, comment, customer_name, created_at)
VALUES
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101', 5, 'Rider was extremely polite and fast.', 'Carla Mendoza', NOW() - INTERVAL '8 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101', 4, 'Delivered in good condition.', 'Kevs Cruz', NOW() - INTERVAL '10 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1102', 5, 'Careful with fragile items.', 'Ana Lim', NOW() - INTERVAL '9 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1103', 5, 'Punctual and very polite!', 'Lester V.', NOW() - INTERVAL '4 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1103', 5, 'Careful with fragile items.', 'B. Flores', NOW() - INTERVAL '5 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1104', 4, 'On time.', 'Dave P.', NOW() - INTERVAL '7 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1105', 4, 'Friendly rider.', 'George T.', NOW() - INTERVAL '6 days'),
  ('f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1106', 4, 'Good delivery experience.', 'Vince S.', NOW() - INTERVAL '11 days');

-- Seed lost parcel cases
TRUNCATE TABLE parcel.lost_parcel_cases CASCADE;
INSERT INTO parcel.lost_parcel_cases (
  id, parcel_id, affected_customer, customer_email, route, parcel_value, date_reported, status,
  status_history, refund, resolution_notification, assigned_team, last_known_location, last_known_timestamp,
  assigned_driver, timeline
) VALUES
  (
    'LPC-1021',
    'PKS-2026-9982',
    'Carla Mendoza',
    'carla.mendoza@email.com',
    'Lacson Ave to P. Noval',
    12500,
    '2026-05-14',
    'investigating',
    '[
      {"id": "ISH-1021-1", "status": "open", "timestamp": "2026-05-14T18:05:00Z", "updatedBy": "Support Desk", "note": "Customer reported parcel missing after missed delivery scan."},
      {"id": "ISH-1021-2", "status": "investigating", "timestamp": "2026-05-14T18:22:00Z", "updatedBy": "Incident Response", "note": "Assigned to incident team for hub scan verification."}
    ]'::jsonb,
    NULL,
    NULL,
    'Incident Response',
    'PakiShip Sampaloc Sorting Desk',
    '2026-05-14T16:45:00Z',
    '{"name": "John Salazar", "phone": "+63 917 406 1102", "vehicle": "Motorcycle - NCR 4812", "rating": 4.7, "lastContact": "2026-05-14T17:10:00Z"}'::jsonb,
    '[
      {"id": "TL-001", "label": "Parcel accepted", "location": "Lawson Lacson Ave", "timestamp": "2026-05-14T10:20:00Z", "status": "completed", "note": "Parcel scanned at partner counter."},
      {"id": "TL-002", "label": "Driver pickup", "location": "Lawson Lacson Ave", "timestamp": "2026-05-14T11:05:00Z", "status": "completed", "note": "Driver confirmed package pickup."},
      {"id": "TL-003", "label": "Hub intake scan", "location": "PakiShip Sampaloc Sorting Desk", "timestamp": "2026-05-14T16:45:00Z", "status": "flagged", "note": "Last confirmed scan before missing handoff."},
      {"id": "TL-004", "label": "Customer delivery", "location": "P. Noval, Sampaloc", "timestamp": "2026-05-14T18:30:00Z", "status": "pending", "note": "Delivery scan missing."}
    ]'::jsonb
  ),
  (
    'LPC-1018',
    'PKS-2026-9824',
    'Noel Ramirez',
    'noel.ramirez@email.com',
    'Espana Blvd to Dapitan',
    8750,
    '2026-05-13',
    'investigating',
    '[
      {"id": "ISH-1018-1", "status": "open", "timestamp": "2026-05-13T17:18:00Z", "updatedBy": "Support Desk", "note": "Report created from missing receiving scan."},
      {"id": "ISH-1018-2", "status": "investigating", "timestamp": "2026-05-13T17:46:00Z", "updatedBy": "Dispatch Review", "note": "Rider and receiving point contacted for route confirmation."}
    ]'::jsonb,
    NULL,
    NULL,
    'Dispatch Review',
    'Espana Dispatch Bay',
    '2026-05-13T15:15:00Z',
    '{"name": "Mark Gonzales", "phone": "+63 918 221 7044", "vehicle": "Motorcycle - NCR 7720", "rating": 4.5, "lastContact": "2026-05-13T15:40:00Z"}'::jsonb,
    '[
      {"id": "TL-005", "label": "Parcel accepted", "location": "7-Eleven Espana", "timestamp": "2026-05-13T09:30:00Z", "status": "completed", "note": "Customer dropped parcel at counter."},
      {"id": "TL-006", "label": "Dispatch assignment", "location": "Espana Dispatch Bay", "timestamp": "2026-05-13T12:05:00Z", "status": "completed", "note": "Assigned to rider route batch ES-18."},
      {"id": "TL-007", "label": "Route departure", "location": "Espana Dispatch Bay", "timestamp": "2026-05-13T15:15:00Z", "status": "current", "note": "Last rider departure scan."},
      {"id": "TL-008", "label": "Drop-off confirmation", "location": "Dapitan Receiving Point", "timestamp": "2026-05-13T17:00:00Z", "status": "pending", "note": "Receiving scan not recorded."}
    ]'::jsonb
  ),
  (
    'LPC-1014',
    'PKS-2026-9751',
    'Bea Flores',
    'bea.flores@email.com',
    'UST Overpass to Lerma',
    4200,
    '2026-05-12',
    'open',
    '[
      {"id": "ISH-1014-1", "status": "open", "timestamp": "2026-05-12T16:20:00Z", "updatedBy": "Customer Support", "note": "Customer report logged with initial drop-off receipt."}
    ]'::jsonb,
    NULL,
    NULL,
    'Customer Support',
    'UST Overpass Drop-Off Counter',
    '2026-05-12T13:55:00Z',
    '{"name": "Maria Reyes", "phone": "+63 915 602 3481", "vehicle": "Motorcycle - NCR 2198", "rating": 4.8, "lastContact": "2026-05-12T14:25:00Z"}'::jsonb,
    '[
      {"id": "TL-009", "label": "Parcel accepted", "location": "UST Overpass Drop-Off Counter", "timestamp": "2026-05-12T13:55:00Z", "status": "current", "note": "Only successful scan on the shipment."},
      {"id": "TL-010", "label": "Driver pickup", "location": "UST Overpass Drop-Off Counter", "timestamp": "2026-05-12T15:00:00Z", "status": "pending", "note": "Pickup confirmation awaiting customer document match."}
    ]'::jsonb
  ),
  (
    'LPC-1009',
    'PKS-2026-9633',
    'Lester Villanueva',
    'lester.villanueva@email.com',
    'Asturias to Laon Laan',
    16480,
    '2026-05-11',
    'open',
    '[
      {"id": "ISH-1009-1", "status": "open", "timestamp": "2026-05-11T14:35:00Z", "updatedBy": "Hub Operations", "note": "Counter scan found without matching transfer scan."}
    ]'::jsonb,
    NULL,
    NULL,
    'Hub Operations',
    'Asturias Partner Counter',
    '2026-05-11T11:45:00Z',
    '{"name": "Leo Castillo", "phone": "+63 922 818 5530", "vehicle": "Motorcycle - NCR 6320", "rating": 4.4, "lastContact": "2026-05-11T12:20:00Z"}'::jsonb,
    '[
      {"id": "TL-011", "label": "Parcel accepted", "location": "Asturias Partner Counter", "timestamp": "2026-05-11T11:45:00Z", "status": "flagged", "note": "Initial scan recorded; no subsequent movement."},
      {"id": "TL-012", "label": "Hub transfer", "location": "Sampaloc Hub", "timestamp": "2026-05-11T14:00:00Z", "status": "pending", "note": "Transfer scan missing."}
    ]'::jsonb
  ),
  (
    'LPC-1006',
    'PKS-2026-9558',
    'Jessa Rivera',
    'jessa.rivera@email.com',
    'Espana to Quiapo',
    6200,
    '2026-05-10',
    'investigating',
    '[
      {"id": "ISH-1006-1", "status": "open", "timestamp": "2026-05-10T18:40:00Z", "updatedBy": "Support Desk", "note": "Customer reported parcel absent from expected delivery."},
      {"id": "ISH-1006-2", "status": "investigating", "timestamp": "2026-05-10T19:05:00Z", "updatedBy": "Dispatch Review", "note": "Transfer batch and rider log under review."}
    ]'::jsonb,
    NULL,
    NULL,
    'Dispatch Review',
    'Quiapo Route Van Transfer',
    '2026-05-10T18:05:00Z',
    '{"name": "Anna Martinez", "phone": "+63 927 441 8920", "vehicle": "Motorcycle - NCR 3431", "rating": 4.6, "lastContact": "2026-05-10T18:45:00Z"}'::jsonb,
    '[
      {"id": "TL-013", "label": "Parcel accepted", "location": "7-Eleven Espana", "timestamp": "2026-05-10T10:10:00Z", "status": "completed", "note": "Accepted at origin counter."},
      {"id": "TL-014", "label": "Driver pickup", "location": "Espana Dispatch Bay", "timestamp": "2026-05-10T13:40:00Z", "status": "completed", "note": "Picked up by assigned rider."},
      {"id": "TL-015", "label": "Transfer scan", "location": "Quiapo Route Van Transfer", "timestamp": "2026-05-10T18:05:00Z", "status": "current", "note": "Last known scan before report."}
    ]'::jsonb
  ),
  (
    'LPC-1002',
    'PKS-2026-9412',
    'Dianne Lopez',
    'dianne.lopez@email.com',
    'Lerma to Recto',
    9700,
    '2026-05-08',
    'found',
    '[
      {"id": "ISH-1002-1", "status": "open", "timestamp": "2026-05-08T15:15:00Z", "updatedBy": "Support Desk", "note": "Missing parcel report created."},
      {"id": "ISH-1002-2", "status": "investigating", "timestamp": "2026-05-08T15:40:00Z", "updatedBy": "Claims Review", "note": "Counter and rider scans compared."},
      {"id": "ISH-1002-3", "status": "found", "timestamp": "2026-05-08T16:35:00Z", "updatedBy": "Claims Review", "note": "Parcel recovered at Recto receiving counter."}
    ]'::jsonb,
    NULL,
    NULL,
    'Claims Review',
    'Recto Receiving Counter',
    '2026-05-08T16:30:00Z',
    '{"name": "Jose Navarro", "phone": "+63 916 480 1928", "vehicle": "Motorcycle - NCR 5490", "rating": 4.9, "lastContact": "2026-05-08T16:50:00Z"}'::jsonb,
    '[
      {"id": "TL-016", "label": "Parcel accepted", "location": "Mini Stop Lerma", "timestamp": "2026-05-08T09:10:00Z", "status": "completed", "note": "Accepted at origin counter."},
      {"id": "TL-017", "label": "Driver pickup", "location": "Mini Stop Lerma", "timestamp": "2026-05-08T11:05:00Z", "status": "completed", "note": "Picked up by rider."},
      {"id": "TL-018", "label": "Recovery scan", "location": "Recto Receiving Counter", "timestamp": "2026-05-08T16:30:00Z", "status": "completed", "note": "Parcel located and closed by claims review."}
    ]'::jsonb
  ),
  (
    'LPC-0998',
    'PKS-2026-9369',
    'Rachel Co',
    'rachel.co@email.com',
    'Santa Cruz to Sampaloc',
    28100,
    '2026-05-07',
    'refunded',
    '[
      {"id": "ISH-0998-1", "status": "open", "timestamp": "2026-05-07T21:10:00Z", "updatedBy": "Support Desk", "note": "High value parcel reported missing."},
      {"id": "ISH-0998-2", "status": "investigating", "timestamp": "2026-05-07T21:32:00Z", "updatedBy": "Incident Response", "note": "Consolidation point and rider records reviewed."},
      {"id": "ISH-0998-3", "status": "refunded", "timestamp": "2026-05-08T11:05:00Z", "updatedBy": "Claims Review", "note": "Refund approved after failed recovery window."}
    ]'::jsonb,
    '{"id": "RF-2026-0998", "amount": 28100, "method": "Bank Transfer", "timestamp": "2026-05-08T11:05:00Z", "issuedBy": "Claims Review", "note": "Refund approved after failed recovery window."}'::jsonb,
    NULL,
    'Incident Response',
    'Santa Cruz Consolidation Point',
    '2026-05-07T20:15:00Z',
    '{"name": "Daniel Torres", "phone": "+63 917 650 2221", "vehicle": "Motorcycle - NCR 8110", "rating": 4.3, "lastContact": "2026-05-07T20:35:00Z"}'::jsonb,
    '[
      {"id": "TL-019", "label": "Parcel accepted", "location": "SM San Lazaro", "timestamp": "2026-05-07T14:00:00Z", "status": "completed", "note": "Accepted by partner counter."},
      {"id": "TL-020", "label": "Driver pickup", "location": "SM San Lazaro", "timestamp": "2026-05-07T15:25:00Z", "status": "completed", "note": "Rider pickup confirmed."},
      {"id": "TL-021", "label": "Consolidation scan", "location": "Santa Cruz Consolidation Point", "timestamp": "2026-05-07T20:15:00Z", "status": "flagged", "note": "Last known scan; parcel not found in next batch."}
    ]'::jsonb
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ANALYTICAL VIEWS (Inside parcel schema, emulated using parcel_drafts/items)
-- ─────────────────────────────────────────────────────────────────────────────

-- View 1: parcel.vw_hub_dwell_times
CREATE OR REPLACE VIEW parcel.vw_hub_dwell_times AS
WITH phr AS (
  SELECT 
    pd.id,
    pd.drop_off_point_id::text AS hub_id,
    pd.status,
    COALESCE(
      (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
      NOW()
    ) AS received_at,
    CASE 
      WHEN pd.status = 'delivered' THEN COALESCE(
        (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
        NOW()
      ) + INTERVAL '5 hours'
      ELSE NULL
    END AS picked_up_at
  FROM parcel.parcel_drafts pd
  WHERE pd.drop_off_point_id IS NOT NULL
)
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
FROM phr
LEFT JOIN routing.operator_hubs dop ON dop.id::text = phr.hub_id::text
GROUP BY phr.hub_id, dop.name;

-- View 2: parcel.vw_hub_volume_forecast
CREATE OR REPLACE VIEW parcel.vw_hub_volume_forecast AS
WITH phr AS (
  SELECT 
    pd.id,
    pd.drop_off_point_id::text AS hub_id,
    pd.status,
    COALESCE(
      (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
      NOW()
    ) AS received_at,
    CASE 
      WHEN pd.status = 'delivered' THEN COALESCE(
        (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
        NOW()
      ) + INTERVAL '5 hours'
      ELSE NULL
    END AS picked_up_at
  FROM parcel.parcel_drafts pd
  WHERE pd.drop_off_point_id IS NOT NULL
),
stored AS (
  SELECT
    phr.hub_id,
    COUNT(*) AS current_stored
  FROM phr
  WHERE phr.picked_up_at IS NULL
  GROUP BY phr.hub_id
),
incoming AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*) AS incoming_24h
  FROM parcel.parcel_drafts pd
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
  COALESCE(dop.storage_capacity, 100) AS capacity,
  ROUND(
    (
      (COALESCE(s.current_stored, 0) + COALESCE(i.incoming_24h, 0))::numeric
      / NULLIF(COALESCE(dop.storage_capacity, 100), 0)::numeric
    ) * 100, 1
  ) AS risk_pct
FROM stored s
FULL OUTER JOIN incoming i ON s.hub_id = i.hub_id
LEFT JOIN routing.operator_hubs dop ON dop.id::text = COALESCE(s.hub_id, i.hub_id);

-- View 3: parcel.vw_pakiship_actionable_insights
CREATE OR REPLACE VIEW parcel.vw_pakiship_actionable_insights AS
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
FROM parcel.vw_hub_volume_forecast vf
FULL OUTER JOIN parcel.vw_hub_dwell_times dw ON vf.hub_id = dw.hub_id;

-- View 4: parcel.vw_pakiship_descriptive
CREATE OR REPLACE VIEW parcel.vw_pakiship_descriptive AS
WITH phr AS (
  SELECT 
    pd.id,
    pd.drop_off_point_id::text AS hub_id,
    pd.status,
    COALESCE(
      (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
      NOW()
    ) AS received_at,
    CASE 
      WHEN pd.status = 'delivered' THEN COALESCE(
        (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
        NOW()
      ) + INTERVAL '5 hours'
      ELSE NULL
    END AS picked_up_at
  FROM parcel.parcel_drafts pd
  WHERE pd.drop_off_point_id IS NOT NULL
),
hub_base AS (
  SELECT
    dop.id::text                                                    AS hub_id,
    dop.name                                                        AS hub_name,
    COALESCE(dop.storage_capacity, 100)                             AS capacity,
    COUNT(phr.id) FILTER (WHERE phr.picked_up_at IS NULL)           AS current_stored,
    COUNT(phr.id) FILTER (WHERE phr.picked_up_at IS NULL
      AND EXTRACT(EPOCH FROM (NOW() - phr.received_at)) / 3600.0 > 72)
                                                                    AS sla_breach_count,
    COUNT(phr.id)                                                   AS total_parcels
  FROM routing.operator_hubs dop
  LEFT JOIN phr ON phr.hub_id::text = dop.id::text
  GROUP BY dop.id, dop.name, dop.storage_capacity
),
delivery_split AS (
  SELECT
    pd.drop_off_point_id::text                                      AS hub_id,
    COUNT(*) FILTER (WHERE pd.drop_off_point_id IS NOT NULL)        AS relay_count,
    COUNT(*) FILTER (WHERE pd.drop_off_point_id IS NULL)            AS direct_count
  FROM parcel.parcel_drafts pd
  GROUP BY pd.drop_off_point_id
),
global_split AS (
  SELECT
    COUNT(*) FILTER (WHERE drop_off_point_id IS NOT NULL)           AS total_relay,
    COUNT(*) FILTER (WHERE drop_off_point_id IS NULL)               AS total_direct,
    COUNT(*)                                                        AS total_all
  FROM parcel.parcel_drafts
)
SELECT
  hb.hub_id,
  hb.hub_name,
  hb.capacity,
  hb.current_stored,
  hb.sla_breach_count,
  hb.total_parcels,
  ROUND(
    (hb.current_stored::numeric / NULLIF(hb.capacity, 0)::numeric) * 100, 1
  )                                                                 AS util_pct,
  COALESCE(ds.relay_count, 0)                                       AS relay_count,
  COALESCE(ds.direct_count, 0)                                      AS direct_count,
  ROUND(
    (gs.total_relay::numeric / NULLIF(gs.total_all, 0)::numeric) * 100, 1
  )                                                                 AS relay_pct,
  ROUND(
    (gs.total_direct::numeric / NULLIF(gs.total_all, 0)::numeric) * 100, 1
  )                                                                 AS direct_pct,
  ROUND(
    ((hb.total_parcels - hb.sla_breach_count)::numeric
      / NULLIF(hb.total_parcels, 0)::numeric) * 100, 1
  )                                                                 AS sla_ok_pct,
  ROUND(
    AVG(
      (hb.current_stored::numeric / NULLIF(hb.capacity, 0)::numeric) * 100
    ) OVER (), 1
  )                                                                 AS avg_network_util_pct
FROM hub_base hb
LEFT JOIN delivery_split ds ON ds.hub_id = hb.hub_id
CROSS JOIN global_split gs;

-- View 5: parcel.vw_pakiship_predictive
CREATE OR REPLACE VIEW parcel.vw_pakiship_predictive AS
WITH phr AS (
  SELECT 
    pd.id,
    pd.drop_off_point_id::text AS hub_id,
    pd.status,
    COALESCE(
      (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
      NOW()
    ) AS received_at,
    CASE 
      WHEN pd.status = 'delivered' THEN COALESCE(
        (SELECT MIN(created_at) FROM parcel.parcel_draft_items pdi WHERE pdi.parcel_draft_id = pd.id),
        NOW()
      ) + INTERVAL '5 hours'
      ELSE NULL
    END AS picked_up_at
  FROM parcel.parcel_drafts pd
  WHERE pd.drop_off_point_id IS NOT NULL
),
hub_capacity AS (
  SELECT
    id::text      AS hub_id,
    name          AS hub_name,
    COALESCE(storage_capacity, 100) AS capacity
  FROM routing.operator_hubs
),
stored_now AS (
  SELECT
    phr.hub_id,
    COUNT(*) AS current_stored
  FROM phr
  WHERE phr.picked_up_at IS NULL
  GROUP BY phr.hub_id
),
incoming_4h AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*)                   AS arrivals_4h
  FROM parcel.parcel_drafts pd
  JOIN parcel.parcel_draft_items pdi ON pdi.parcel_draft_id = pd.id
  WHERE pd.status IN ('submitted', 'in_transit')
    AND pd.drop_off_point_id IS NOT NULL
    AND pdi.created_at >= NOW() - INTERVAL '4 hours'
  GROUP BY pd.drop_off_point_id
),
incoming_24h AS (
  SELECT
    pd.drop_off_point_id::text AS hub_id,
    COUNT(*)                   AS arrivals_24h
  FROM parcel.parcel_drafts pd
  JOIN parcel.parcel_draft_items pdi ON pdi.parcel_draft_id = pd.id
  WHERE pd.status IN ('submitted', 'in_transit')
    AND pd.drop_off_point_id IS NOT NULL
    AND pdi.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY pd.drop_off_point_id
)
SELECT
  hc.hub_id,
  hc.hub_name,
  hc.capacity,
  COALESCE(sn.current_stored, 0)  AS current_stored,
  COALESCE(i4.arrivals_4h, 0)     AS forecast_4h,
  COALESCE(i24.arrivals_24h, 0)   AS forecast_24h,
  ROUND(
    ((COALESCE(sn.current_stored, 0) + COALESCE(i4.arrivals_4h, 0))::numeric
      / NULLIF(hc.capacity, 0)::numeric) * 100, 1
  )                               AS forecast_4h_pct,
  ROUND(
    ((COALESCE(sn.current_stored, 0) + COALESCE(i24.arrivals_24h, 0))::numeric
      / NULLIF(hc.capacity, 0)::numeric) * 100, 1
  )                               AS forecast_24h_pct
FROM hub_capacity hc
LEFT JOIN stored_now sn      ON sn.hub_id = hc.hub_id
LEFT JOIN incoming_4h i4     ON i4.hub_id = hc.hub_id
LEFT JOIN incoming_24h i24   ON i24.hub_id = hc.hub_id;

-- View 6: parcel.vw_pakiship_prescriptive
CREATE OR REPLACE VIEW parcel.vw_pakiship_prescriptive AS
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
FROM parcel.vw_pakiship_descriptive d
LEFT JOIN parcel.vw_pakiship_predictive p ON p.hub_id = d.hub_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SURGE RPC FUNCTION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION routing.fn_execute_surge_action(
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
  INSERT INTO routing.actuation_logs (location_id, threat_detected, action_taken, platform)
  VALUES (p_location_id, p_threat, p_action, p_platform)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Grant permissions to authenticated and anon roles (Custom Schemas only)
GRANT EXECUTE ON FUNCTION routing.fn_execute_surge_action(TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT SELECT ON parcel.vw_hub_dwell_times TO authenticated, anon;
GRANT SELECT ON parcel.vw_hub_volume_forecast TO authenticated, anon;
GRANT SELECT ON parcel.vw_pakiship_actionable_insights TO authenticated, anon;
GRANT SELECT ON parcel.vw_pakiship_descriptive TO authenticated, anon;
GRANT SELECT ON parcel.vw_pakiship_predictive TO authenticated, anon;
GRANT SELECT ON parcel.vw_pakiship_prescriptive TO authenticated, anon;
GRANT SELECT, INSERT ON routing.actuation_logs TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON driver.driver_ratings TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON driver.driver_sessions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON parcel.lost_parcel_cases TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON parcel.lost_parcel_case_events TO authenticated, anon;
