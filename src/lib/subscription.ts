import { prisma } from '@/lib/db';
import type { Plan, Subscription } from '@prisma/client';

/** 環境変数を number として読む（不正値は fallback） */
function readIntFromEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type PlanKey = 'FREE' | 'SOLO' | 'CLINIC' | 'TEAM';
/** プランごとの上限（環境変数で上書き可） */
const MAX_CAPS: Record<PlanKey, number> = {
  FREE: readIntFromEnv('MAX_ATHLETES_FREE', 3),
  SOLO: readIntFromEnv('MAX_ATHLETES_SOLO', 15),
  CLINIC: readIntFromEnv('MAX_ATHLETES_CLINIC', 50),
  TEAM: readIntFromEnv('MAX_ATHLETES_TEAM', 100),
};

export function getMaxAthletesForPlan(plan: Plan): number { return MAX_CAPS[(plan as unknown as PlanKey)] ?? MAX_CAPS.FREE; }

export function limitByPlan(plan: Plan | null | undefined): number {
  if (!plan || plan === 'FREE') return readIntFromEnv('MAX_ATHLETES_FREE', 3);
  if (plan === 'SOLO') return readIntFromEnv('MAX_ATHLETES_SOLO', 15);
  if (plan === 'CLINIC') return readIntFromEnv('MAX_ATHLETES_CLINIC', 50);
  return readIntFromEnv('MAX_ATHLETES_TEAM', 100);
}

export function labelOf(plan: Plan | null | undefined): string {
  if (!plan || plan === 'FREE') return 'Free';
  if (plan === 'SOLO') return 'Solo';
  if (plan === 'CLINIC') return 'Clinic';
  return 'Team';
}

export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

/** 選手作成前の上限チェック（超過時はエラー） */
export async function assertAthleteCreateAllowed(userId: string): Promise<void> {
  const sub = await getCurrentSubscription(userId);
  const cap = limitByPlan((sub?.plan as Plan | undefined) ?? 'FREE');
  const count = await prisma.athlete.count({ where: { userId } });
  if (count >= cap) {
    const meta = { count, limit: cap, remaining: Math.max(0, cap - count), plan: (sub?.plan ?? 'FREE') as Plan } as const;
    const e = new LimitExceededError(meta);
    throw e;
  }
}

export async function getAthleteUsage(userId: string) {
  const sub = await getCurrentSubscription(userId);
  const cap = limitByPlan((sub?.plan as Plan | undefined) ?? 'FREE');
  const count = await prisma.athlete.count({ where: { userId } });
  const remaining = Math.max(0, cap - count);
  return { count, plan: (sub?.plan ?? 'FREE') as PlanKey, limit: cap, remaining };
}

export class LimitExceededError extends Error {
  readonly meta: { count: number; limit: number; remaining: number; plan: Plan };
  constructor(meta: { count: number; limit: number; remaining: number; plan: Plan }) {
    super('LIMIT_EXCEEDED');
    this.meta = meta;
  }
}


