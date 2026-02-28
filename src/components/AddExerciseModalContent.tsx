import { Button, Divider, Flex, Select, Text, Title } from "@mantine/core";
import { useState } from "react";

import { Workout } from "../types/Workout";

export interface AddExerciseModalContentProps {
  workout: Workout;
  onSave: (exerciseDefinitionId: string) => void;
  onCreateNew: () => void;
}

export function AddExerciseModalContent(props: AddExerciseModalContentProps) {
  const { workout, onCreateNew, onSave } = props;
  const [selectedExerciseDefinitionId, setSelectedExerciseDefinitionId] =
    useState<string | null>(null);
  const exerciseDefinitionOptions = Object.values(
    workout.exerciseDefinitionsById,
  )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((exerciseDefinition) => {
      return {
        value: exerciseDefinition.id,
        label: exerciseDefinition.name,
      };
    });

  return (
    <Flex direction="column" gap="md">
      <div>
        <Title order={5}>Add existing exercise</Title>
        <Text c="dimmed" size="sm">
          Choose an exercise already defined in this workout.
        </Text>
      </div>
      <Select
        searchable
        clearable
        data={exerciseDefinitionOptions}
        label="Existing exercise"
        nothingFoundMessage="No exercises found"
        placeholder="Search exercises"
        value={selectedExerciseDefinitionId}
        onChange={setSelectedExerciseDefinitionId}
      />
      <Divider label="Or" labelPosition="center" />
      <div>
        <Title order={5}>Create new exercise</Title>
        <Text c="dimmed" size="sm">
          Create a brand new exercise and add it to this day.
        </Text>
      </div>
      <Button variant="default" onClick={onCreateNew}>
        Create new exercise
      </Button>
      <Flex justify="flex-end">
        <Button
          color="green"
          disabled={!selectedExerciseDefinitionId}
          onClick={() => {
            if (!selectedExerciseDefinitionId) {
              return;
            }
            onSave(selectedExerciseDefinitionId);
          }}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
}
