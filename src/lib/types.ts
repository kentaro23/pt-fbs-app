export type PositionJp = "投手" | "捕手" | "内野手" | "外野手" | "その他";
export type ThrowingJp = "右" | "左";
export type BattingJp = "右" | "左" | "両";

export type BodySideCode = "RIGHT" | "LEFT";

export type Movement =
  | "SHOULDER_FLEX"
  | "SHOULDER_ER_90"
  | "SHOULDER_IR_90"
  | "HORIZONTAL_ADDUCTION"
  | "ELBOW_EXTENSION"
  | "FOREARM_PRONATION"
  | "FOREARM_SUPINATION"
  | "HIP_FLEXION"
  | "HIP_EXTENSION"
  | "HIP_IR"
  | "HIP_ER";

export type TriangleScore = {
  speed: number; // 0-1
  power: number; // 0-1
  flexibility: number; // 0-1
};

// FBSレポート用の表示型
export type Athlete = {
  name: string;
  team?: string | null;
  position: string;
  throwingSide: ThrowingJp;
  batting: BattingJp;
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number;
};

export type Mark3 = "CIRCLE" | "TRIANGLE" | "CROSS";

export type Assessment = {
  id: string;
  date: string; // ISO string
  fatMassKg: number;
  leanMassKg: number;
  leanBodyIndex: number;
  swingSpeed?: number | null;
  notes?: string | null;
  // 追加の指標
  openHipMark?: Mark3 | null;
  bridgeMark?: Mark3 | null;
  forwardBendMark?: Mark3 | null;
  medicineBallThrow?: number | null;
  verticalJumpCm?: number | null;
  tripleBroadJumpM?: number | null;
  squatWeightKg?: number | null;
  gripRightKg?: number | null;
  gripLeftKg?: number | null;
  // Power
  verticalJumpBothCm?: number | null;
  verticalJumpRightCm?: number | null;
  verticalJumpLeftCm?: number | null;
  medicineBallThrowBackM?: number | null;
  benchPressKg?: number | null;
  sprint10mSec?: number | null;
  sprint30mSec?: number | null;
  ballVelocityKmh?: number | null;
  // Strength (左右)
  strength2ndErRight?: number | null;
  strength2ndErLeft?: number | null;
  strength2ndIrRight?: number | null;
  strength2ndIrLeft?: number | null;
  strengthBellyPressRight?: number | null;
  strengthBellyPressLeft?: number | null;
  strengthSerratusAnteriorRight?: number | null;
  strengthSerratusAnteriorLeft?: number | null;
  strengthLowerTrapeziusRight?: number | null;
  strengthLowerTrapeziusLeft?: number | null;
  strengthHipFlexionRight?: number | null;
  strengthHipFlexionLeft?: number | null;
  strengthHipExtensionRight?: number | null;
  strengthHipExtensionLeft?: number | null;
  strengthHipAbductionRight?: number | null;
  strengthHipAbductionLeft?: number | null;
  strengthHipAdductionRight?: number | null;
  strengthHipAdductionLeft?: number | null;
  strengthHipErRight?: number | null;
  strengthHipErLeft?: number | null;
  strengthHipIrRight?: number | null;
  strengthHipIrLeft?: number | null;
};

export type Rom = {
  movement: Movement;
  side: BodySideCode;
  valueDeg: number;
};


