import { Center, Flex, Loader, Title } from "@mantine/core";

import { useWorkoutsQuery } from "../hooks/useWorkoutsQuery";
import { PastWorkoutCard } from "./PastWorkoutCard";

export default function HistoryTab() {
  const { data: workouts, isLoading, isError } = useWorkoutsQuery();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  } else if (isError || !workouts) {
    return <Center>Failed to load workout history</Center>;
  } else {
    const completedWorkouts = workouts.filter((workout) => {
      return workout.completedTimestamp;
    });
    return (
      <>
        <Title order={3} mb="xs">
          History
        </Title>
        {completedWorkouts.length === 0 && <>No completed workouts yet</>}
        <Flex gap="sm" direction="column">
          {completedWorkouts.map((workout) => {
            return <PastWorkoutCard key={workout.id} workout={workout} />;
          })}
        </Flex>
      </>
    );
  }
}
