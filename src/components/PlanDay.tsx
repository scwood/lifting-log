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
import { v4 as uuidV4 } from "uuid";

import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { Day } from "../types/Day";
import { DayExercise } from "../types/DayExercise";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { Workout } from "../types/Workout";
import { Direction } from "../utils/arrayUtils";
import {
  deleteWorkoutDayExercise,
  deleteWorkoutExerciseDefinition,
  reorderWorkoutDayExercise,
  upsertWorkoutDayExercise,
  upsertWorkoutExerciseDefinition,
} from "../utils/workoutMutationHelpers";
import {
  selectDayExercises,
  selectExerciseDefinition,
  selectWorkoutDays,
} from "../utils/workoutSelectors";
import { AddExerciseModalContent } from "./AddExerciseModalContent";
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
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isExerciseFormModalOpen, setIsExerciseFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<DayExercise | null>(
    null,
  );
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const workoutDays = selectWorkoutDays(workout);
  const dayExercises = selectDayExercises(day);
  const dayIndex = workoutDays.findIndex((d) => d.id === day.id);

  const exerciseDefinitionToEdit = exerciseToEdit
    ? selectExerciseDefinition(workout, exerciseToEdit)
    : undefined;

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
              workout={workout}
              exercise={exercise}
              moveUpDisabled={index === 0 && dayIndex === 0}
              moveDownDisabled={
                index === dayExercises.length - 1 &&
                dayIndex === workoutDays.length - 1
              }
              onEdit={handleEditExercise}
              onRemoveFromDay={handleRemoveFromDay}
              onDelete={handleConfirmDeleteExercise}
              onMoveUp={() => handleMoveExercise(exercise, Direction.Up)}
              onMoveDown={() => handleMoveExercise(exercise, Direction.Down)}
            />
          );
        })}
        <Button onClick={handleOpenAddExerciseModal}>Add new exercise</Button>
      </Flex>
      <Modal
        centered
        opened={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        title="Add exercise"
      >
        <AddExerciseModalContent
          workout={workout}
          onCreateNew={handleCreateNewExercise}
          onSave={handleSaveExistingExercise}
        />
      </Modal>
      <Modal
        centered
        opened={isExerciseFormModalOpen}
        onClose={() => setIsExerciseFormModalOpen(false)}
        title={`${exerciseToEdit ? "Edit" : "Create"} exercise`}
      >
        <ExerciseForm
          key={exerciseDefinitionToEdit?.id}
          defaultValues={exerciseDefinitionToEdit}
          onSave={handleSaveExercise}
        />
      </Modal>
      <DeleteConfirmationModal
        title="Delete exercise"
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteExercise}
      >
        Are you sure you want to permanently delete this exercise? It will be
        removed from every day in your plan.
      </DeleteConfirmationModal>
    </div>
  );

  function handleEditExercise(exercise: DayExercise) {
    setExerciseToEdit(exercise);
    setIsExerciseFormModalOpen(true);
  }

  function handleOpenAddExerciseModal() {
    setIsAddExerciseModalOpen(true);
  }

  function handleCreateNewExercise() {
    setIsAddExerciseModalOpen(false);
    setExerciseToEdit(null);
    setIsExerciseFormModalOpen(true);
  }

  async function handleSaveExistingExercise(exerciseDefinitionId: string) {
    setIsAddExerciseModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: upsertWorkoutDayExercise(workout, day.id, {
        id: uuidV4(),
        workingSets: {},
        exerciseDefinitionId,
        definitionTrainingLoadBeforeCompletion: null,
      }),
    });
  }

  async function handleSaveExercise(exerciseDefinition: ExerciseDefinition) {
    setIsExerciseFormModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        ...upsertWorkoutDayExercise(
          workout,
          day.id,
          exerciseToEdit || {
            id: uuidV4(),
            workingSets: {},
            exerciseDefinitionId: exerciseDefinition.id,
            definitionTrainingLoadBeforeCompletion: null,
          },
        ),
        ...upsertWorkoutExerciseDefinition(workout, exerciseDefinition),
      },
    });
  }

  async function handleRemoveFromDay(exercise: DayExercise) {
    await updateWorkout({
      workoutId: workout.id,
      updates: deleteWorkoutDayExercise(workout, day.id, exercise.id),
    });
  }

  function handleConfirmDeleteExercise(exercise: DayExercise) {
    setExerciseToEdit(exercise);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteExercise() {
    if (!exerciseToEdit) {
      return;
    }
    await updateWorkout({
      workoutId: workout.id,
      updates: deleteWorkoutExerciseDefinition(
        workout,
        exerciseToEdit.exerciseDefinitionId,
      ),
    });
  }

  async function handleMoveExercise(
    exercise: DayExercise,
    direction: Direction,
  ) {
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
