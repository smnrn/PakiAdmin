import { useState } from 'react';
import { AlertTriangle, Zap, RotateCcw, CheckCircle2, Shield } from 'lucide-react';
import type { ActionableInsight } from '../../lib/supabaseSchema';
import { executeSurgeAction } from '../../lib/supabaseSchema';

interface PrescriptiveActuationPanelProps {
  insights: ActionableInsight[];
  isLoading: boolean;
  onActionExecuted?: () => void;
}

export default function PrescriptiveActuationPanel({
  insights,
  isLoading,
  onActionExecuted,
}: PrescriptiveActuationPanelProps) {
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [executedIds, setExecutedIds] = useState<Set<string>>(new Set());

  const actionableInsights = insights.filter((i) => i.severity !== 'STABLE');

  const handleExecute = async (insight: ActionableInsight) => {
    setExecutingIds((prev) => new Set(prev).add(insight.hub_id));
    try {
      const result = await executeSurgeAction(
        insight.hub_id,
        `${insight.hub_name}: ${insight.risk_pct.toFixed(1)}% capacity / ${insight.avg_dwell_hours.toFixed(1)}h avg dwell`,
        insight.prescriptive_action,
      );
      if (result) {
        setExecutedIds((prev) => new Set(prev).add(insight.hub_id));
        onActionExecuted?.();
      }
    } catch {
      // Error already logged in executeSurgeAction
    } finally {
      setExecutingIds((prev) => {
        const next = new Set(prev);
        next.delete(insight.hub_id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-7 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 rounded-lg bg-gray-200" />
          <div className="h-4 w-96 rounded-lg bg-gray-100" />
          <div className="space-y-3 mt-6">
            <div className="h-28 rounded-2xl bg-gray-100" />
            <div className="h-28 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#041614]">
            Logistics Actuations & Routing
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Prescriptive actions for flagged hubs. Execute to apply surge bonuses or routing changes.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[#39B5A8]/20 bg-[#F0F9F8] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">
          {actionableInsights.length} Action{actionableInsights.length === 1 ? '' : 's'} Required
        </div>
      </div>

      {actionableInsights.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-emerald-700">All Systems Optimal</p>
          <p className="mt-1 text-xs text-emerald-600/70">
            No hubs are flagged for critical capacity overload or SLA warning. Network is operating within safe thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {actionableInsights.map((insight) => {
            const isCritical = insight.severity === 'CRITICAL';
            const isExecuting = executingIds.has(insight.hub_id);
            const isExecuted = executedIds.has(insight.hub_id);

            return (
              <div
                key={insight.hub_id}
                className={`rounded-[1.75rem] border p-6 transition-all ${
                  isCritical
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-amber-200 bg-amber-50/60'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        isCritical
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {isCritical ? (
                        <AlertTriangle className="h-6 w-6" />
                      ) : (
                        <RotateCcw className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#041614]">{insight.hub_name}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                            isCritical
                              ? 'border-red-200 bg-red-100 text-red-700'
                              : 'border-amber-200 bg-amber-100 text-amber-700'
                          }`}
                        >
                          {insight.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-semibold">Threat:</span>{' '}
                        {isCritical
                          ? `Projected to hit ${insight.risk_pct.toFixed(0)}% storage capacity within 24 hours.`
                          : `Average dwell time of ${insight.avg_dwell_hours.toFixed(1)}h exceeds 48-hour SLA threshold.`}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#1A5D56]">
                        Prescribed: {insight.prescriptive_action}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span>Stored: {insight.current_stored}</span>
                        <span>Incoming: {insight.incoming_24h}</span>
                        <span>Capacity: {insight.capacity}</span>
                        <span>Breaches: {insight.sla_breach_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isExecuted ? (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Action Logged
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isExecuting}
                        onClick={() => handleExecute(insight)}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-all ${
                          isExecuting
                            ? 'cursor-wait bg-gray-400'
                            : isCritical
                              ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                        }`}
                      >
                        <Zap className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} />
                        {isExecuting ? 'Executing…' : 'Execute Action'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
