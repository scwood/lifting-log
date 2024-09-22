import { WarmupType } from "./WarmupType";

export interface WarmupSet {
  id: string;
  type: WarmupType;
  reps: number;
  value: number;
}
