import { Button, Center, Flex, Loader, Title } from "@mantine/core";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { DayModal } from "./DayModal";
import { Day } from "../types/Day";
import { DayCard } from "./DayCard";
import { arraySwap } from "../utils/arraySwap";
import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";

export function Plan() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState<Day | null>(null);

  const { data: workout, isLoading, isError } = useCurrentWorkoutQuery();
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError || !workout) {
    return <Center>Failed to load workout plan</Center>;
  }

  return (
    <>
      <Title mb="sm" order={3}>
        Workout plan
      </Title>
      <Flex direction="column" gap="sm">
        {workout.days.map((day, index) => {
          return (
            <DayCard
              key={day.id}
              day={day}
              workout={workout}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === workout.days.length - 1}
              onEdit={handleEditDay}
              onDelete={handleDeleteDay}
              onMoveUp={(day) => handleMoveDay(day, "up")}
              onMoveDown={(day) => handleMoveDay(day, "down")}
            />
          );
        })}
        <Button onClick={handleCreateDay}>Create day</Button>
      </Flex>
      <DayModal
        opened={isDayModalOpen}
        day={dayToEdit ?? undefined}
        onClose={handleDayModalClose}
        onSave={handleSaveDay}
      />
    </>
  );

  async function handleSaveDay(name: string) {
    if (!workout) {
      return;
    }
    let days: Day[];
    if (dayToEdit) {
      days = workout.days.map((day) => {
        return day.id === dayToEdit.id ? { ...day, name } : day;
      });
    } else {
      days = [...workout.days, { id: uuidV4(), name, exercises: [] }];
    }
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  async function handleDeleteDay(day: Day) {
    if (!workout) {
      return;
    }
    const days = workout.days.filter((d) => d.id !== day.id);
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  async function handleMoveDay(day: Day, direction: "up" | "down") {
    if (!workout) {
      return;
    }
    const index = workout.days.findIndex((d) => d.id === day.id);
    const directionLimit = direction === "up" ? 0 : workout.days.length - 1;
    if (index === -1 || index === directionLimit) {
      return;
    }
    const days = arraySwap(
      workout.days,
      index,
      direction === "up" ? index - 1 : index + 1
    );
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  function handleDayModalClose() {
    setIsDayModalOpen(false);
  }

  function handleEditDay(day: Day) {
    setDayToEdit(day);
    setIsDayModalOpen(true);
  }

  function handleCreateDay() {
    setDayToEdit(null);
    setIsDayModalOpen(true);
  }
}
