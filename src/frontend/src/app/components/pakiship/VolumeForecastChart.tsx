import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { HubVolumeForecast } from '../../lib/supabaseSchema';

interface VolumeForecastChartProps {
  data: HubVolumeForecast[];
  isLoading: boolean;
}

export default function VolumeForecastChart({ data, isLoading }: VolumeForecastChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [
        { hub: 'Hub A', forecast: 0, capacity: 100 },
        { hub: 'Hub B', forecast: 0, capacity: 100 },
        { hub: 'Hub C', forecast: 0, capacity: 100 },
        { hub: 'Hub D', forecast: 0, capacity: 100 },
      ];
    }
    return data.map((d) => ({
      hub: d.hub_name.length > 18 ? d.hub_name.slice(0, 16) + '…' : d.hub_name,
      forecast: d.total_forecast,
      capacity: d.capacity,
      stored: d.current_stored,
      incoming: d.incoming_24h,
      risk: d.risk_pct,
      fullName: d.hub_name,
    }));
  }, [data]);

  const isEmpty = data.length === 0;
  const maxCapacity = useMemo(
    () => Math.max(...chartData.map((d) => Math.max(d.forecast, d.capacity)), 100),
    [chartData],
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#041614]">24-Hour Volume Forecast</h3>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Projected incoming shipment volume vs. physical capacity limits
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">
          Capacity Limit
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-64 rounded-2xl bg-gray-100" />
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39B5A8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#39B5A8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="forecastGradientDanger" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                domain={[0, maxCapacity + 20]}
                label={{ value: 'Parcels', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#1A5D5660', fontWeight: 700 } }}
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
                formatter={(value: number, name: string) => {
                  if (name === 'forecast') return [value, 'Total Forecast'];
                  if (name === 'capacity') return [value, 'Max Capacity'];
                  return [value, name];
                }}
              />
              <ReferenceLine
                y={Math.max(...chartData.map((d) => d.capacity))}
                stroke="#DC2626"
                strokeWidth={2}
                strokeDasharray="0"
                label={{
                  value: 'Capacity Limit',
                  position: 'insideTopRight',
                  style: { fontSize: 10, fill: '#DC2626', fontWeight: 700 },
                }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke={isEmpty ? '#E5E7EB' : '#39B5A8'}
                strokeWidth={2}
                fill={isEmpty ? 'none' : 'url(#forecastGradient)'}
                dot={{
                  r: 4,
                  fill: '#fff',
                  stroke: isEmpty ? '#E5E7EB' : '#39B5A8',
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400">No volume forecast data</p>
                <p className="mt-1 text-xs text-gray-300">Forecasts will appear as hubs receive shipments</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isEmpty && data.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#39B5A8]" />Forecasted Volume</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 border-t-2 border-[#DC2626]" />Capacity Limit</span>
        </div>
      )}
    </div>
  );
}
