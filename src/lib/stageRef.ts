import type Konva from 'konva';

let stage: Konva.Stage | null = null;
export const getStage = () => stage;
export const setStage = (s: Konva.Stage | null) => {
  stage = s;
};
