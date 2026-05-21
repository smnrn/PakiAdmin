# Role & Context
You are a Senior Full-Stack Engineer and Data Architect. We are redesigning the PakiPark Admin Dashboard (`src/app/pakipark/dashboard/page.tsx`) to act as the operational interface for our new unified "PakiApps End-to-End Data Pipeline Architecture". 

The application uses Next.js, Tailwind CSS, and Recharts, powered directly by our Supabase/PostgreSQL backend.

# Critical Database Constraints
I have already defined my database in `src/backend/express/database/schema.sql` and the associated backend models. 
**DO NOT CREATE ANY NEW POSTGRESQL SCHEMAS.** All SQL views, functions, or queries you write must run against my existing default schema using my actual table names (e.g., `locations`, `bookings`, `parking_slots`, `vehicles`).

# The Northstar Objective
The dashboard must visually track our North Star Metric:
*"Slot Occupancy Rate (Target: 85%)"* and autonomously orchestrate dynamic pricing and penalty enforcements to prevent 4h facility deadlocks.

# Instructions Phase 1: Database Redesign (Supabase SQL)
Write the PostgreSQL DDL/DML to create the analytical views. Put these safely alongside my existing tables. Provide the raw SQL scripts.

1. **Descriptive View (Analytics Engines):** Create `vw_pakipark_descriptive`. Use **SQL Window Aggregations** on the `bookings` and `locations` tables to calculate current Slot Occupancy (active vehicles vs total slots) and identify active overstays (past check-out time).

2. **Predictive View (Machine Learning & Modeling Layer):** Create `vw_pakipark_predictive`. Build the backend logic for the **Real-Time Bypass Lane**. Use moving averages on active and upcoming `bookings` to generate a **4h deadlock forecast** for vehicle capacity.

3. **Prescriptive View (Action Matrix):**
   Create `vw_pakipark_prescriptive`. Join the views above to output a `prescriptive_action`:
   - If 4h deadlock forecast > 90% capacity: "CRITICAL: Trigger 1.5x Dynamic Surge Pricing via Bypass Lane to throttle demand."
   - If a vehicle overstays by >30 mins: "WARNING: Execute Escrow Forfeiture & Dispute Alert."
   - Else: "Stable (Near 85% Target)."

4. **Shared Audit Table:** Create `actuation_logs` (id, triggered_at, platform, location_id, threat_detected, action_taken) to log every time an admin executes an action. *(Use `CREATE TABLE IF NOT EXISTS` as it is shared with PakiShip).*

# Instructions Phase 2: Frontend Redesign (Next.js & Recharts)
Completely rewrite the UI in `src/app/pakipark/dashboard/page.tsx`.

## Layout Structure Requirements:

### Top Row: The Northstar Metrics (Hero Cards)
- **Slot Occupancy Rate:** Current average occupancy against the **85% Target**.
- **Real-Time Bypass Alerts:** The location at highest risk based on the **4h Deadlock Forecast**.
- **Enforcement Queue:** Count of active vehicles currently violating their time limits.

### Middle Row: Descriptive & Predictive Visuals (Recharts)
1. **Descriptive Bar Chart (Occupancy vs Yield):** Use Recharts `<ComposedChart>` to show current active cars vs total slots per location, with a line overlay showing current base rate/surge multiplier.
2. **Predictive Area Chart (Bypass Lane Forecast):** Use Recharts `<AreaChart>` plotting the forecasted incoming vehicle volume over the next 4 hours. Draw a solid red reference line indicating the physical deadlock limit.

### Bottom Row: Prescriptive Actuations (Actionable UI)
Create an "Automated Actuations" panel. For every location flagged in `vw_pakipark_prescriptive`, render a UI Card containing:
- The Threat: e.g., "Uptown Hub projected to hit 4h Deadlock (95% capacity)."
- The Prescribed Action: e.g., "**Trigger 1.5x Surge Pricing**" or "**Execute Escrow Forfeiture**".
- An Action Button: A primary button that calls a Supabase RPC to execute the action and logs it to `actuation_logs` (with platform set to 'pakipark').

# Constraints & Best Practices
1. **Component Modularity:** Break down the page into smaller components in `src/app/components/pakipark/`.
2. **Data Fetching:** Use `@supabase/supabase-js` to fetch from the newly created `vw_*` views.
3. **Error Handling:** Include skeletons for loading states and fallback UI. Provide SQL first, then React components.