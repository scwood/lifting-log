import {
  Button,
  Center,
  Divider,
  Flex,
  Loader,
  Modal,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { Day } from "../types/Day";
import { PlanDay } from "./PlanDay";
import { moveItem } from "../utils/arrayUtils";
import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { useCreateWorkoutMutation } from "../hooks/useCreateWorkoutMutation";
import { DayForm } from "./DayForm";

export default function PlanWorkoutTab() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState<Day | null>(null);

  const { data: workout, isLoading, isError } = useCurrentWorkoutQuery();
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const { mutate: createWorkout, isPending: isPendingCreate } =
    useCreateWorkoutMutation();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return <Center>Failed to load workout plan</Center>;
  }

  if (!workout) {
    return (
      <Flex direction="column" align="center" gap="sm">
        <div>Press the button below to create a workout plan</div>
        <Button
          color="green"
          loading={isPendingCreate}
          onClick={() => createWorkout({})}
        >
          Create workout plan
        </Button>
      </Flex>
    );
  }

  return (
    <>
      <Title mb="sm" order={3}>
        Workout plan
      </Title>
      <Flex direction="column" gap="lg">
        {workout.days.map((day, index) => {
          return (
            <PlanDay
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
        <Divider />
        <Button onClick={handleAddDay}>Add day</Button>
      </Flex>
      <Modal
        title={`${dayToEdit ? "Edit" : "Create"} day`}
        centered
        opened={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
      >
        <DayForm
          initialValues={dayToEdit ?? undefined}
          key={dayToEdit?.id}
          onSave={handleSaveDay}
        />
      </Modal>
    </>
  );

  async function handleSaveDay(name: string) {
    if (!workout) {
      return;
    }
    setIsDayModalOpen(false);
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
    const days = moveItem(workout.days, (d) => d.id === day.id, direction);
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  function handleEditDay(day: Day) {
    setDayToEdit(day);
    setIsDayModalOpen(true);
  }

  function handleAddDay() {
    setDayToEdit(null);
    setIsDayModalOpen(true);
  }
}
