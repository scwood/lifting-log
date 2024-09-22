import { useState } from "react";
import { ActionIcon, Button, Card, Flex, Menu, Title } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { Day } from "../types/Day";
import { ExerciseModal } from "./ExerciseModal";
import { Exercise } from "../types/Exercise";
import { PlanExerciseCard } from "./PlanExerciseCard";
import { arraySwap } from "../utils/arraySwap";

export interface DayCardProps {
  day: Day;
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
    moveDownDisabled,
    moveUpDisabled,
    onEdit,
    onDelete,
    onMoveDown,
    onMoveUp,
  } = props;
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(day.exercises);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

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
            {exercises.map((exercise, index) => {
              return (
                <PlanExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  moveUpDisabled={index === 0}
                  moveDownDisabled={index === exercises.length - 1}
                  onEdit={handleEditExercise}
                  onDelete={handleDeleteExercise}
                  onMoveUp={handleMoveUpExercise}
                  onMoveDown={handleMoveDownExercise}
                />
              );
            })}
            <div>
              <Button onClick={handleCreateExercise}>Create exercise</Button>
            </div>
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

  function handleSaveExercise(exercise: Exercise) {
    if (exerciseToEdit) {
      setExercises((prev) => {
        return prev.map((e) => {
          return e.id === exerciseToEdit.id ? exercise : e;
        });
      });
    } else {
      setExercises((prev) => {
        return [...prev, exercise];
      });
    }
  }

  function handleEditExercise(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setIsExerciseModalOpen(true);
  }

  function handleCreateExercise() {
    setExerciseToEdit(null);
    setIsExerciseModalOpen(true);
  }

  function handleDeleteExercise(exercise: Exercise) {
    setExercises((prev) => {
      return prev.filter((e) => e.id !== exercise.id);
    });
  }

  function handleMoveUpExercise(exercise: Exercise) {
    setExercises((prev) => {
      const index = prev.findIndex((e) => e.id === exercise.id);
      if (index === 0 || index === -1) {
        return prev;
      }
      return arraySwap(prev, index, index - 1);
    });
  }

  function handleMoveDownExercise(exercise: Exercise) {
    setExercises((prev) => {
      const index = prev.findIndex((e) => e.id === exercise.id);
      if (index === prev.length - 1 || index === -1) {
        return prev;
      }
      return arraySwap(prev, index, index + 1);
    });
  }
}
