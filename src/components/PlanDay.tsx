import { useState } from "react";
import { ActionIcon, Button, Divider, Flex, Menu, Title } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { Day } from "../types/Day";
import { ExerciseModal } from "./ExerciseModal";
import { Exercise } from "../types/Exercise";
import { PlanExerciseCard } from "./PlanExerciseCard";
import { arraySwap } from "../utils/arraySwap";
import { Workout } from "../types/Workout";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";

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
              onDelete={handleDeleteExercise}
              onMoveUp={(exercise) => handleMoveExercise(exercise, "up")}
              onMoveDown={(exercise) => {
                handleMoveExercise(exercise, "down");
              }}
            />
          );
        })}
        <Button onClick={handleAddExercise}>Add exercise</Button>
      </Flex>
      <ExerciseModal
        exercise={exerciseToEdit ?? undefined}
        onSave={handleSaveExercise}
        opened={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
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

  async function handleDeleteExercise(exercise: Exercise) {
    const exercises = day.exercises.filter((e) => e.id !== exercise.id);
    await updateExercises(exercises);
  }

  async function handleMoveExercise(
    exercise: Exercise,
    direction: "up" | "down"
  ) {
    const index = day.exercises.findIndex((e) => e.id === exercise.id);
    const directionLimit = direction === "up" ? 0 : day.exercises.length - 1;
    if (index === -1 || index === directionLimit) {
      return;
    }
    const exercises = arraySwap(
      day.exercises,
      index,
      direction === "up" ? index - 1 : index + 1
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
