"use client";

import type { TriangleScore } from "@/lib/types";

// Equilateral triangle with vertices at top (Speed), bottom-left (Power), bottom-right (Flexibility)
export function TriangleBalance({ score }: { score: TriangleScore }) {
  const size = 280;
  const padding = 24;
  const width = size;
  const height = size;

  const cx = width / 2;
  const top = { x: cx, y: padding };
  const left = { x: padding, y: height - padding };
  const right = { x: width - padding, y: height - padding };

  const toPoint = (s: number, a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: a.x + (b.x - a.x) * s,
    y: a.y + (b.y - a.y) * s,
  });

  const pSpeed = toPoint(score.speed, left, top);
  const pPower = toPoint(score.power, right, left);
  const pFlex = toPoint(score.flexibility, top, right);

  const polygon = `${pSpeed.x},${pSpeed.y} ${pFlex.x},${pFlex.y} ${pPower.x},${pPower.y}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon points={`${top.x},${top.y} ${right.x},${right.y} ${left.x},${left.y}`} fill="none" stroke="#94a3b8" strokeWidth={2} />
      <circle cx={top.x} cy={top.y} r={3} fill="#0ea5e9" />
      <circle cx={left.x} cy={left.y} r={3} fill="#22c55e" />
      <circle cx={right.x} cy={right.y} r={3} fill="#f59e0b" />

      <text x={top.x} y={top.y - 8} textAnchor="middle" className="fill-foreground text-sm">Speed</text>
      <text x={left.x - 8} y={left.y + 16} textAnchor="end" className="fill-foreground text-sm">Power</text>
      <text x={right.x + 8} y={right.y + 16} textAnchor="start" className="fill-foreground text-sm">Flexibility</text>

      <polygon points={polygon} fill="#3b82f6" opacity={0.35} stroke="#1d4ed8" />
    </svg>
  );
}


