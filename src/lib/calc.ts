import { ROM_MAX } from "./constants";
import { Movement, BodySideCode, TriangleScore } from "./types";

export function computeComposition(heightCm: number, weightKg: number, bodyFatPercent: number) {
  const heightMeter = heightCm / 100;
  const fatMassKg = weightKg * (bodyFatPercent / 100);
  const leanMassKg = weightKg - fatMassKg;
  const leanBodyIndex = heightMeter > 0 ? leanMassKg / (heightMeter * heightMeter) : 0;
  return {
    fatMassKg,
    leanMassKg,
    leanBodyIndex,
  };
}

export function dominantSide(throwingSide: "右" | "左"): BodySideCode {
  return throwingSide === "右" ? "RIGHT" : "LEFT";
}

export function asymPercent(dominant: number, nonDominant: number): number {
  if (!isFinite(dominant) || !isFinite(nonDominant) || nonDominant === 0) return 0;
  return ((dominant - nonDominant) / nonDominant) * 100;
}

export function normalizeRom(value: number, movement: Movement): number {
  const max = ROM_MAX[movement] ?? 180;
  if (!isFinite(value) || value < 0) return 0;
  const v = value / max;
  return Math.max(0, Math.min(1, v));
}

export function scoreTriangle({
  swingSpeed,
  romMap,
}: {
  swingSpeed?: number | null;
  romMap: Partial<Record<Movement, { RIGHT?: number; LEFT?: number }>>;
}): TriangleScore {
  const speed = Math.max(0, Math.min(1, (swingSpeed ?? 0) / 50));

  const shoulderFlex = romMap.SHOULDER_FLEX?.RIGHT ?? romMap.SHOULDER_FLEX?.LEFT ?? 0;
  const hipExt = romMap.HIP_EXTENSION?.RIGHT ?? romMap.HIP_EXTENSION?.LEFT ?? 0;
  const composite = normalizeRom(shoulderFlex, "SHOULDER_FLEX") + normalizeRom(hipExt, "HIP_EXTENSION");
  const power = Math.max(0, Math.min(1, composite / 2));

  const values: number[] = [];
  (Object.keys(ROM_MAX) as Movement[]).forEach((m) => {
    const r = romMap[m]?.RIGHT;
    const l = romMap[m]?.LEFT;
    if (typeof r === "number") values.push(normalizeRom(r, m));
    if (typeof l === "number") values.push(normalizeRom(l, m));
  });
  const flexibility = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return { speed, power, flexibility };
}


