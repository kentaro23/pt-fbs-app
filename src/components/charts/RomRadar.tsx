"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import type { Movement } from "@/lib/types";

export type RomRadarDatum = {
  movement: Movement;
  right: number; // 0-1
  left: number;  // 0-1
};

export function RomRadar({ data }: { data: RomRadarDatum[] }) {
  const chartData = data.map((d) => ({
    name: MOVEMENT_LABEL_JP[d.movement],
    右: d.right,
    左: d.left,
  }));

  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} outerRadius={120} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} tickMargin={8} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickCount={5} />
          <Radar name="右" dataKey="右" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
          <Radar name="左" dataKey="左" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
