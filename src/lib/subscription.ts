import { prisma } from '@/lib/db';

const LIMITS = {
  FREE: parseInt(process.env.MAX_ATHLETES_FREE ?? '3', 10),
  SOLO: parseInt(process.env.MAX_ATHLETES_SOLO ?? '15', 10),
  CLINIC: parseInt(process.env.MAX_ATHLETES_CLINIC ?? '100', 10),
  TEAM: parseInt(process.env.MAX_ATHLETES_TEAM ?? '500', 10),
} as const;

const ACTIVE = new Set(['active','trialing'] as const);

export async function getSubscription(userId: string) {
  return prisma.subscription.upsert({
    where: { userId },
    update: {},
    create: { userId, plan: 'FREE', status: 'inactive' },
  });
}

export async function isPaid(userId: string) {
  const sub = await getSubscription(userId);
  return sub.plan !== 'FREE' && ACTIVE.has(sub.status as any);
}

export async function maxAthletesFor(userId: string) {
  const sub = await getSubscription(userId);
  return LIMITS[sub.plan as keyof typeof LIMITS];
}

export async function assertAthleteCreateAllowed(userId: string) {
  const cap = await maxAthletesFor(userId);
  const count = await prisma.athlete.count({ where: { userId } });
  if (count >= cap) {
    const err = new Error(`現在のプランでは選手は ${cap} 名までです。プランをアップグレードしてください。`);
    // @ts-expect-error attach code for app-level handling (string literal)
    (err as { code?: 'PLAN_LIMIT' }).code = 'PLAN_LIMIT';
    throw err as Error & { code?: 'PLAN_LIMIT' };
  }
}


