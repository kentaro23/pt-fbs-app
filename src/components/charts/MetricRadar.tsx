"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";

export type MetricRadarDatum = { name: string; value: number };

export function MetricRadar({ data, title }: { data: MetricRadarDatum[]; title?: string }) {
  const chartData = data.map(d => ({ name: d.name, 指標: Math.max(0, Math.min(1, d.value)) }));
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} outerRadius={110} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 1]} tickCount={5} />
          <Radar name={title ?? ""} dataKey="指標" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
