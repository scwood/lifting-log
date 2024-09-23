import { Day } from "./Day";

export interface Workout {
  id: string;
  userId: string;
  createdTimestamp: number;
  completedTimestamp: number | null;
  notes: string | null;
  days: Day[];
}
