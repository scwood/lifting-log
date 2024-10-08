import { useState } from "react";
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

import { Day } from "../types/Day";
import { ExerciseForm } from "./ExerciseForm";
import { Exercise } from "../types/Exercise";
import { PlanExerciseCard } from "./PlanExerciseCard";
import { moveItem } from "../utils/arrayUtils";
import { Workout } from "../types/Workout";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

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

  return (
    <div>
      <Title order={3}>
        <Flex justify="space-between" align="center">
          <span>Day: {day.name}</span>
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
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
        {day.exercises.map((exercise, index) => {
          return (
            <PlanExerciseCard
              key={exercise.id}
              exercise={exercise}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === day.exercises.length - 1}
              onEdit={handleEditExercise}
              onDelete={handleConfirmDeleteExercise}
              onMoveUp={(exercise) => handleMoveExercise(exercise, "up")}
              onMoveDown={(exercise) => {
                handleMoveExercise(exercise, "down");
              }}
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
          initialValues={exerciseToEdit ?? undefined}
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
    let exercises: Exercise[];
    if (exerciseToEdit) {
      exercises = day.exercises.map((e) => {
        return e.id === exerciseToEdit.id ? exercise : e;
      });
    } else {
      exercises = [...day.exercises, exercise];
    }
    await updateExercises(exercises);
  }

  function handleConfirmDeleteExercise(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteExercise() {
    if (!exerciseToEdit) {
      return;
    }
    const exercises = day.exercises.filter((e) => e.id !== exerciseToEdit.id);
    await updateExercises(exercises);
  }

  async function handleMoveExercise(
    exercise: Exercise,
    direction: "up" | "down"
  ) {
    const exercises = moveItem(
      day.exercises,
      (e) => e.id === exercise.id,
      direction
    );
    await updateExercises(exercises);
  }

  async function updateExercises(exercises: Exercise[]) {
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        days: workout.days.map((d) =>
          d.id === day.id ? { ...d, exercises } : d
        ),
      },
    });
  }
}
