import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Menu,
  Modal,
  Title,
} from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { useState } from "react";

import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { Workout } from "../types/Workout";
import { Direction } from "../utils/arrayUtils";
import {
  deleteWorkoutDayExercise,
  reorderWorkoutDayExercise,
  upsertWorkoutDayExercise,
  upsertWorkoutExerciseDefinition,
} from "../utils/workoutMutationHelpers";
import {
  selectDayExercises,
  selectWorkoutDays,
} from "../utils/workoutSelectors";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { ExerciseForm } from "./ExerciseForm";
import { PlanExerciseCard } from "./PlanExerciseCard";

export interface PlanDayProps {
  day: Day;
  workout: Workout;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (day: Day) => void;
  onDelete: (day: Day) => void;
  onMoveUp: (day: Day) => void;
  onMoveDown: (day: Day) => void;
}

export function PlanDay(props: PlanDayProps) {
  const {
    day,
    workout,
    moveDownDisabled,
    moveUpDisabled,
    onEdit,
    onDelete,
    onMoveDown,
    onMoveUp,
  } = props;
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const workoutDays = selectWorkoutDays(workout);
  const dayExercises = selectDayExercises(day);
  const dayIndex = workoutDays.findIndex((d) => d.id === day.id);

  return (
    <div>
      <Title order={3}>
        <Flex justify="space-between" align="center">
          <span>Day: {day.name}</span>
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={`${day.name} menu`}
              >
                <IconDots />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                disabled={moveUpDisabled}
                onClick={() => onMoveUp(day)}
              >
                Move up
              </Menu.Item>
              <Menu.Item
                disabled={moveDownDisabled}
                onClick={() => onMoveDown(day)}
              >
                Move down
              </Menu.Item>
              <Menu.Item onClick={() => onEdit(day)}>Edit</Menu.Item>
              <Menu.Item color="red" onClick={() => onDelete(day)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Title>
      <Divider mt={4} mb="md" />
      <Flex direction="column" gap="md">
        {dayExercises.length === 0 && (
          <div>
            Your plan has no exercises for this day. Click the button below to
            add an exercise.
          </div>
        )}
        {dayExercises.map((exercise, index) => {
          return (
            <PlanExerciseCard
              key={exercise.id}
              exercise={exercise}
              moveUpDisabled={index === 0 && dayIndex === 0}
              moveDownDisabled={
                index === dayExercises.length - 1 &&
                dayIndex === workoutDays.length - 1
              }
              onEdit={handleEditExercise}
              onDelete={handleConfirmDeleteExercise}
              onMoveUp={() => handleMoveExercise(exercise, Direction.Up)}
              onMoveDown={() => handleMoveExercise(exercise, Direction.Down)}
            />
          );
        })}
        <Button onClick={handleAddExercise}>Add exercise</Button>
      </Flex>
      <Modal
        centered
        opened={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        title={`${exerciseToEdit ? "Edit" : "Create"} exercise`}
      >
        <ExerciseForm
          key={exerciseToEdit?.id}
          defaultValues={exerciseToEdit ?? undefined}
          onSave={handleSaveExercise}
        />
      </Modal>
      <DeleteConfirmationModal
        itemName="exercise"
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteExercise}
      />
    </div>
  );

  function handleEditExercise(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setIsExerciseModalOpen(true);
  }

  function handleAddExercise() {
    setExerciseToEdit(null);
    setIsExerciseModalOpen(true);
  }

  async function handleSaveExercise(exercise: Exercise) {
    setIsExerciseModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        ...upsertWorkoutDayExercise(
          workout,
          day.id,
          exercise,
          exerciseToEdit?.id,
        ),
        ...upsertWorkoutExerciseDefinition(workout, exercise),
      },
    });
  }

  function handleConfirmDeleteExercise(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteExercise() {
    if (!exerciseToEdit) {
      return;
    }
    await updateWorkout({
      workoutId: workout.id,
      updates: deleteWorkoutDayExercise(workout, day.id, exerciseToEdit.id),
    });
  }

  async function handleMoveExercise(exercise: Exercise, direction: Direction) {
    await updateWorkout({
      workoutId: workout.id,
      updates: reorderWorkoutDayExercise(
        workout,
        day.id,
        exercise.id,
        direction,
      ),
    });
  }
}
