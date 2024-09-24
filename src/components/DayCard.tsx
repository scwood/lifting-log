import { useState } from "react";
import { ActionIcon, Button, Card, Flex, Menu, Title } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { Day } from "../types/Day";
import { ExerciseModal } from "./ExerciseModal";
import { Exercise } from "../types/Exercise";
import { PlanExerciseCard } from "./PlanExerciseCard";
import { arraySwap } from "../utils/arraySwap";
import { Workout } from "../types/Workout";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";

export interface DayCardProps {
  day: Day;
  workout: Workout;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (day: Day) => void;
  onDelete: (day: Day) => void;
  onMoveUp: (day: Day) => void;
  onMoveDown: (day: Day) => void;
}

export function DayCard(props: DayCardProps) {
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
    <>
      <Card withBorder shadow="sm">
        <Card.Section inheritPadding withBorder py="xs" mb={6}>
          <Flex justify="space-between" align="center">
            <Title order={4}>{day.name}</Title>
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
        </Card.Section>
        <Card.Section withBorder inheritPadding py="md">
          <Flex direction="column" gap="sm">
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
            <Button onClick={handleCreateExercise}>Create exercise</Button>
          </Flex>
        </Card.Section>
      </Card>
      <ExerciseModal
        exercise={exerciseToEdit ?? undefined}
        onSave={handleSaveExercise}
        opened={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
      />
    </>
  );

  function handleEditExercise(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setIsExerciseModalOpen(true);
  }

  function handleCreateExercise() {
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
