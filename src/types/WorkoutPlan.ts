import { Day } from "./Day";

interface WorkoutPlan {
  id: string;
  createdTimestamp: number;
  completedTimestamp: number | null;
  days: Day[];
}
