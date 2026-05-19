/**
 * supabaseSchema.ts
 *
 * Direct Supabase queries for the PakiShip Operational Dashboard.
 * Queries three schemas:
 *   - parcel  → shipments / driver_jobs / driver_job_events
 *   - driver  → driver profiles and accounts
 *   - routing → drop-off operators / hubs
 *
 * All functions return safe defaults (empty arrays, 0 counts) if the
 * connection fails so the UI always renders without crashing.
 */

import { supabase } from './supabase';

// ─── Shared Types ────────────────────────────────────────────────────────────

export type ShipmentStatus = 'In Transit' | 'Pending' | 'Delivered' | 'Cancelled';
export type DriverStatus = 'available' | 'on_delivery' | 'offline' | 'suspended' | 'deactivated';
export type OperatorStatus = 'active' | 'limited' | 'inactive' | 'suspended' | 'deactivated';

export interface ShipmentRow {
  id: string;
  store: string;
  sender: string;
  receiver: string;
  location: string;
  destination: string;
  quantity: string;
  amount: string;
  status: ShipmentStatus;
  driver: string;
  eta: string;
  date: string;
}

export interface DriverRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  rating: number;
  status: DriverStatus;
  accountStanding: string;
  completedDeliveries: number;
  vehicleType: string;
  lastActive: string;
  onTimeRate: number;
  cancellationRate: number;
  acceptanceRate: number;
  averageDeliveryTime: string;
}

export interface OperatorRow {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  region: string;
  address: string;
  status: OperatorStatus;
  accountStanding: string;
  parcelsHandled: number;
  pendingParcels: number;
  lastActive: string;
  operatingHours: string;
  averageRating: number;
  issueRate: number;
  successfulHandoffRate: number;
}

export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  pendingShipments: number;
  cancelledShipments: number;
  totalDrivers: number;
  availableDrivers: number;
  onDeliveryDrivers: number;
  totalOperators: number;
  activeOperators: number;
  totalParcelsHandled: number;
}

// ─── Parcel Schema ───────────────────────────────────────────────────────────

/**
 * Fetch all shipments from the parcel schema (driver_jobs table).
 * Falls back to [] on error.
 */
export async function fetchShipments(): Promise<ShipmentRow[]> {
  try {
    const { data, error } = await supabase
      .schema('parcel')
      .from('driver_jobs')
      .select(`
        id,
        store_name,
        sender_name,
        receiver_name,
        pickup_address,
        delivery_address,
        quantity,
        amount,
        status,
        driver_name,
        eta,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!data) return [];

    return data.map((row): ShipmentRow => ({
      id: row.id ?? '',
      store: row.store_name ?? '',
      sender: row.sender_name ?? '',
      receiver: row.receiver_name ?? '',
      location: row.pickup_address ?? '',
      destination: row.delivery_address ?? '',
      quantity: row.quantity ?? '',
      amount: row.amount ?? '',
      status: normalizeShipmentStatus(row.status),
      driver: row.driver_name ?? 'Unassigned',
      eta: row.eta ?? 'N/A',
      date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch distinct driver names from the parcel schema for the filter dropdown.
 */
export async function fetchShipmentDriverNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .schema('parcel')
      .from('driver_jobs')
      .select('driver_name')
      .not('driver_name', 'is', null);

    if (error) throw error;
    if (!data) return [];

    const names = Array.from(new Set(data.map((row) => row.driver_name as string).filter(Boolean))).sort();
    return names;
  } catch {
    return [];
  }
}

/**
 * Update a shipment's status in the parcel schema.
 */
export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  reason: string,
  updatedBy: string,
): Promise<ShipmentRow | null> {
  try {
    // Append an event to driver_job_events
    await supabase
      .schema('parcel')
      .from('driver_job_events')
      .insert({
        driver_job_id: id,
        from_status: null,
        to_status: status,
        reason,
        updated_by: updatedBy,
      });

    // Update the job status
    const { data, error } = await supabase
      .schema('parcel')
      .from('driver_jobs')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id ?? '',
      store: data.store_name ?? '',
      sender: data.sender_name ?? '',
      receiver: data.receiver_name ?? '',
      location: data.pickup_address ?? '',
      destination: data.delivery_address ?? '',
      quantity: data.quantity ?? '',
      amount: data.amount ?? '',
      status: normalizeShipmentStatus(data.status),
      driver: data.driver_name ?? 'Unassigned',
      eta: data.eta ?? 'N/A',
      date: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    };
  } catch {
    return null;
  }
}

// ─── Driver Schema ────────────────────────────────────────────────────────────

/**
 * Fetch all drivers from the driver schema (profiles table).
 * Falls back to [] on error.
 */
export async function fetchDrivers(): Promise<DriverRow[]> {
  try {
    const { data, error } = await supabase
      .schema('driver')
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        region,
        city,
        rating,
        status,
        account_standing,
        completed_deliveries,
        vehicle_type,
        last_active,
        on_time_rate,
        cancellation_rate,
        acceptance_rate,
        average_delivery_time
      `)
      .order('full_name');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): DriverRow => ({
      id: row.id ?? '',
      name: row.full_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      region: row.region ?? '',
      city: row.city ?? '',
      rating: Number(row.rating ?? 0),
      status: normalizeDriverStatus(row.status),
      accountStanding: row.account_standing ?? 'active',
      completedDeliveries: Number(row.completed_deliveries ?? 0),
      vehicleType: row.vehicle_type ?? '',
      lastActive: row.last_active ?? '',
      onTimeRate: Number(row.on_time_rate ?? 0),
      cancellationRate: Number(row.cancellation_rate ?? 0),
      acceptanceRate: Number(row.acceptance_rate ?? 0),
      averageDeliveryTime: row.average_delivery_time ?? '',
    }));
  } catch {
    return [];
  }
}


// ─── Routing Schema ───────────────────────────────────────────────────────────

/**
 * Fetch all drop-off operators from the routing schema (hubs / drop_off_operators table).
 * Falls back to [] on error.
 */
export async function fetchOperators(): Promise<OperatorRow[]> {
  try {
    const { data, error } = await supabase
      .schema('routing')
      .from('drop_off_operators')
      .select(`
        id,
        business_name,
        owner_name,
        email,
        phone,
        location,
        region,
        address,
        status,
        account_standing,
        parcels_handled,
        pending_parcels,
        last_active,
        operating_hours,
        average_rating,
        issue_rate,
        successful_handoff_rate
      `)
      .order('business_name');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): OperatorRow => ({
      id: row.id ?? '',
      businessName: row.business_name ?? '',
      ownerName: row.owner_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      location: row.location ?? '',
      region: row.region ?? '',
      address: row.address ?? '',
      status: normalizeOperatorStatus(row.status),
      accountStanding: row.account_standing ?? 'active',
      parcelsHandled: Number(row.parcels_handled ?? 0),
      pendingParcels: Number(row.pending_parcels ?? 0),
      lastActive: row.last_active ?? '',
      operatingHours: row.operating_hours ?? '',
      averageRating: Number(row.average_rating ?? 0),
      issueRate: Number(row.issue_rate ?? 0),
      successfulHandoffRate: Number(row.successful_handoff_rate ?? 0),
    }));
  } catch {
    return [];
  }
}


// ─── Dashboard Aggregate Stats ────────────────────────────────────────────────

/**
 * Fetch aggregated stats for the dashboard from all three schemas.
 * Returns zeroed-out stats on any error.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const zero: DashboardStats = {
    totalShipments: 0,
    activeShipments: 0,
    deliveredShipments: 0,
    pendingShipments: 0,
    cancelledShipments: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    onDeliveryDrivers: 0,
    totalOperators: 0,
    activeOperators: 0,
    totalParcelsHandled: 0,
  };

  try {
    const [shipmentsResult, driversResult, operatorsResult] = await Promise.allSettled([
      supabase.schema('parcel').from('driver_jobs').select('status'),
      supabase.schema('driver').from('profiles').select('status'),
      supabase.schema('routing').from('drop_off_operators').select('status, parcels_handled'),
    ]);

    // Parcel schema
    if (shipmentsResult.status === 'fulfilled' && !shipmentsResult.value.error && shipmentsResult.value.data) {
      const rows = shipmentsResult.value.data ?? [];
      zero.totalShipments = rows.length;
      zero.activeShipments = rows.filter((r) => normalizeShipmentStatus(r.status) === 'In Transit').length;
      zero.deliveredShipments = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Delivered').length;
      zero.pendingShipments = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Pending').length;
      zero.cancelledShipments = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Cancelled').length;
    } else {
      // fallback shipments
      zero.totalShipments = 0;
      zero.activeShipments = 0;
      zero.deliveredShipments = 0;
      zero.pendingShipments = 0;
      zero.cancelledShipments = 0;
    }

    // Driver schema
    if (driversResult.status === 'fulfilled' && !driversResult.value.error && driversResult.value.data) {
      const rows = driversResult.value.data ?? [];
      zero.totalDrivers = rows.length;
      zero.availableDrivers = rows.filter((r) => normalizeDriverStatus(r.status) === 'available').length;
      zero.onDeliveryDrivers = rows.filter((r) => normalizeDriverStatus(r.status) === 'on_delivery').length;
    } else {
      zero.totalDrivers = 0;
      zero.availableDrivers = 0;
      zero.onDeliveryDrivers = 0;
    }

    // Routing schema
    if (operatorsResult.status === 'fulfilled' && !operatorsResult.value.error && operatorsResult.value.data) {
      const rows = operatorsResult.value.data ?? [];
      zero.totalOperators = rows.length;
      zero.activeOperators = rows.filter((r) => normalizeOperatorStatus(r.status) === 'active').length;
      zero.totalParcelsHandled = rows.reduce((sum, r) => sum + Number(r.parcels_handled ?? 0), 0);
    } else {
      zero.totalOperators = 0;
      zero.activeOperators = 0;
      zero.totalParcelsHandled = 0;
    }
  } catch {
    // Return zero stats
  }

  return zero;
}


// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsChanges {
  revenue: string | null;
  delivered: string | null;
  pending: string | null;
  cancelled: string | null;
  lostReports: string | null;
  revenueUp: boolean;
  deliveredUp: boolean;
  pendingUp: boolean;
  cancelledUp: boolean;
  lostReportsUp: boolean;
}

export interface AnalyticsStats {
  revenue: number;
  delivered: number;
  pending: number;
  cancelled: number;
  lostReports: number;
  shipmentVolume: Array<{ month: string; revenue: number }>;
  topDrivers: Array<{ name: string; completion: string; rating: string }>;
  totalDrivers: number;
  onDeliveryDrivers: number;
  activeNowDrivers: number;
  changes: AnalyticsChanges;
}

/** Compute a formatted % change string between two values. Returns null when prior is 0. */
function pctChange(current: number, prior: number): { label: string | null; up: boolean } {
  if (prior === 0) return { label: null, up: true };
  const delta = ((current - prior) / prior) * 100;
  const sign = delta >= 0 ? '+' : '';
  return { label: `${sign}${delta.toFixed(1)}%`, up: delta >= 0 };
}

export async function fetchAnalyticsStats(range: 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Year to Date'): Promise<AnalyticsStats> {
  const nullChanges: AnalyticsChanges = {
    revenue: null, delivered: null, pending: null, cancelled: null, lostReports: null,
    revenueUp: true, deliveredUp: true, pendingUp: false, cancelledUp: false, lostReportsUp: false,
  };
  const zero: AnalyticsStats = {
    revenue: 0, delivered: 0, pending: 0, cancelled: 0, lostReports: 0,
    shipmentVolume: [], topDrivers: [], totalDrivers: 0, onDeliveryDrivers: 0, activeNowDrivers: 0,
    changes: nullChanges,
  };

  try {
    const now = new Date();
    let currentSince: Date;
    let priorSince: Date;
    let priorUntil: Date;

    if (range === 'Today') {
      currentSince = new Date(now); currentSince.setHours(0, 0, 0, 0);
      priorSince = new Date(currentSince); priorSince.setDate(priorSince.getDate() - 1);
      priorUntil = new Date(currentSince);
    } else if (range === 'Last 7 Days') {
      currentSince = new Date(now); currentSince.setDate(now.getDate() - 7);
      priorSince = new Date(currentSince); priorSince.setDate(priorSince.getDate() - 7);
      priorUntil = new Date(currentSince);
    } else if (range === 'Last 30 Days') {
      currentSince = new Date(now); currentSince.setDate(now.getDate() - 30);
      priorSince = new Date(currentSince); priorSince.setDate(priorSince.getDate() - 30);
      priorUntil = new Date(currentSince);
    } else {
      // Year to Date — compare against same YTD span of previous year
      currentSince = new Date(now.getFullYear(), 0, 1);
      priorSince = new Date(now.getFullYear() - 1, 0, 1);
      priorUntil = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    const currentISO = currentSince.toISOString();
    const priorSinceISO = priorSince.toISOString();
    const priorUntilISO = priorUntil.toISOString();

    const [curJobsRes, prevJobsRes, curLostRes, prevLostRes, driversRes] = await Promise.allSettled([
      supabase.schema('parcel').from('driver_jobs').select('status, amount, created_at').gte('created_at', currentISO),
      supabase.schema('parcel').from('driver_jobs').select('status, amount, created_at').gte('created_at', priorSinceISO).lt('created_at', priorUntilISO),
      supabase.schema('parcel').from('lost_parcel_cases').select('status, created_at').gte('created_at', currentISO),
      supabase.schema('parcel').from('lost_parcel_cases').select('status, created_at').gte('created_at', priorSinceISO).lt('created_at', priorUntilISO),
      supabase.schema('driver').from('profiles').select('status, full_name, rating, on_time_rate'),
    ]);

    // ── Current period ──
    let curRevenue = 0, curDelivered = 0, curPending = 0, curCancelled = 0;
    const volumeMap: Record<string, number> = {};
    if (curJobsRes.status === 'fulfilled' && !curJobsRes.value.error) {
      const rows = curJobsRes.value.data ?? [];
      curDelivered = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Delivered').length;
      curPending = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Pending').length;
      curCancelled = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Cancelled').length;
      curRevenue = rows.reduce((sum, r) => sum + Number((r.amount ?? '0').toString().replace(/[^\d.]/g, '') || 0), 0);

      rows.forEach((r) => {
        const date = new Date(r.created_at);
        let label = '';
        if (range === 'Today') {
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (range === 'Last 7 Days') {
          label = date.toLocaleDateString([], { weekday: 'short' });
        } else if (range === 'Last 30 Days') {
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
          label = date.toLocaleDateString([], { month: 'short' });
        }
        const amt = Number((r.amount ?? '0').toString().replace(/[^\d.]/g, '') || 0);
        volumeMap[label] = (volumeMap[label] || 0) + amt;
      });
    }

    zero.shipmentVolume = Object.entries(volumeMap).map(([month, revenue]) => ({ month, revenue }));
    if (zero.shipmentVolume.length === 0) {
      zero.shipmentVolume = [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 49000 },
        { month: 'Apr', revenue: 63000 },
        { month: 'May', revenue: 58000 },
        { month: 'Jun', revenue: 71000 },
      ];
    }

    let curLost = 0;
    if (curLostRes.status === 'fulfilled' && !curLostRes.value.error) {
      const rows = curLostRes.value.data ?? [];
      curLost = rows.filter((r) => !['closed', 'refunded', 'found'].includes((r.status ?? '').toLowerCase())).length;
    }

    // ── Prior period ──
    let prevRevenue = 0, prevDelivered = 0, prevPending = 0, prevCancelled = 0;
    if (prevJobsRes.status === 'fulfilled' && !prevJobsRes.value.error) {
      const rows = prevJobsRes.value.data ?? [];
      prevDelivered = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Delivered').length;
      prevPending = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Pending').length;
      prevCancelled = rows.filter((r) => normalizeShipmentStatus(r.status) === 'Cancelled').length;
      prevRevenue = rows.reduce((sum, r) => sum + Number((r.amount ?? '0').toString().replace(/[^\d.]/g, '') || 0), 0);
    }

    let prevLost = 0;
    if (prevLostRes.status === 'fulfilled' && !prevLostRes.value.error) {
      const rows = prevLostRes.value.data ?? [];
      prevLost = rows.filter((r) => !['closed', 'refunded', 'found'].includes((r.status ?? '').toLowerCase())).length;
    }

    // ── Driver stats ──
    if (driversRes.status === 'fulfilled' && !driversRes.value.error) {
      const rows = driversRes.value.data ?? [];
      zero.totalDrivers = rows.length;
      zero.onDeliveryDrivers = rows.filter((r) => normalizeDriverStatus(r.status) === 'on_delivery').length;
      zero.activeNowDrivers = rows.filter((r) => ['available', 'on_delivery'].includes(normalizeDriverStatus(r.status))).length;
      zero.topDrivers = [...rows]
        .sort((a, b) => Number(b.on_time_rate ?? 0) - Number(a.on_time_rate ?? 0))
        .slice(0, 3)
        .map((r) => ({ name: r.full_name ?? '', completion: `${r.on_time_rate ?? 0}%`, rating: Number(r.rating ?? 0).toFixed(1) }));
    }

    // ── Assign current values & changes ──
    zero.revenue = curRevenue;
    zero.delivered = curDelivered;
    zero.pending = curPending;
    zero.cancelled = curCancelled;
    zero.lostReports = curLost;

    const revChange = pctChange(curRevenue, prevRevenue);
    const delChange = pctChange(curDelivered, prevDelivered);
    const penChange = pctChange(curPending, prevPending);
    const canChange = pctChange(curCancelled, prevCancelled);
    const losChange = pctChange(curLost, prevLost);

    zero.changes = {
      revenue: revChange.label,
      delivered: delChange.label,
      pending: penChange.label,
      cancelled: canChange.label,
      lostReports: losChange.label,
      revenueUp: revChange.up,
      deliveredUp: delChange.up,
      pendingUp: penChange.up,
      cancelledUp: canChange.up,
      lostReportsUp: losChange.up,
    };
  } catch { /* return zeros */ }
  return zero;
}

// ─── Dashboard Live Feed ──────────────────────────────────────────────────────

export interface DashboardFeed {
  recentShipments: Array<{ store: string; location: string; amount: string; status: string }>;
  pendingDriverApps: number;
  openLostParcels: number;
}

export async function fetchDashboardFeed(): Promise<DashboardFeed> {
  const empty: DashboardFeed = { recentShipments: [], pendingDriverApps: 0, openLostParcels: 0 };
  try {
    const [shipmentsRes, appsRes, lostRes] = await Promise.allSettled([
      supabase.schema('parcel').from('driver_jobs')
        .select('store_name, pickup_address, amount, status')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.schema('driver').from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.schema('parcel').from('lost_parcel_cases')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'investigating']),
    ]);

    if (shipmentsRes.status === 'fulfilled' && !shipmentsRes.value.error) {
      empty.recentShipments = (shipmentsRes.value.data ?? []).map((r) => ({
        store: r.store_name ?? 'Unknown',
        location: r.pickup_address ?? '',
        amount: Number((r.amount ?? '0').toString().replace(/[^\d.]/g, '') || 0).toLocaleString('en-PH'),
        status: normalizeShipmentStatus(r.status),
      }));
    }
    if (appsRes.status === 'fulfilled' && !appsRes.value.error) {
      empty.pendingDriverApps = appsRes.value.count ?? 0;
    }
    if (lostRes.status === 'fulfilled' && !lostRes.value.error) {
      empty.openLostParcels = lostRes.value.count ?? 0;
    }
  } catch { /* return empty */ }
  return empty;
}

// ─── Lost Parcel Cases ────────────────────────────────────────────────────────

export type LostParcelStatus = 'open' | 'investigating' | 'found' | 'refunded' | 'closed';

export interface LostParcelCaseRow {
  id: string;
  parcelId: string;
  affectedCustomer: string;
  customerEmail: string;
  route: string;
  parcelValue: number;
  dateReported: string;
  status: LostParcelStatus;
  assignedTeam: string;
  lastKnownLocation: string;
  lastKnownTimestamp: string;
  statusHistory: Array<{ id: string; status: string; timestamp: string; updatedBy: string; note: string }>;
  timeline: Array<{ id: string; label: string; location: string; timestamp: string; status: string; note: string }>;
  assignedDriver: { name: string; phone: string; vehicle: string; rating: number; lastContact: string };
}

export async function fetchLostParcelCases(): Promise<LostParcelCaseRow[]> {
  try {
    const { data, error } = await supabase
      .schema('parcel')
      .from('lost_parcel_cases')
      .select(`
        id, parcel_id, affected_customer, customer_email, route,
        parcel_value, date_reported, status, assigned_team,
        last_known_location, last_known_timestamp,
        status_history, timeline, assigned_driver
      `)
      .order('date_reported', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): LostParcelCaseRow => ({
      id: row.id ?? '',
      parcelId: row.parcel_id ?? '',
      affectedCustomer: row.affected_customer ?? '',
      customerEmail: row.customer_email ?? '',
      route: row.route ?? '',
      parcelValue: Number(row.parcel_value ?? 0),
      dateReported: row.date_reported ?? '',
      status: normalizeLostStatus(row.status),
      assignedTeam: row.assigned_team ?? '',
      lastKnownLocation: row.last_known_location ?? '',
      lastKnownTimestamp: row.last_known_timestamp ?? '',
      statusHistory: Array.isArray(row.status_history) ? row.status_history : [],
      timeline: Array.isArray(row.timeline) ? row.timeline : [],
      assignedDriver: row.assigned_driver ?? { name: '', phone: '', vehicle: '', rating: 0, lastContact: '' },
    }));
  } catch {
    return [];
  }
}

export async function updateLostParcelStatus(id: string, status: LostParcelStatus, note: string, updatedBy: string): Promise<boolean> {
  const parcels = getStored('pakiship_lost_parcels', MOCK_LOST_PARCEL_CASES);
  const updated = parcels.map(p => {
    if (p.id !== id) return p;
    const newHistory = [
      ...(p.statusHistory || []),
      {
        id: `ISH-${id}-${(p.statusHistory || []).length + 1}`,
        status,
        timestamp: new Date().toISOString(),
        updatedBy,
        note
      }
    ];
    return {
      ...p,
      status,
      statusHistory: newHistory
    };
  });
  setStored('pakiship_lost_parcels', updated);

  try {
    const { error } = await supabase
      .schema('parcel')
      .from('lost_parcel_cases')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;

    await supabase.schema('parcel').from('lost_parcel_case_events').insert({
      case_id: id, status, note, updated_by: updatedBy, timestamp: new Date().toISOString(),
    });
    return true;
  } catch {
    return true;
  }
}


// ─── User Acceptance Applications ─────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface DriverApplicationRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  applicationDate: string;
  documentCount: number;
  status: ApplicationStatus;
  accountStatus: 'inactive' | 'active';
  activatedDate?: string;
  vehicleType?: string;
  plateNumber?: string;
  documents: Array<{ name: string; size: string; uploadDate: string; url: string }>;
}

export interface BusinessApplicationRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  applicationDate: string;
  documentCount: number;
  status: ApplicationStatus;
  accountStatus: 'inactive' | 'active';
  activatedDate?: string;
  businessName?: string;
  businessType?: string;
  documents: Array<{ name: string; size: string; uploadDate: string; url: string }>;
}

export interface DropOffApplicationRow {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  dateApplied: string;
  status: ApplicationStatus;
  platformStatus: 'inactive' | 'active';
  activatedDate?: string;
  rejectionReason?: string;
  businessDocuments: Array<{ name: string; requirement: string; size: string; uploadDate: string; url: string; verificationStatus: string }>;
}

export async function fetchDriverApplications(): Promise<DriverApplicationRow[]> {
  try {
    const { data, error } = await supabase
      .schema('driver')
      .from('applications')
      .select('id, full_name, email, phone, region, application_date, status, account_status, activated_date, vehicle_type, plate_number, documents')
      .order('application_date', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): DriverApplicationRow => ({
      id: row.id ?? '',
      name: row.full_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      region: row.region ?? '',
      applicationDate: row.application_date ?? '',
      documentCount: Array.isArray(row.documents) ? row.documents.length : 0,
      status: normalizeAppStatus(row.status),
      accountStatus: row.account_status === 'active' ? 'active' : 'inactive',
      activatedDate: row.activated_date ?? undefined,
      vehicleType: row.vehicle_type ?? '',
      plateNumber: row.plate_number ?? '',
      documents: Array.isArray(row.documents) ? row.documents : [],
    }));
  } catch {
    return [];
  }
}

export async function fetchBusinessApplications(): Promise<BusinessApplicationRow[]> {
  try {
    const { data, error } = await supabase
      .schema('driver')
      .from('business_applications')
      .select('id, full_name, email, phone, region, application_date, status, account_status, activated_date, business_name, business_type, documents')
      .order('application_date', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): BusinessApplicationRow => ({
      id: row.id ?? '',
      name: row.full_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      region: row.region ?? '',
      applicationDate: row.application_date ?? '',
      documentCount: Array.isArray(row.documents) ? row.documents.length : 0,
      status: normalizeAppStatus(row.status),
      accountStatus: row.account_status === 'active' ? 'active' : 'inactive',
      activatedDate: row.activated_date ?? undefined,
      businessName: row.business_name ?? '',
      businessType: row.business_type ?? '',
      documents: Array.isArray(row.documents) ? row.documents : [],
    }));
  } catch {
    return [];
  }
}

export async function fetchDropOffApplications(): Promise<DropOffApplicationRow[]> {
  try {
    const { data, error } = await supabase
      .schema('routing')
      .from('operator_applications')
      .select('id, business_name, owner_name, email, phone, location, address, date_applied, status, platform_status, activated_date, rejection_reason, business_documents')
      .order('date_applied', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row): DropOffApplicationRow => ({
      id: row.id ?? '',
      businessName: row.business_name ?? '',
      ownerName: row.owner_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      location: row.location ?? '',
      address: row.address ?? '',
      dateApplied: row.date_applied ?? '',
      status: normalizeAppStatus(row.status),
      platformStatus: row.platform_status === 'active' ? 'active' : 'inactive',
      activatedDate: row.activated_date ?? undefined,
      rejectionReason: row.rejection_reason ?? undefined,
      businessDocuments: Array.isArray(row.business_documents) ? row.business_documents : [],
    }));
  } catch {
    return [];
  }
}

export async function approveApplication(schema: 'driver' | 'routing', table: string, id: string): Promise<boolean> {
  const activatedDate = new Date().toISOString().split('T')[0];

  if (schema === 'driver') {
    if (table === 'applications') {
      const apps = getStored('pakiship_driver_apps', MOCK_DRIVER_APPLICATIONS);
      const updated = apps.map(a => a.id === id ? { ...a, status: 'approved' as const, accountStatus: 'active' as const, activatedDate } : a);
      setStored('pakiship_driver_apps', updated);

      const app = apps.find(a => a.id === id);
      if (app) {
        const drivers = getStored('pakiship_drivers', MOCK_DRIVERS);
        if (!drivers.some(d => d.email === app.email)) {
          const newDrv: DriverRow = {
            id: app.id.replace('DAPP', 'DRV'),
            name: app.name,
            email: app.email,
            phone: app.phone,
            region: app.region,
            city: 'Manila',
            rating: 5.0,
            status: 'available',
            accountStanding: 'active',
            completedDeliveries: 0,
            vehicleType: app.vehicleType ?? 'Motorcycle',
            lastActive: new Date().toISOString(),
            onTimeRate: 100,
            cancellationRate: 0,
            acceptanceRate: 100,
            averageDeliveryTime: 'N/A'
          };
          drivers.push(newDrv);
          setStored('pakiship_drivers', drivers);
        }
      }
    } else if (table === 'business_applications') {
      const apps = getStored('pakiship_business_apps', MOCK_BUSINESS_APPLICATIONS);
      const updated = apps.map(a => a.id === id ? { ...a, status: 'approved' as const, accountStatus: 'active' as const, activatedDate } : a);
      setStored('pakiship_business_apps', updated);
    }
  } else if (schema === 'routing' && table === 'operator_applications') {
    const apps = getStored('pakiship_dropoff_apps', MOCK_DROPOFF_APPLICATIONS);
    const updated = apps.map(a => a.id === id ? { ...a, status: 'approved' as const, platformStatus: 'active' as const, activatedDate } : a);
    setStored('pakiship_dropoff_apps', updated);

    const app = apps.find(a => a.id === id);
    if (app) {
      const operators = getStored('pakiship_operators', MOCK_OPERATORS);
      if (!operators.some(o => o.email === app.email)) {
        const newOp: OperatorRow = {
          id: app.id.replace('OAPP', 'OP'),
          businessName: app.businessName,
          ownerName: app.ownerName,
          email: app.email,
          phone: app.phone,
          location: app.location,
          region: 'NCR',
          address: app.address,
          status: 'active',
          accountStanding: 'active',
          parcelsHandled: 0,
          pendingParcels: 0,
          lastActive: new Date().toISOString(),
          operatingHours: '08:00 - 20:00',
          averageRating: 5.0,
          issueRate: 0,
          successfulHandoffRate: 100
        };
        operators.push(newOp);
        setStored('pakiship_operators', operators);
      }
    }
  }

  try {
    const { data: appData, error: fetchErr } = await supabase
      .schema(schema)
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (!fetchErr && appData) {
      if (schema === 'driver' && table === 'applications') {
        let profileId = appData.id.replace('DAPP', 'DRV');
        const { data: existing } = await supabase.schema('driver').from('profiles').select('id').eq('id', profileId);
        if (existing && existing.length > 0) {
          profileId = `DRV-${Math.floor(100 + Math.random() * 900)}`;
        }
        await supabase.schema('driver').from('profiles').insert({
          id: profileId,
          full_name: appData.full_name,
          email: appData.email,
          phone: appData.phone,
          region: appData.region,
          city: 'Manila',
          rating: 5.0,
          status: 'available',
          account_standing: 'active',
          completed_deliveries: 0,
          vehicle_type: appData.vehicle_type ?? 'Motorcycle',
          last_active: new Date().toISOString(),
          on_time_rate: 100,
          cancellation_rate: 0,
          acceptance_rate: 100,
          average_delivery_time: 'N/A'
        });
      } else if (schema === 'routing' && table === 'operator_applications') {
        let profileId = appData.id.replace('OAPP', 'OP');
        const { data: existing } = await supabase.schema('routing').from('drop_off_operators').select('id').eq('id', profileId);
        if (existing && existing.length > 0) {
          profileId = `OP-${Math.floor(100 + Math.random() * 900)}`;
        }
        await supabase.schema('routing').from('drop_off_operators').insert({
          id: profileId,
          business_name: appData.business_name,
          owner_name: appData.owner_name,
          email: appData.email,
          phone: appData.phone,
          location: appData.location,
          region: 'NCR',
          address: appData.address,
          status: 'active',
          account_standing: 'active',
          parcels_handled: 0,
          pending_parcels: 0,
          last_active: new Date().toISOString(),
          operating_hours: '08:00 - 20:00',
          average_rating: 5.0,
          issue_rate: 0,
          successful_handoff_rate: 100
        });
      }
    }

    const updatePayload: any = { status: 'approved', activated_date: activatedDate };
    if (schema === 'driver') {
      updatePayload.account_status = 'active';
    } else {
      updatePayload.platform_status = 'active';
    }

    const { error } = await supabase.schema(schema).from(table).update(updatePayload).eq('id', id);
    return !error;
  } catch (err) {
    console.error('approveApplication database error:', err);
    return true;
  }
}

export async function rejectApplication(schema: 'driver' | 'routing', table: string, id: string, reason: string): Promise<boolean> {
  if (schema === 'driver') {
    if (table === 'applications') {
      const apps = getStored('pakiship_driver_apps', MOCK_DRIVER_APPLICATIONS);
      const updated = apps.map(a => a.id === id ? { ...a, status: 'rejected' as const, accountStatus: 'inactive' as const, rejectionReason: reason } : a);
      setStored('pakiship_driver_apps', updated);
    } else if (table === 'business_applications') {
      const apps = getStored('pakiship_business_apps', MOCK_BUSINESS_APPLICATIONS);
      const updated = apps.map(a => a.id === id ? { ...a, status: 'rejected' as const, accountStatus: 'inactive' as const, rejectionReason: reason } : a);
      setStored('pakiship_business_apps', updated);
    }
  } else if (schema === 'routing' && table === 'operator_applications') {
    const apps = getStored('pakiship_dropoff_apps', MOCK_DROPOFF_APPLICATIONS);
    const updated = apps.map(a => a.id === id ? { ...a, status: 'rejected' as const, platformStatus: 'inactive' as const, rejectionReason: reason } : a);
    setStored('pakiship_dropoff_apps', updated);
  }

  try {
    const updatePayload: any = { status: 'rejected', rejection_reason: reason };
    if (schema === 'driver') {
      updatePayload.account_status = 'inactive';
    } else {
      updatePayload.platform_status = 'inactive';
    }
    const { error } = await supabase.schema(schema).from(table).update(updatePayload).eq('id', id);
    return !error;
  } catch {
    return true;
  }
}



// ─── Driver Detail (single driver with sub-records) ───────────────────────────

export async function fetchDriverDetail(driverId: string): Promise<DriverDetailRow | null> {
  try {
    const { data, error } = await supabase
      .schema('driver')
      .from('profiles')
      .select(`
        id, full_name, email, phone, region, city, rating, status,
        account_standing, completed_deliveries, vehicle_type, last_active,
        on_time_rate, cancellation_rate, acceptance_rate, average_delivery_time
      `)
      .eq('id', driverId)
      .single();

    if (error) throw error;
    if (!data) {
      const details = getStored('pakiship_driver_details', MOCK_DRIVER_DETAILS);
      return details[driverId] || null;
    }

    const fallbackDetails = getStored('pakiship_driver_details', MOCK_DRIVER_DETAILS)[driverId] || {};
    return {
      id: data.id ?? '',
      name: data.full_name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      region: data.region ?? '',
      city: data.city ?? '',
      rating: Number(data.rating ?? 0),
      status: normalizeDriverStatus(data.status),
      accountStanding: data.account_standing ?? 'active',
      accountActionReason: fallbackDetails.accountActionReason ?? undefined,
      accountActionDate: fallbackDetails.accountActionDate ?? undefined,
      completedDeliveries: Number(data.completed_deliveries ?? 0),
      vehicleType: data.vehicle_type ?? '',
      lastActive: data.last_active ?? '',
      onTimeRate: Number(data.on_time_rate ?? 0),
      cancellationRate: Number(data.cancellation_rate ?? 0),
      acceptanceRate: Number(data.acceptance_rate ?? 0),
      averageDeliveryTime: data.average_delivery_time ?? '',
      ratingsHistory: fallbackDetails.ratingsHistory ?? [],
      deliveryRecord: fallbackDetails.deliveryRecord ?? [],
    };
  } catch {
    const details = getStored('pakiship_driver_details', MOCK_DRIVER_DETAILS);
    return details[driverId] || null;
  }
}

export async function updateDriverAccountStatus(driverId: string, action: 'suspend' | 'reactivate' | 'deactivate', reason: string): Promise<boolean> {
  const standing = action === 'reactivate' ? 'active' : action === 'suspend' ? 'suspended' : 'deactivated';
  const status = action === 'reactivate' ? 'available' : action === 'suspend' ? 'suspended' : 'deactivated';

  const drivers = getStored('pakiship_drivers', MOCK_DRIVERS);
  const updatedDrivers = drivers.map(d => d.id === driverId ? { ...d, accountStanding: standing, status } : d);
  setStored('pakiship_drivers', updatedDrivers);

  const details = getStored('pakiship_driver_details', MOCK_DRIVER_DETAILS);
  if (details[driverId]) {
    details[driverId] = {
      ...details[driverId],
      accountStanding: standing,
      status,
      accountActionReason: reason,
      accountActionDate: new Date().toISOString().split('T')[0]
    };
    setStored('pakiship_driver_details', details);
  }

  try {
    const { error } = await supabase.schema('driver').from('profiles').update({
      account_standing: standing, status,
    }).eq('id', driverId);
    return !error;
  } catch {
    return true;
  }
}

export interface OperatorDetailRow extends OperatorRow {
  accountActionReason?: string;
  accountActionDate?: string;
  binCapacity: { totalBins: number; occupiedBins: number; reservedBins: number; availableBins: number; utilizationRate: number };
  dropOffHistory: Array<{ id: string; date: string; parcelsReceived: number; parcelsReleased: number; exceptions: number; status: string }>;
  customerRatings: Array<{ date: string; customer: string; rating: number; comment: string }>;
}

export async function fetchOperatorDetail(operatorId: string): Promise<OperatorDetailRow | null> {
  try {
    const { data, error } = await supabase
      .schema('routing')
      .from('drop_off_operators')
      .select(`
        id, business_name, owner_name, email, phone, location, region, address,
        status, account_standing, parcels_handled, pending_parcels, last_active,
        operating_hours, average_rating, issue_rate, successful_handoff_rate
      `)
      .eq('id', operatorId)
      .single();

    if (error) throw error;
    if (!data) {
      const details = getStored('pakiship_operator_details', MOCK_OPERATOR_DETAILS);
      return details[operatorId] || null;
    }

    const fallbackDetails = getStored('pakiship_operator_details', MOCK_OPERATOR_DETAILS)[operatorId] || {};
    return {
      id: data.id ?? '',
      businessName: data.business_name ?? '',
      ownerName: data.owner_name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      location: data.location ?? '',
      region: data.region ?? '',
      address: data.address ?? '',
      status: normalizeOperatorStatus(data.status),
      accountStanding: data.account_standing ?? 'active',
      accountActionReason: fallbackDetails.accountActionReason ?? undefined,
      accountActionDate: fallbackDetails.accountActionDate ?? undefined,
      parcelsHandled: Number(data.parcels_handled ?? 0),
      pendingParcels: Number(data.pending_parcels ?? 0),
      lastActive: data.last_active ?? '',
      operatingHours: data.operating_hours ?? '',
      averageRating: Number(data.average_rating ?? 0),
      issueRate: Number(data.issue_rate ?? 0),
      successfulHandoffRate: Number(data.successful_handoff_rate ?? 0),
      binCapacity: fallbackDetails.binCapacity ?? { totalBins: 0, occupiedBins: 0, reservedBins: 0, availableBins: 0, utilizationRate: 0 },
      dropOffHistory: fallbackDetails.dropOffHistory ?? [],
      customerRatings: fallbackDetails.customerRatings ?? [],
    };
  } catch {
    const details = getStored('pakiship_operator_details', MOCK_OPERATOR_DETAILS);
    return details[operatorId] || null;
  }
}

export async function updateOperatorAccountStatus(operatorId: string, action: 'suspend' | 'reactivate' | 'deactivate', reason: string): Promise<boolean> {
  const standing = action === 'reactivate' ? 'active' : action === 'suspend' ? 'suspended' : 'deactivated';
  const status = action === 'reactivate' ? 'active' : action === 'suspend' ? 'suspended' : 'deactivated';
  const hours = action === 'deactivate' ? 'Deactivated' : action === 'suspend' ? 'Suspended' : undefined;

  const operators = getStored('pakiship_operators', MOCK_OPERATORS);
  const updatedOperators = operators.map(o => o.id === operatorId ? {
    ...o, accountStanding: standing, status, ...(hours ? { operatingHours: hours } : {})
  } : o);
  setStored('pakiship_operators', updatedOperators);

  const details = getStored('pakiship_operator_details', MOCK_OPERATOR_DETAILS);
  if (details[operatorId]) {
    details[operatorId] = {
      ...details[operatorId],
      accountStanding: standing,
      status,
      accountActionReason: reason,
      accountActionDate: new Date().toISOString().split('T')[0],
      ...(hours ? { operatingHours: hours } : {})
    };
    setStored('pakiship_operator_details', details);
  }

  try {
    const { error } = await supabase.schema('routing').from('drop_off_operators').update({
      account_standing: standing, status,
      ...(hours ? { operating_hours: hours } : {}),
    }).eq('id', operatorId);
    return !error;
  } catch {
    return true;
  }
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeShipmentStatus(raw: string | null | undefined): ShipmentStatus {
  const map: Record<string, ShipmentStatus> = {
    'in_transit': 'In Transit',
    'in transit': 'In Transit',
    'in-transit': 'In Transit',
    'pending': 'Pending',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled',
  };
  return map[(raw ?? '').toLowerCase()] ?? 'Pending';
}

function normalizeDriverStatus(raw: string | null | undefined): DriverStatus {
  const map: Record<string, DriverStatus> = {
    'available': 'available',
    'on_delivery': 'on_delivery',
    'on delivery': 'on_delivery',
    'offline': 'offline',
    'suspended': 'suspended',
    'deactivated': 'deactivated',
  };
  return map[(raw ?? '').toLowerCase()] ?? 'offline';
}

function normalizeOperatorStatus(raw: string | null | undefined): OperatorStatus {
  const map: Record<string, OperatorStatus> = {
    'active': 'active',
    'limited': 'limited',
    'limited capacity': 'limited',
    'inactive': 'inactive',
    'suspended': 'suspended',
    'deactivated': 'deactivated',
  };
  return map[(raw ?? '').toLowerCase()] ?? 'inactive';
}

function normalizeLostStatus(raw: string | null | undefined): LostParcelStatus {
  const valid: LostParcelStatus[] = ['open', 'investigating', 'found', 'refunded', 'closed'];
  const val = (raw ?? '').toLowerCase() as LostParcelStatus;
  return valid.includes(val) ? val : 'open';
}

function normalizeAppStatus(raw: string | null | undefined): ApplicationStatus {
  const valid: ApplicationStatus[] = ['pending', 'approved', 'rejected'];
  const val = (raw ?? '').toLowerCase() as ApplicationStatus;
  return valid.includes(val) ? val : 'pending';
}

// ─── Local Storage Mocks Fallback ──────────────────────────────────────────

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const MOCK_DRIVERS: DriverRow[] = [
  {
    id: 'DRV-001',
    name: 'John Salazar',
    email: 'john.salazar@email.com',
    phone: '+63 917 406 1102',
    region: 'NCR',
    city: 'Manila',
    rating: 4.7,
    status: 'available',
    accountStanding: 'active',
    completedDeliveries: 142,
    vehicleType: 'Motorcycle',
    lastActive: '2026-05-14T17:10:00',
    onTimeRate: 96.5,
    cancellationRate: 1.2,
    acceptanceRate: 98.0,
    averageDeliveryTime: '24 mins'
  },
  {
    id: 'DRV-002',
    name: 'Mark Gonzales',
    email: 'mark.gonzales@email.com',
    phone: '+63 918 221 7044',
    region: 'NCR',
    city: 'Manila',
    rating: 4.5,
    status: 'on_delivery',
    accountStanding: 'active',
    completedDeliveries: 98,
    vehicleType: 'Motorcycle',
    lastActive: '2026-05-13T15:40:00',
    onTimeRate: 92.0,
    cancellationRate: 3.4,
    acceptanceRate: 94.0,
    averageDeliveryTime: '28 mins'
  },
  {
    id: 'DRV-003',
    name: 'Maria Reyes',
    email: 'maria.reyes@email.com',
    phone: '+63 915 602 3481',
    region: 'NCR',
    city: 'Manila',
    rating: 4.8,
    status: 'available',
    accountStanding: 'active',
    completedDeliveries: 210,
    vehicleType: 'Motorcycle',
    lastActive: '2026-05-12T14:25:00',
    onTimeRate: 98.2,
    cancellationRate: 0.5,
    acceptanceRate: 99.1,
    averageDeliveryTime: '19 mins'
  },
  {
    id: 'DRV-004',
    name: 'Leo Castillo',
    email: 'leo.castillo@email.com',
    phone: '+63 922 818 5530',
    region: 'NCR',
    city: 'Manila',
    rating: 4.4,
    status: 'offline',
    accountStanding: 'active',
    completedDeliveries: 76,
    vehicleType: 'Motorcycle',
    lastActive: '2026-05-11T12:20:00',
    onTimeRate: 89.5,
    cancellationRate: 4.0,
    acceptanceRate: 91.2,
    averageDeliveryTime: '32 mins'
  },
  {
    id: 'DRV-005',
    name: 'Anna Martinez',
    email: 'anna.martinez@email.com',
    phone: '+63 927 441 8920',
    region: 'NCR',
    city: 'Manila',
    rating: 4.6,
    status: 'suspended',
    accountStanding: 'suspended',
    completedDeliveries: 120,
    vehicleType: 'Motorcycle',
    lastActive: '2026-05-10T18:45:00',
    onTimeRate: 94.0,
    cancellationRate: 2.1,
    acceptanceRate: 95.5,
    averageDeliveryTime: '26 mins'
  }
];

const MOCK_DRIVER_DETAILS: Record<string, DriverDetailRow> = {
  'DRV-001': {
    ...MOCK_DRIVERS[0],
    accountActionReason: undefined,
    accountActionDate: undefined,
    ratingsHistory: [
      { date: '2026-05-14', rating: 5, customer: 'Carla Mendoza', comment: 'Rider was extremely polite and fast.' },
      { date: '2026-05-12', rating: 4, customer: 'Kevs Cruz', comment: 'Delivered in good condition.' }
    ],
    deliveryRecord: [
      { id: 'JOB-9982', destination: 'P. Noval, Sampaloc', region: 'NCR', completedAt: '2026-05-14T16:45:00', status: 'delivered', rating: 5 }
    ]
  },
  'DRV-002': { ...MOCK_DRIVERS[1], ratingsHistory: [], deliveryRecord: [] },
  'DRV-003': { ...MOCK_DRIVERS[2], ratingsHistory: [], deliveryRecord: [] },
  'DRV-004': { ...MOCK_DRIVERS[3], ratingsHistory: [], deliveryRecord: [] },
  'DRV-005': {
    ...MOCK_DRIVERS[4],
    accountActionReason: 'Frequent late deliveries beyond grace period.',
    accountActionDate: '2026-05-10',
    ratingsHistory: [],
    deliveryRecord: []
  }
};

const MOCK_OPERATORS: OperatorRow[] = [
  {
    id: 'OP-001',
    businessName: 'Lawson Lacson Ave',
    ownerName: 'Albert Dizon',
    email: 'lawson.lacson@email.com',
    phone: '+63 917 112 3344',
    location: 'Lacson Ave, Sampaloc',
    region: 'NCR',
    address: '1081 Lacson Ave, Sampaloc, Manila',
    status: 'active',
    accountStanding: 'active',
    parcelsHandled: 1250,
    pendingParcels: 14,
    lastActive: '2026-05-14T18:05:00',
    operatingHours: '06:00 - 23:00',
    averageRating: 4.8,
    issueRate: 0.2,
    successfulHandoffRate: 99.8
  },
  {
    id: 'OP-002',
    businessName: '7-Eleven Espana',
    ownerName: 'Clara Santos',
    email: '711.espana@email.com',
    phone: '+63 918 445 6677',
    location: 'Espana Blvd, Sampaloc',
    region: 'NCR',
    address: 'Espana Blvd cor. Asturias St, Sampaloc, Manila',
    status: 'active',
    accountStanding: 'active',
    parcelsHandled: 2310,
    pendingParcels: 32,
    lastActive: '2026-05-13T17:46:00',
    operatingHours: '24 Hours',
    averageRating: 4.6,
    issueRate: 0.5,
    successfulHandoffRate: 99.2
  },
  {
    id: 'OP-003',
    businessName: 'UST Overpass Drop-Off Counter',
    ownerName: 'Roberto Gomez',
    email: 'ust.counter@email.com',
    phone: '+63 919 778 9900',
    location: 'UST Overpass, Sampaloc',
    region: 'NCR',
    address: 'Espana Blvd, near UST Overpass, Sampaloc, Manila',
    status: 'limited',
    accountStanding: 'active',
    parcelsHandled: 850,
    pendingParcels: 45,
    lastActive: '2026-05-12T16:20:00',
    operatingHours: '08:00 - 20:00',
    averageRating: 4.2,
    issueRate: 2.1,
    successfulHandoffRate: 97.5
  },
  {
    id: 'OP-004',
    businessName: 'Asturias Partner Counter',
    ownerName: 'Elena Velez',
    email: 'asturias.counter@email.com',
    phone: '+63 922 111 2233',
    location: 'Asturias St, Sampaloc',
    region: 'NCR',
    address: 'Asturias St, Sampaloc, Manila',
    status: 'suspended',
    accountStanding: 'suspended',
    parcelsHandled: 520,
    pendingParcels: 0,
    lastActive: '2026-05-11T14:35:00',
    operatingHours: 'Closed',
    averageRating: 4.0,
    issueRate: 4.5,
    successfulHandoffRate: 95.0
  }
];

const MOCK_OPERATOR_DETAILS: Record<string, OperatorDetailRow> = {
  'OP-001': {
    ...MOCK_OPERATORS[0],
    accountActionReason: undefined,
    accountActionDate: undefined,
    binCapacity: { totalBins: 100, occupiedBins: 14, reservedBins: 5, availableBins: 81, utilizationRate: 14.0 },
    dropOffHistory: [
      { id: 'H-001', date: '2026-05-14', parcelsReceived: 45, parcelsReleased: 38, exceptions: 0, status: 'Completed' }
    ],
    customerRatings: [
      { date: '2026-05-14', customer: 'Bea Flores', rating: 5, comment: 'Great customer service!' }
    ]
  },
  'OP-002': { ...MOCK_OPERATORS[1], binCapacity: { totalBins: 200, occupiedBins: 32, reservedBins: 10, availableBins: 158, utilizationRate: 16.0 }, dropOffHistory: [], customerRatings: [] },
  'OP-003': { ...MOCK_OPERATORS[2], binCapacity: { totalBins: 150, occupiedBins: 45, reservedBins: 15, availableBins: 90, utilizationRate: 30.0 }, dropOffHistory: [], customerRatings: [] },
  'OP-004': {
    ...MOCK_OPERATORS[3],
    accountActionReason: 'Suspended due to high package exception rate.',
    accountActionDate: '2026-05-11',
    binCapacity: { totalBins: 80, occupiedBins: 0, reservedBins: 0, availableBins: 80, utilizationRate: 0.0 },
    dropOffHistory: [],
    customerRatings: []
  }
};

const MOCK_DRIVER_APPLICATIONS: DriverApplicationRow[] = [
  {
    id: 'DAPP-001',
    name: 'Carlos Yulo',
    email: 'carlos.yulo@email.com',
    phone: '09171234567',
    region: 'NCR',
    applicationDate: '2026-05-18',
    documentCount: 3,
    status: 'pending',
    accountStatus: 'inactive',
    vehicleType: 'Motorcycle',
    plateNumber: 'ABC 1234',
    documents: [
      { name: 'Professional License.pdf', size: '1.2 MB', uploadDate: '2026-05-18', url: '#' },
      { name: 'NBI Clearance.pdf', size: '950 KB', uploadDate: '2026-05-18', url: '#' },
      { name: 'ORCR Motorcycle.pdf', size: '2.1 MB', uploadDate: '2026-05-18', url: '#' }
    ]
  },
  {
    id: 'DAPP-002',
    name: 'EJ Obiena',
    email: 'ej.obiena@email.com',
    phone: '09187654321',
    region: 'Region IV-A',
    applicationDate: '2026-05-17',
    documentCount: 3,
    status: 'pending',
    accountStatus: 'inactive',
    vehicleType: 'Motorcycle',
    plateNumber: 'XYZ 7890',
    documents: [
      { name: 'Professional License.pdf', size: '1.4 MB', uploadDate: '2026-05-17', url: '#' },
      { name: 'NBI Clearance.pdf', size: '1.1 MB', uploadDate: '2026-05-17', url: '#' },
      { name: 'ORCR Motorcycle.pdf', size: '1.8 MB', uploadDate: '2026-05-17', url: '#' }
    ]
  }
];

const MOCK_BUSINESS_APPLICATIONS: BusinessApplicationRow[] = [
  {
    id: 'BAPP-001',
    name: 'Sarah Geronimo',
    email: 'sarah.g@email.com',
    phone: '09191112222',
    region: 'NCR',
    applicationDate: '2026-05-19',
    documentCount: 2,
    status: 'pending',
    accountStatus: 'inactive',
    businessName: 'Popstar Express Delivery',
    businessType: 'Logistics Service Provider',
    documents: [
      { name: 'SEC Registration.pdf', size: '3.4 MB', uploadDate: '2026-05-19', url: '#' },
      { name: 'Mayor Permit 2026.pdf', size: '2.1 MB', uploadDate: '2026-05-19', url: '#' }
    ]
  },
  {
    id: 'BAPP-002',
    name: 'Regine Velasquez',
    email: 'regine.v@email.com',
    phone: '09223334444',
    region: 'Region III',
    applicationDate: '2026-05-16',
    documentCount: 2,
    status: 'pending',
    accountStatus: 'inactive',
    businessName: 'Songbird Logistics Inc',
    businessType: 'Freight Forwarding',
    documents: [
      { name: 'DTI Certificate.pdf', size: '1.8 MB', uploadDate: '2026-05-16', url: '#' },
      { name: 'Mayor Permit 2026.pdf', size: '2.4 MB', uploadDate: '2026-05-16', url: '#' }
    ]
  }
];

const MOCK_DROPOFF_APPLICATIONS: DropOffApplicationRow[] = [
  {
    id: 'OAPP-001',
    businessName: 'Uncle John Asturias',
    ownerName: 'Juan Dela Cruz',
    email: 'unclejohns.asturias@email.com',
    phone: '09175556666',
    location: 'Asturias St, Sampaloc',
    address: '124 Asturias St, Sampaloc, Manila',
    dateApplied: '2026-05-19',
    status: 'pending',
    platformStatus: 'inactive',
    businessDocuments: [
      { name: 'DTI Certificate.pdf', requirement: 'Business Registration', size: '1.2 MB', uploadDate: '2026-05-19', url: '#', verificationStatus: 'verified' },
      { name: 'Barangay Clearance.pdf', requirement: 'Barangay Permit', size: '890 KB', uploadDate: '2026-05-19', url: '#', verificationStatus: 'pending' }
    ]
  },
  {
    id: 'OAPP-002',
    businessName: 'Lawson P. Noval',
    ownerName: 'Maria Clara',
    email: 'lawson.pnoval@email.com',
    phone: '09188889999',
    location: 'P. Noval, Sampaloc',
    address: '951 P. Noval St, Sampaloc, Manila',
    dateApplied: '2026-05-18',
    status: 'pending',
    platformStatus: 'inactive',
    businessDocuments: [
      { name: 'SEC Registration.pdf', requirement: 'Business Registration', size: '2.5 MB', uploadDate: '2026-05-18', url: '#', verificationStatus: 'verified' },
      { name: 'Mayor Permit.pdf', requirement: 'Mayor Permit', size: '1.7 MB', uploadDate: '2026-05-18', url: '#', verificationStatus: 'verified' }
    ]
  }
];

const MOCK_LOST_PARCEL_CASES: LostParcelCaseRow[] = [
  {
    id: 'LPC-1021',
    parcelId: 'PKS-2026-9982',
    affectedCustomer: 'Carla Mendoza',
    customerEmail: 'carla.mendoza@email.com',
    route: 'Lacson Ave to P. Noval',
    parcelValue: 12500,
    dateReported: '2026-05-14',
    status: 'investigating',
    statusHistory: [
      { id: 'ISH-1021-1', status: 'open', timestamp: '2026-05-14T18:05:00Z', updatedBy: 'Support Desk', note: 'Customer reported parcel missing after missed delivery scan.' },
      { id: 'ISH-1021-2', status: 'investigating', timestamp: '2026-05-14T18:22:00Z', updatedBy: 'Incident Response', note: 'Assigned to incident team for hub scan verification.' },
    ],
    assignedTeam: 'Incident Response',
    lastKnownLocation: 'PakiShip Sampaloc Sorting Desk',
    lastKnownTimestamp: '2026-05-14T16:45:00Z',
    assignedDriver: {
      name: 'John Salazar',
      phone: '+63 917 406 1102',
      vehicle: 'Motorcycle - NCR 4812',
      rating: 4.7,
      lastContact: '2026-05-14T17:10:00Z',
    },
    timeline: [
      { id: 'TL-001', label: 'Parcel accepted', location: 'Lawson Lacson Ave', timestamp: '2026-05-14T10:20:00Z', status: 'completed', note: 'Parcel scanned at partner counter.' },
      { id: 'TL-002', label: 'Driver pickup', location: 'Lawson Lacson Ave', timestamp: '2026-05-14T11:05:00Z', status: 'completed', note: 'Driver confirmed package pickup.' },
      { id: 'TL-003', label: 'Hub intake scan', location: 'PakiShip Sampaloc Sorting Desk', timestamp: '2026-05-14T16:45:00Z', status: 'flagged', note: 'Last confirmed scan before missing handoff.' },
      { id: 'TL-004', label: 'Customer delivery', location: 'P. Noval, Sampaloc', timestamp: '2026-05-14T18:30:00Z', status: 'pending', note: 'Delivery scan missing.' },
    ],
  },
  {
    id: 'LPC-1018',
    parcelId: 'PKS-2026-9824',
    affectedCustomer: 'Noel Ramirez',
    customerEmail: 'noel.ramirez@email.com',
    route: 'Espana Blvd to Dapitan',
    parcelValue: 8750,
    dateReported: '2026-05-13',
    status: 'investigating',
    statusHistory: [
      { id: 'ISH-1018-1', status: 'open', timestamp: '2026-05-13T17:18:00Z', updatedBy: 'Support Desk', note: 'Report created from missing receiving scan.' },
      { id: 'ISH-1018-2', status: 'investigating', timestamp: '2026-05-13T17:46:00Z', updatedBy: 'Dispatch Review', note: 'Rider and receiving point contacted for route confirmation.' },
    ],
    assignedTeam: 'Dispatch Review',
    lastKnownLocation: 'Espana Dispatch Bay',
    lastKnownTimestamp: '2026-05-13T15:15:00Z',
    assignedDriver: {
      name: 'Mark Gonzales',
      phone: '+63 918 221 7044',
      vehicle: 'Motorcycle - NCR 7720',
      rating: 4.5,
      lastContact: '2026-05-13T15:40:00Z',
    },
    timeline: [
      { id: 'TL-005', label: 'Parcel accepted', location: '7-Eleven Espana', timestamp: '2026-05-13T09:30:00Z', status: 'completed', note: 'Customer dropped parcel at counter.' },
      { id: 'TL-006', label: 'Dispatch assignment', location: 'Espana Dispatch Bay', timestamp: '2026-05-13T12:05:00Z', status: 'completed', note: 'Assigned to rider route batch ES-18.' },
      { id: 'TL-007', label: 'Route departure', location: 'Espana Dispatch Bay', timestamp: '2026-05-13T15:15:00Z', status: 'current', note: 'Last rider departure scan.' },
      { id: 'TL-008', label: 'Drop-off confirmation', location: 'Dapitan Receiving Point', timestamp: '2026-05-13T17:00:00Z', status: 'pending', note: 'Receiving scan not recorded.' },
    ],
  }
];


