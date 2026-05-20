import { AlertTriangle, Shield, Users } from 'lucide-react';
import type { HubVolumeForecast, HubDwellTime } from '../../lib/supabaseSchema';

interface NorthstarLogisticsCardsProps {
  forecasts: HubVolumeForecast[];
  dwellTimes: HubDwellTime[];
  onlineDrivers: number;
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-7 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded-lg bg-gray-200" />
        <div className="h-10 w-32 rounded-lg bg-gray-200" />
        <div className="h-3 w-48 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

export default function NorthstarLogisticsCards({
  forecasts,
  dwellTimes,
  onlineDrivers,
  isLoading,
}: NorthstarLogisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Facility Deadlock Risk — hub closest to 100% capacity
  const worstHub = forecasts.length > 0
    ? forecasts.reduce((a, b) => (a.risk_pct > b.risk_pct ? a : b))
    : null;
  const deadlockRisk = worstHub ? worstHub.risk_pct : 0;
  const deadlockName = worstHub ? worstHub.hub_name : 'No data';
  const deadlockSeverity = deadlockRisk > 90 ? 'critical' : deadlockRisk > 70 ? 'warning' : 'healthy';

  // Network SLA Health — count of parcels breaching 72h
  const totalSlaBreaches = dwellTimes.reduce((sum, h) => sum + h.sla_breach_count, 0);
  const slaSeverity = totalSlaBreaches > 5 ? 'critical' : totalSlaBreaches > 0 ? 'warning' : 'healthy';

  // Active Driver Force
  const driverSeverity = onlineDrivers > 5 ? 'healthy' : onlineDrivers > 0 ? 'warning' : 'critical';

  const severityColors = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      badge: 'bg-red-100 text-red-700 border-red-200',
      value: 'text-red-700',
      label: 'CRITICAL',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      value: 'text-amber-700',
      label: 'WARNING',
    },
    healthy: {
      bg: 'bg-[#F0F9F8]',
      border: 'border-[#39B5A8]/20',
      icon: 'bg-[#E8F6F4] text-[#39B5A8]',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      value: 'text-[#1A5D56]',
      label: 'HEALTHY',
    },
  };

  const cards = [
    {
      title: 'Facility Deadlock Risk',
      value: deadlockRisk > 0 ? `${deadlockRisk.toFixed(1)}%` : '—',
      subtitle: deadlockName,
      description: deadlockRisk > 0
        ? `${worstHub!.hub_name} is closest to capacity overload`
        : 'No hub data available',
      icon: <AlertTriangle className="w-6 h-6" />,
      severity: deadlockSeverity as keyof typeof severityColors,
    },
    {
      title: 'Network SLA Health',
      value: String(totalSlaBreaches),
      subtitle: totalSlaBreaches === 0 ? 'All Clear' : `${totalSlaBreaches} breach${totalSlaBreaches === 1 ? '' : 'es'}`,
      description: 'Active shipments exceeding 72-hour dwell threshold',
      icon: <Shield className="w-6 h-6" />,
      severity: slaSeverity as keyof typeof severityColors,
    },
    {
      title: 'Active Driver Force',
      value: String(onlineDrivers),
      subtitle: onlineDrivers === 0 ? 'No drivers online' : `${onlineDrivers} driver${onlineDrivers === 1 ? '' : 's'} online`,
      description: 'Drivers available for immediate surge routing',
      icon: <Users className="w-6 h-6" />,
      severity: driverSeverity as keyof typeof severityColors,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => {
        const colors = severityColors[card.severity];
        return (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-[2rem] border ${colors.border} ${colors.bg} p-7 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-2xl p-3 transition-transform group-hover:scale-110 ${colors.icon}`}>
                {card.icon}
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${colors.badge}`}>
                {colors.label}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#39B5A8]">
                {card.title}
              </p>
              <p className={`text-3xl font-black ${colors.value}`}>{card.value}</p>
              <p className="text-sm font-semibold text-[#041614]/70">{card.subtitle}</p>
              <p className="text-xs font-medium leading-relaxed text-gray-400">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
