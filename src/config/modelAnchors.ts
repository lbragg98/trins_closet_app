export const MODEL_DIMENSIONS = {
  width: 500,
  height: 800
};

export const MODEL_ANCHORS = {
  neck: { x: 250, y: 120 },
  leftShoulder: { x: 190, y: 150 },
  rightShoulder: { x: 310, y: 150 },
  chest: { x: 250, y: 220 },
  waist: { x: 250, y: 330 },
  leftHip: { x: 205, y: 370 },
  rightHip: { x: 295, y: 370 },
  leftKnee: { x: 220, y: 535 },
  rightKnee: { x: 280, y: 535 },
  leftFoot: { x: 220, y: 720 },
  rightFoot: { x: 280, y: 720 }
};

export type ModelAnchors = typeof MODEL_ANCHORS;
