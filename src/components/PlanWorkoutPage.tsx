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
import { Direction } from "../utils/arrayUtils";
import {
  deleteWorkoutDay,
  reorderWorkoutDay,
  upsertWorkoutDay,
} from "../utils/workoutMutationHelpers";
import { selectWorkoutDays } from "../utils/workoutSelectors";
import { CreateWorkoutEmptyState } from "./CreateWorkoutEmptyState";
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
        <Loader aria-label="Loading workout" />
      </Center>
    );
  }

  if (isError) {
    return <Center>Failed to load workout plan</Center>;
  }

  if (!workout) {
    return (
      <CreateWorkoutEmptyState
        isPending={isPendingCreate}
        onCreate={() => createWorkout({})}
      />
    );
  }

  const workoutDays = selectWorkoutDays(workout);

  return (
    <>
      <Title mb="sm" order={3}>
        Workout plan
      </Title>
      <Flex direction="column" gap="lg">
        {workoutDays.length === 0 && (
          <div>
            Your plan has no days. Click the button below to add your first day.
          </div>
        )}
        {workoutDays.map((day, index) => {
          return (
            <PlanDay
              key={day.id}
              day={day}
              workout={workout}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === workoutDays.length - 1}
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
        title="Delete day"
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => handleDeleteDay()}
      >
        Are you sure you want to permanently delete this day?
      </DeleteConfirmationModal>
    </>
  );

  async function handleSaveDay(day: Day) {
    if (!workout) {
      return;
    }
    setIsDayModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: upsertWorkoutDay(workout, day, dayToEdit?.id),
    });
  }

  async function handleDeleteDay() {
    if (!workout || !dayToEdit) {
      return;
    }
    await updateWorkout({
      workoutId: workout.id,
      updates: deleteWorkoutDay(workout, dayToEdit.id),
    });
  }

  async function handleMoveDay(index: number, direction: Direction) {
    if (!workout) {
      return;
    }
    await updateWorkout({
      workoutId: workout.id,
      updates: reorderWorkoutDay(workout, index, direction),
    });
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
