import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { HubDwellTime } from '../../lib/supabaseSchema';

interface DwellTimeChartProps {
  data: HubDwellTime[];
  isLoading: boolean;
}

const WARNING_THRESHOLD = 48;

export default function DwellTimeChart({ data, isLoading }: DwellTimeChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [
        { hub: 'Hub A', hours: 0 },
        { hub: 'Hub B', hours: 0 },
        { hub: 'Hub C', hours: 0 },
        { hub: 'Hub D', hours: 0 },
      ];
    }
    return data.map((d) => ({
      hub: d.hub_name.length > 18 ? d.hub_name.slice(0, 16) + '…' : d.hub_name,
      hours: d.avg_dwell_hours,
      breaches: d.sla_breach_count,
      fullName: d.hub_name,
    }));
  }, [data]);

  const isEmpty = data.length === 0;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#041614]">Hub Dwell Times</h3>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Average hours parcels remain at each hub before dispatch
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
          {WARNING_THRESHOLD}h Threshold
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-64 rounded-2xl bg-gray-100" />
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#39B5A810" vertical={false} />
              <XAxis
                dataKey="hub"
                tick={{ fontSize: 11, fontWeight: 600, fill: '#1A5D56' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#1A5D5680' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#1A5D5660', fontWeight: 700 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #39B5A820',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(value: number) => [`${value.toFixed(1)}h`, 'Avg Dwell']}
                labelFormatter={(label: string) => label}
              />
              <ReferenceLine
                y={WARNING_THRESHOLD}
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: '48h Warning',
                  position: 'insideTopRight',
                  style: { fontSize: 10, fill: '#F59E0B', fontWeight: 700 },
                }}
              />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      isEmpty
                        ? '#E5E7EB'
                        : entry.hours > WARNING_THRESHOLD
                          ? '#DC2626'
                          : entry.hours > WARNING_THRESHOLD * 0.75
                            ? '#F59E0B'
                            : '#39B5A8'
                    }
                    opacity={isEmpty ? 0.3 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400">No dwell time data</p>
                <p className="mt-1 text-xs text-gray-300">Hub records will populate as shipments are processed</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isEmpty && data.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#39B5A8]" />Healthy</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />Warning</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />SLA Risk</span>
        </div>
      )}
    </div>
  );
}
