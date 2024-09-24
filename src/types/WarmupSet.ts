import { WarmUpType } from "./WarmUpType";

export interface WarmUpSet {
  id: string;
  type: WarmUpType;
  reps: number;
  value: number;
}
