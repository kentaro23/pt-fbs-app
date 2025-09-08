import { Plan, SubscriptionStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

/** 環境変数を number として読む（不正値は fallback） */
function readIntFromEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** プランごとの上限（環境変数で上書き可） */
const MAX_CAPS: Record<Plan, number> = {
  [Plan.FREE]: readIntFromEnv('MAX_ATHLETES_FREE', 3),
  [Plan.SOLO]: readIntFromEnv('MAX_ATHLETES_SOLO', 15),
  [Plan.CLINIC]: readIntFromEnv('MAX_ATHLETES_CLINIC', 100),
  [Plan.TEAM]: readIntFromEnv('MAX_ATHLETES_TEAM', 500),
};

export function getMaxAthletesForPlan(plan: Plan): number {
  return MAX_CAPS[plan] ?? MAX_CAPS[Plan.FREE];
}

/** 現在のサブスクリプション（未契約時は FREE として扱う） */
export async function getUserSubscription(userId: string): Promise<{ plan: Plan; status: SubscriptionStatus }> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] } },
    orderBy: { createdAt: 'desc' },
    select: { plan: true, status: true },
  });

  if (sub) return sub;
  return { plan: Plan.FREE, status: SubscriptionStatus.canceled };
}

/** 選手作成前の上限チェック（超過時はエラー） */
export async function assertAthleteCreateAllowed(userId: string): Promise<void> {
  const { plan } = await getUserSubscription(userId);
  const cap = getMaxAthletesForPlan(plan);
  const count = await prisma.athlete.count({ where: { userId } });
  if (count >= cap) {
    throw new Error(`選手の上限（${cap}人）に達しています。プランのアップグレードをご検討ください。`);
  }
}


