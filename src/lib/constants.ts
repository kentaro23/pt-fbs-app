import { Movement } from "./types";

export const ASYM_THRESHOLD = 10; // %

export const ROM_MAX: Record<Movement, number> = {
  SHOULDER_FLEX: 180,
  SHOULDER_ER_90: 120,
  SHOULDER_IR_90: 70,
  HORIZONTAL_ADDUCTION: 120, // 0-140 目安だが正規化は120に揃える
  ELBOW_EXTENSION: 15, // 0-15
  FOREARM_PRONATION: 90,
  FOREARM_SUPINATION: 90,
  HIP_FLEXION: 120,
  HIP_EXTENSION: 30,
  HIP_IR: 45,
  HIP_ER: 60,
};

export const MOVEMENT_LABEL_JP: Record<Movement, string> = {
  SHOULDER_FLEX: "肩屈曲",
  SHOULDER_ER_90: "肩2nd外旋(90°外転位外旋)",
  SHOULDER_IR_90: "肩2nd内旋(90°外転位内旋)",
  HORIZONTAL_ADDUCTION: "肩水平内転",
  ELBOW_EXTENSION: "肘伸展",
  FOREARM_PRONATION: "前腕回内",
  FOREARM_SUPINATION: "前腕回外",
  HIP_FLEXION: "股関節屈曲",
  HIP_EXTENSION: "股関節伸展",
  HIP_IR: "股関節内旋",
  HIP_ER: "股関節外旋",
};


