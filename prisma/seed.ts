import { PrismaClient, Movement, BodySide, Position, ThrowingSide, Batting } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const athlete = await prisma.athlete.create({
    data: {
      name: "山田 太郎",
      team: "東京スワローズU18",
      position: Position.PITCHER,
      throwingSide: ThrowingSide.RIGHT,
      batting: Batting.RIGHT,
      heightCm: 178,
      weightKg: 75,
      bodyFatPercent: 14,
    },
  });

  const fatMass = 75 * (14 / 100);
  const leanMass = 75 - fatMass;
  const lbi = leanMass / ((1.78) * (1.78));

  const assessment = await prisma.assessment.create({
    data: {
      athleteId: athlete.id,
      date: new Date(),
      fatMassKg: Number(fatMass.toFixed(2)),
      leanMassKg: Number(leanMass.toFixed(2)),
      leanBodyIndex: Number(lbi.toFixed(2)),
      swingSpeed: 38.5,
      notes: "デモ用シードデータ",
    },
  });

  const rightValues: Record<Movement, number> = {
    [Movement.SHOULDER_FLEX]: 170,
    [Movement.SHOULDER_ER_90]: 110,
    [Movement.SHOULDER_IR_90]: 60,
    [Movement.HORIZONTAL_ADDUCTION]: 110,
    [Movement.ELBOW_EXTENSION]: 5,
    [Movement.FOREARM_PRONATION]: 85,
    [Movement.FOREARM_SUPINATION]: 85,
    [Movement.HIP_FLEXION]: 115,
    [Movement.HIP_EXTENSION]: 25,
    [Movement.HIP_IR]: 40,
    [Movement.HIP_ER]: 55,
  };

  const leftValues: Record<Movement, number> = {
    [Movement.SHOULDER_FLEX]: 175,
    [Movement.SHOULDER_ER_90]: 115,
    [Movement.SHOULDER_IR_90]: 65,
    [Movement.HORIZONTAL_ADDUCTION]: 115,
    [Movement.ELBOW_EXTENSION]: 6,
    [Movement.FOREARM_PRONATION]: 88,
    [Movement.FOREARM_SUPINATION]: 90,
    [Movement.HIP_FLEXION]: 118,
    [Movement.HIP_EXTENSION]: 28,
    [Movement.HIP_IR]: 42,
    [Movement.HIP_ER]: 58,
  };

  const romData = Object.entries(rightValues).flatMap(([movement, value]) => [
    { movement: movement as Movement, side: BodySide.RIGHT, valueDeg: value },
    { movement: movement as Movement, side: BodySide.LEFT, valueDeg: leftValues[movement as Movement] },
  ]);

  await prisma.rom.createMany({
    data: romData.map((r) => ({
      assessmentId: assessment.id,
      movement: r.movement,
      side: r.side,
      valueDeg: r.valueDeg,
    })),
  });

  console.log(`Seeded athlete ${athlete.name} with assessment ${assessment.id} and ${romData.length} ROM rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


