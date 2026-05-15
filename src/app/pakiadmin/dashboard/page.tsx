'use client';

import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
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
  icon: React.ReactNode;
  accent: {
    iconWrap: string;
    trendTone: string;
  };
}

const kpiMetrics: KpiMetric[] = [
  {
    label: 'Total Revenue',
    value: 'PHP 50,650',
    trend: '+2.5%',
    direction: 'up',
    status: 'Weekly earnings from hub areas',
    icon: <CircleDollarSign className="h-5 w-5" />,
    accent: {
      iconWrap: 'bg-[#dff4f2] text-[#0f8f86]',
      trendTone: 'bg-[#e9fbf2] text-[#05a56b] border-[#c4f1d9]',
    },
  },
  {
    label: 'Active Shipments',
    value: '247',
    trend: '+8.2%',
    direction: 'up',
    status: 'Currently in transit',
    icon: <PackageCheck className="h-5 w-5" />,
    accent: {
      iconWrap: 'bg-[#dbe9ff] text-[#2563eb]',
      trendTone: 'bg-[#e9fbf2] text-[#05a56b] border-[#c4f1d9]',
    },
  },
  {
    label: 'Pending Approvals',
    value: '19',
    trend: '+1.9%',
    direction: 'up',
    status: 'Awaiting admin review',
    icon: <ClipboardCheck className="h-5 w-5" />,
    accent: {
      iconWrap: 'bg-[#dcfce7] text-[#0f9f78]',
      trendTone: 'bg-[#e9fbf2] text-[#05a56b] border-[#c4f1d9]',
    },
  },
  {
    label: 'Open Lost Parcel Reports',
    value: '7',
    trend: '-5.4%',
    direction: 'down',
    status: 'Active incident cases',
    icon: <AlertTriangle className="h-5 w-5" />,
    accent: {
      iconWrap: 'bg-[#ffe2e2] text-[#ff2f2f]',
      trendTone: 'bg-[#edf3ff] text-[#1857ff] border-[#d4e1ff]',
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

function KpiCard({ metric }: { metric: KpiMetric }) {
  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="rounded-[30px] border border-[#dceceb] bg-white px-7 py-6 shadow-[0_8px_24px_rgba(15,118,110,0.08)] transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.accent.iconWrap}`}>
          {metric.icon}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${metric.accent.trendTone}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.trend}
        </span>
      </div>

      <div className="mt-12">
        <p className="text-[13px] font-black uppercase tracking-[0.22em] text-[#0ea5a5]">{metric.label}</p>
        <p className="mt-3 text-[2.1rem] font-black tracking-tight text-[#062b3d]">{metric.value}</p>
        <p className="mt-3 text-sm font-semibold text-[#8b97b3]">{metric.status}</p>
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
            <section className="px-1 pt-1">
              <h2 className="text-3xl font-black tracking-tight text-[#06322e]">Operational Overview</h2>
              <p className="mt-1 text-lg italic text-[#5d8d89]">
                Monitoring PakiShip logistics, {adminName}. Updated {todayLabel}.
              </p>
            </section>

            <section className="mt-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
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
