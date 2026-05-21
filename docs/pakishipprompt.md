# Role & Context
You are a Senior Full-Stack Engineer and Data Architect. We are redesigning the PakiShip Admin Dashboard (`src/app/pakiship/dashboard/page.tsx`) to act as the operational interface for our new unified "PakiApps End-to-End Data Pipeline Architecture". 

The application uses Next.js, Tailwind CSS, and Recharts, powered directly by our Supabase/PostgreSQL backend.

# Critical Database Constraints
I have already defined my database in `src/backend/express/database/schema.sql` and the associated backend models. 
**DO NOT CREATE ANY NEW POSTGRESQL SCHEMAS.** All SQL views, functions, or queries you write must run against my existing default schema using my actual table names (e.g., `shipments`, `locations`, `driver_jobs`).

# The Northstar Objective
The dashboard must visually track our North Star Metric:
*"Hub Utilization Rate (Target: 75%)"* and autonomously orchestrate driver incentives and hub rebalancing to prevent deadlocks.

# Instructions Phase 1: Database Redesign (Supabase SQL)
Write the PostgreSQL DDL/DML to create the analytical views. Put these safely alongside my existing tables. Provide the raw SQL scripts.

1. **Descriptive View (Analytics Engines):** Create `vw_pakiship_descriptive`. Use **SQL Window Aggregations** to calculate current Hub Utilization (stored shipments vs location capacity), SLA compliance, and the Relay vs Direct delivery split.

2. **Predictive View (Machine Learning & Modeling Layer):** Create `vw_pakiship_predictive`. Build the backend logic for the **Real-Time Bypass Lane**. Use moving averages on incoming `shipments` to generate a **4h deadlock forecast** and a **24h hub overflow forecast**.

3. **Prescriptive View (Action Matrix):**
   Create `vw_pakiship_prescriptive`. Join the views above to output a `prescriptive_action`:
   - If 4h deadlock forecast > 90% capacity: "CRITICAL: Trigger +₱50 ALERT BONUS to Relay Drivers via Bypass Lane."
   - If Hub Utilization < 40% or > 85%: "WARNING: Generate Hub Rebalance Recommendation."
   - Else: "Stable (Near 75% Target)."

4. **Shared Audit Table:** Create `actuation_logs` (id, triggered_at, platform, location_id, threat_detected, action_taken) to log every time an admin executes an action. *(Use `CREATE TABLE IF NOT EXISTS` as it is shared with PakiPark).*

# Instructions Phase 2: Frontend Redesign (Next.js & Recharts)
Completely rewrite the UI in `src/app/pakiship/dashboard/page.tsx`.

## Layout Structure Requirements:

### Top Row: The Northstar Metrics (Hero Cards)
- **Hub Utilization Rate:** Current average utilization against the **75% Target**.
- **Real-Time Bypass Alerts:** The location at highest risk based on the **4h Deadlock / 24h Overflow Forecast**.
- **Delivery Mode Split:** Relay vs Direct delivery split percentage.

### Middle Row: Descriptive & Predictive Visuals (Recharts)
1. **Descriptive Bar Chart:** Use Recharts `<BarChart>` to show current utilization per hub. Color-code: Green (near 75%), Yellow (<40%), Red (>90%).
2. **Predictive Area Chart (Bypass Lane Forecast):** Use Recharts `<AreaChart>` plotting the forecasted incoming shipment volume. Draw a solid green reference line at the 75% Target and a solid red line at 100% capacity.

### Bottom Row: Prescriptive Actuations (Actionable UI)
Create an "Automated Actuations" panel. For every hub flagged in `vw_pakiship_prescriptive`, render a UI Card containing:
- The Threat: e.g., "Gateway Hub projected to hit 4h Deadlock."
- The Prescribed Action: e.g., "**Trigger +₱50 ALERT BONUS**" or "**Execute Hub Rebalance**".
- An Action Button: A primary button that calls a Supabase RPC to execute the action and logs it to `actuation_logs` (with platform set to 'pakiship').

# Constraints & Best Practices
1. **Component Modularity:** Break down the page into smaller components in `src/app/components/pakiship/`.
2. **Data Fetching:** Use `@supabase/supabase-js` to fetch from the newly created `vw_*` views.
3. **Error Handling:** Include skeletons for loading states and fallback UI. Provide SQL first, then React components.