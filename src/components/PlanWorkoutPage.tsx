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

import { useCreateWorkoutMutation } from "../hooks/useCreateWorkoutMutation";
import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { Day } from "../types/Day";
import { Direction, moveItem } from "../utils/arrayUtils";
import { DayForm } from "./DayForm";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { PlanDay } from "./PlanDay";

export function PlanWorkoutPage() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
              onDelete={handleConfirmDeleteDay}
              onMoveUp={() => handleMoveDay(index, Direction.Up)}
              onMoveDown={() => handleMoveDay(index, Direction.Down)}
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
          defaultValues={dayToEdit ?? undefined}
          onSave={handleSaveDay}
        />
      </Modal>
      <DeleteConfirmationModal
        itemName="day"
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => handleDeleteDay()}
      />
    </>
  );

  async function handleSaveDay(day: Day) {
    if (!workout) {
      return;
    }
    setIsDayModalOpen(false);
    let days: Day[];
    if (dayToEdit) {
      days = workout.days.map((d) => {
        return d.id === dayToEdit.id ? { ...day } : d;
      });
    } else {
      days = [...workout.days, day];
    }
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  async function handleDeleteDay() {
    if (!workout || !dayToEdit) {
      return;
    }
    const days = workout.days.filter((d) => d.id !== dayToEdit.id);
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  async function handleMoveDay(index: number, direction: Direction) {
    if (!workout) {
      return;
    }
    const days = moveItem(workout.days, index, direction);
    await updateWorkout({ workoutId: workout.id, updates: { days } });
  }

  function handleEditDay(day: Day) {
    setDayToEdit(day);
    setIsDayModalOpen(true);
  }

  function handleConfirmDeleteDay(day: Day) {
    setDayToEdit(day);
    setIsDeleteModalOpen(true);
  }

  function handleAddDay() {
    setDayToEdit(null);
    setIsDayModalOpen(true);
  }
}
