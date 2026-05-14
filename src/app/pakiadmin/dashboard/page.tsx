'use client';

import { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCheck,
  CircleDollarSign,
  ClipboardCheck,
  LogOut,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';

import { ProtectedRoute } from '@/modules/components/ProtectedRoute';
import { useAuth } from '@/modules/contexts/AuthContext';
import { useNavigate } from '@/modules/lib/router';
import { pakiAdminLogo, pakiShipLogo } from '@/modules/lib/assets';

type TrendDirection = 'up' | 'down';

interface KpiMetric {
  label: string;
  value: string;
  trend: string;
  direction: TrendDirection;
  status: string;
  hint: string;
  icon: React.ReactNode;
  graph: number[];
  accent: {
    glow: string;
    iconWrap: string;
    graphStroke: string;
    graphFill: string;
  };
}

const kpiMetrics: KpiMetric[] = [
  {
    label: 'Active Shipments',
    value: '248',
    trend: '+8.4%',
    direction: 'up',
    status: '18 more in transit this shift',
    hint: 'Dispatch flow is holding steady across priority hubs.',
    icon: <PackageCheck className="h-5 w-5" />,
    graph: [24, 28, 30, 34, 39, 37, 44],
    accent: {
      glow: 'from-[#2bb7a9]/18 via-white to-white',
      iconWrap: 'bg-[#dff7f3] text-[#0f766e]',
      graphStroke: '#14b8a6',
      graphFill: 'rgba(20, 184, 166, 0.16)',
    },
  },
  {
    label: 'Pending Approvals',
    value: '19',
    trend: '-3.1%',
    direction: 'down',
    status: 'Queue is clearing faster today',
    hint: 'Review turnaround is improving for new admin and partner requests.',
    icon: <ClipboardCheck className="h-5 w-5" />,
    graph: [44, 41, 38, 33, 29, 24, 19],
    accent: {
      glow: 'from-[#34d399]/18 via-white to-white',
      iconWrap: 'bg-[#ddfce8] text-[#15803d]',
      graphStroke: '#22c55e',
      graphFill: 'rgba(34, 197, 94, 0.14)',
    },
  },
  {
    label: 'Open Lost Parcel Reports',
    value: '7',
    trend: '+1.6%',
    direction: 'up',
    status: '2 fresh cases need follow-up',
    hint: 'Containment is stable, but quick action keeps trust high.',
    icon: <AlertTriangle className="h-5 w-5" />,
    graph: [8, 9, 7, 8, 9, 6, 7],
    accent: {
      glow: 'from-[#facc15]/16 via-white to-white',
      iconWrap: 'bg-[#fef3c7] text-[#b45309]',
      graphStroke: '#f59e0b',
      graphFill: 'rgba(245, 158, 11, 0.14)',
    },
  },
  {
    label: 'Total Revenue',
    value: 'PHP 2.48M',
    trend: '+12.8%',
    direction: 'up',
    status: 'Weekly billings pacing ahead',
    hint: 'Higher completed volume and cleaner handoff rates are lifting revenue.',
    icon: <CircleDollarSign className="h-5 w-5" />,
    graph: [18, 22, 27, 31, 35, 42, 48],
    accent: {
      glow: 'from-[#0f766e]/18 via-white to-white',
      iconWrap: 'bg-[#d6fbf5] text-[#115e59]',
      graphStroke: '#0f766e',
      graphFill: 'rgba(15, 118, 110, 0.16)',
    },
  },
];

const adminAlerts = [
  {
    title: 'Approvals Waiting',
    value: '11 requests',
    detail: 'Most are vendor account extensions scheduled for today.',
  },
  {
    title: 'Parcel Escalations',
    value: '3 high priority',
    detail: 'One route in Sampaloc needs a same-day resolution note.',
  },
  {
    title: 'Settlement Health',
    value: '98.4% posted',
    detail: 'Only two remittance batches are still reconciling.',
  },
];

const overviewPills = [
  'Ops stable',
  'Approvals moving',
  'Risk controlled',
  'Revenue ahead',
];

function buildSparkline(values: number[]) {
  const width = 140;
  const height = 54;
  const padding = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return { areaPoints, points, width, height };
}

function MiniTrendGraph({
  values,
  stroke,
  fill,
}: {
  values: number[];
  stroke: string;
  fill: string;
}) {
  const { areaPoints, points, width, height } = useMemo(() => buildSparkline(values), [values]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-14 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fill-${stroke.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#fill-${stroke.replace(/[^a-zA-Z0-9]/g, '')})`}
      />
      <polyline
        fill="none"
        points={points}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function KpiCard({ metric }: { metric: KpiMetric }) {
  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendTone =
    metric.direction === 'up'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${metric.accent.glow} p-5 shadow-[0_24px_60px_-32px_rgba(15,118,110,0.45)] transition-transform duration-200 hover:-translate-y-1`}
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/30 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.accent.iconWrap} shadow-sm`}>
          {metric.icon}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${trendTone}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.trend}
        </span>
      </div>

      <div className="mt-5 space-y-1.5">
        <p className="text-sm font-semibold text-[#0f4f4a]/70">{metric.label}</p>
        <p className="text-3xl font-black tracking-tight text-[#06322e] md:text-[2rem]">{metric.value}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#11998e]">{metric.status}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#d9f3ef] bg-white/75 p-3">
        <MiniTrendGraph
          values={metric.graph}
          stroke={metric.accent.graphStroke}
          fill={metric.accent.graphFill}
        />
        <p className="mt-2 text-xs font-medium leading-5 text-[#245b56]">{metric.hint}</p>
      </div>
    </article>
  );
}

export default function Page() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const adminName = user?.name || 'Admin Operator';

  return (
    <ProtectedRoute app="pakiadmin">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_34%),linear-gradient(180deg,_#f4fffd_0%,_#ecfdfa_46%,_#f8fffe_100%)] text-[#0f3d39]">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <aside className="border-b border-[#d7efe9] bg-white/78 px-5 py-5 backdrop-blur-xl lg:min-h-screen lg:w-[280px] lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
            <div className="flex items-center justify-between lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ecfffb] shadow-[0_14px_32px_-22px_rgba(15,118,110,0.7)]">
                  <img src={pakiAdminLogo} alt="PakiAdmin" className="h-9 w-auto object-contain" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#11998e]">PakiShip Admin</p>
                  <h1 className="text-xl font-black tracking-tight text-[#06322e]">Control Dashboard</h1>
                </div>
              </div>
              <div className="hidden rounded-full border border-[#d5f3ed] bg-[#f3fffd] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f766e] md:inline-flex lg:mt-6">
                System Healthy
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-[#d9f3ef] bg-[linear-gradient(135deg,_#0f766e_0%,_#14b8a6_100%)] p-5 text-white shadow-[0_28px_60px_-38px_rgba(15,118,110,0.9)]">
              <div className="flex items-center justify-between">
                <img src={pakiShipLogo} alt="PakiShip" className="h-7 w-auto object-contain brightness-0 invert" />
                <ShieldCheck className="h-5 w-5 text-white/90" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-white/70">Overview Focus</p>
              <p className="mt-2 text-2xl font-black leading-tight">
                Quick health checks for shipments, approvals, incidents, and revenue.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Built for fast scanning so admins can spot pressure points before they turn into service issues.
              </p>
            </div>

            <nav className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
              {[
                { label: 'Overview', active: true },
                { label: 'Shipments', active: false },
                { label: 'Approvals', active: false },
                { label: 'Incidents', active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    item.active
                      ? 'border-[#b9ece3] bg-[#ecfffb] text-[#0f766e] shadow-sm'
                      : 'border-[#e4f4f0] bg-white/70 text-[#3f6e68]'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="mt-6 rounded-[24px] border border-[#e0f1ed] bg-white/78 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">Activity Hints</p>
              <div className="mt-4 space-y-4">
                {adminAlerts.map((alert) => (
                  <div key={alert.title} className="rounded-2xl bg-[#f6fffd] p-3">
                    <p className="text-sm font-bold text-[#06322e]">{alert.title}</p>
                    <p className="mt-1 text-sm font-semibold text-[#0f766e]">{alert.value}</p>
                    <p className="mt-1 text-xs leading-5 text-[#456e68]">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/pakiadmin/login');
              }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d8eeea] bg-white px-4 py-3 text-sm font-bold text-[#0f766e] shadow-sm transition-colors hover:bg-[#f3fffd]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </aside>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <section className="rounded-[32px] border border-white/75 bg-white/72 p-6 shadow-[0_32px_80px_-44px_rgba(15,118,110,0.45)] backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8f1eb] bg-[#f5fffd] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#11998e]">
                    <Activity className="h-3.5 w-3.5" />
                    Real-Time Admin Snapshot
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-[#06322e] sm:text-4xl">
                    Monitor platform health at a glance.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#456e68] sm:text-base">
                    A clean overview of the metrics admins check first: shipment movement, approval workload,
                    parcel risk, and revenue performance across the network.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                  <div className="rounded-[24px] border border-[#dbf0eb] bg-[linear-gradient(135deg,_#effefa_0%,_#ffffff_100%)] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">Admin On Duty</p>
                    <p className="mt-2 text-lg font-black text-[#06322e]">{adminName}</p>
                    <p className="mt-1 text-sm text-[#4e7771]">Overseeing live operations and escalations.</p>
                  </div>
                  <div className="rounded-[24px] border border-[#dbf0eb] bg-[linear-gradient(135deg,_#effefa_0%,_#ffffff_100%)] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">Last Refresh</p>
                    <p className="mt-2 text-lg font-black text-[#06322e]">{todayLabel}</p>
                    <p className="mt-1 text-sm text-[#4e7771]">Status feed synced for dashboard overview cards.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {overviewPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex rounded-full border border-[#d9f0eb] bg-[#f6fffd] px-3 py-1.5 text-xs font-bold text-[#0f766e]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-[#06322e]">Key Platform KPIs</h3>
                  <p className="text-sm text-[#4e7771]">Quick overview cards designed for fast operational scanning.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ede8] bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Monitoring Live Signals
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
                {kpiMetrics.map((metric) => (
                  <KpiCard key={metric.label} metric={metric} />
                ))}
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.95fr]">
              <div className="rounded-[30px] border border-white/80 bg-white/78 p-6 shadow-[0_26px_70px_-44px_rgba(15,118,110,0.45)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">Operations Pulse</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-[#06322e]">What the dashboard is signaling</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] bg-[#f5fffd] p-4">
                    <p className="text-sm font-bold text-[#06322e]">Throughput</p>
                    <p className="mt-2 text-2xl font-black text-[#0f766e]">92%</p>
                    <p className="mt-2 text-sm leading-6 text-[#4c746f]">
                      Active shipments are flowing with only minor delay risk in the afternoon window.
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#f5fffd] p-4">
                    <p className="text-sm font-bold text-[#06322e]">Approval Cadence</p>
                    <p className="mt-2 text-2xl font-black text-[#0f766e]">5.8 hrs</p>
                    <p className="mt-2 text-sm leading-6 text-[#4c746f]">
                      Average time to review is moving in the right direction and reducing backlog pressure.
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#f5fffd] p-4">
                    <p className="text-sm font-bold text-[#06322e]">Case Closure</p>
                    <p className="mt-2 text-2xl font-black text-[#0f766e]">84%</p>
                    <p className="mt-2 text-sm leading-6 text-[#4c746f]">
                      Lost parcel reports remain manageable, with most items resolved within target SLA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/80 bg-white/78 p-6 shadow-[0_26px_70px_-44px_rgba(15,118,110,0.45)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">Attention Queue</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-[#06322e]">Items that may need a closer look</h3>
                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: 'Pending branch verification',
                      meta: '6 requests',
                      note: 'Mostly newly onboarded branch managers awaiting document review.',
                    },
                    {
                      title: 'Lost parcel callback window',
                      meta: '2 reports',
                      note: 'Customer updates are due before the next support handoff period.',
                    },
                    {
                      title: 'Revenue reconciliation hold',
                      meta: '1 batch',
                      note: 'A settlement batch is still validating before final posting completes.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-[#def1ec] bg-[#f7fffd] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#06322e]">{item.title}</p>
                          <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#11998e]">{item.meta}</p>
                        </div>
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#14b8a6]" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#4e7771]">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
