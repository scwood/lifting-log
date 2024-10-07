import {
  Button,
  Flex,
  InputDescription,
  InputLabel,
  NumberInput,
  Radio,
  TextInput,
  Box,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { v4 as uuidV4 } from "uuid";
import { useState } from "react";

import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSetForm } from "./WarmUpSetForm";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpSetCard } from "./WarmUpSetCard";
import { moveItem } from "../utils/arrayUtils";
import {
  validateNumberGreaterThanZero,
  validateNumberNotEmpty,
  validateTextNotEmpty,
} from "../utils/formUtils";
import { FormErrorsSummary } from "./FormErrorsSummary";

export interface ExerciseModalProps {
  initialValues?: Exercise;
  onSave: (exercise: Exercise) => void;
}

export function ExerciseForm(props: ExerciseModalProps) {
  const { initialValues, onSave } = props;

  const [warmUpSets, setWarmUpSets] = useState(initialValues?.warmUpSets ?? []);
  const [isWarmUpSetModalOpen, setIsWarmUpSetModalOpen] = useState(false);
  const [warmUpSetToEdit, setWarmUpSetToEdit] = useState<WarmUpSet | null>(
    null
  );

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      weight: initialValues?.weight ?? 0,
      sets: initialValues?.sets ?? 0,
      reps: initialValues?.reps ?? 0,
      type: initialValues?.type ?? ExerciseType.DoublePlate,
      minimumWeightIncrement: initialValues?.minimumWeightIncrement ?? 0,
    },
    validate: {
      name: validateTextNotEmpty,
      weight: validateNumberNotEmpty,
      sets: validateNumberGreaterThanZero,
      reps: validateNumberGreaterThanZero,
      minimumWeightIncrement: validateNumberNotEmpty,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (initialValues) {
      onSave({
        ...initialValues,
        ...values,
        warmUpSets,
        minimumWeightIncrement: getMinimumWeightIncrement(),
      });
    } else {
      onSave({
        ...values,
        id: uuidV4(),
        warmUpSets,
        workingSets: {},
        nextSession: {},
        minimumWeightIncrement: getMinimumWeightIncrement(),
      });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="sm">
        <TextInput
          withAsterisk
          label="Name"
          description="Name of the exercise"
          placeholder="Bench press"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <NumberInput
          withAsterisk
          label="Weight"
          description="Your current working weight for the exercise"
          placeholder="150"
          allowNegative={false}
          allowDecimal
          key={form.key("weight")}
          {...form.getInputProps("weight")}
        />
        <NumberInput
          withAsterisk
          label="Sets"
          placeholder="3"
          description="Number of working sets you aim to complete currently"
          allowNegative={false}
          allowDecimal={false}
          key={form.key("sets")}
          {...form.getInputProps("sets")}
        />
        <NumberInput
          withAsterisk
          label="Reps"
          placeholder="5"
          description="Number of reps you aim to complete currently"
          allowNegative={false}
          allowDecimal={false}
          key={form.key("reps")}
          {...form.getInputProps("reps")}
        />
        <Radio.Group
          withAsterisk
          name="exerciseType"
          label="Exercise type"
          description="This field tells the app how to calculate warm-up sets. If your exercise uses plates, the app will tell you which plates to load."
          key={form.key("type")}
          {...form.getInputProps("type")}
        >
          <Flex direction="column" gap="xs" mt="xs">
            <Radio
              value={ExerciseType.DoublePlate}
              label="Two sets of plates"
              description="Use this for barbell exercises or machines that are weighted with plates on two sides (leg press, etc.)."
            />
            <Radio
              value={ExerciseType.SinglePlate}
              label="One set of plates"
              description="Use this for exercises that are weighted with a single set of plates (weighted pull-ups, dips, etc.)"
            />
            <Radio
              value={ExerciseType.Other}
              description="Use this for exercises that are not weighted with plates (dumbbell, cable machines, bodyweight etc.)"
              label="Other"
            />
          </Flex>
        </Radio.Group>
        {form.getValues().type === ExerciseType.Other && (
          <NumberInput
            withAsterisk
            allowDecimal
            ml="xl"
            allowNegative={false}
            placeholder="5"
            label="Minimum weight increment"
            description="The smallest weight increment for the exercise (might be 5 for a dumbbell exercise, 2.5 for a certain machine, etc.)"
            key={form.key("minimumWeightIncrement")}
            {...form.getInputProps("minimumWeightIncrement")}
          />
        )}
        <div>
          <InputLabel>Warm-up sets</InputLabel>
          <InputDescription>
            Optional warm-up sets for the exercise.
          </InputDescription>
        </div>
        {warmUpSets.map((warmUpSet, index) => {
          return (
            <WarmUpSetCard
              key={warmUpSet.id}
              warmUpSet={warmUpSet}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === warmUpSets.length - 1}
              onMoveUp={(warmUpSet) => handleMoveWarmUpSet(warmUpSet, "up")}
              onMoveDown={(warmUpSet) => handleMoveWarmUpSet(warmUpSet, "down")}
              onEdit={handleEditWarmUpSet}
              onDelete={handleDeleteWarmUpSet}
            />
          );
        })}
        <Button onClick={handleCreateWarmUpSet}>Add warm-up set</Button>
      </Flex>
      <Box mt="lg">
        <FormErrorsSummary form={form} />
      </Box>
      <Flex justify="flex-end" mt="md">
        <Button type="submit" color="green">
          Save
        </Button>
      </Flex>
      <Modal
        centered
        opened={isWarmUpSetModalOpen}
        onClose={() => setIsWarmUpSetModalOpen(false)}
        title={`${warmUpSetToEdit ? "Edit" : "Create"} warm-up set`}
      >
        <WarmUpSetForm
          initialValues={warmUpSetToEdit ?? undefined}
          onSave={handleSaveWarmUpSet}
        />
      </Modal>
    </form>
  );

  function handleCreateWarmUpSet() {
    setWarmUpSetToEdit(null);
    setIsWarmUpSetModalOpen(true);
  }

  function handleEditWarmUpSet(WarmUpSet: WarmUpSet) {
    setWarmUpSetToEdit(WarmUpSet);
    setIsWarmUpSetModalOpen(true);
  }

  function handleDeleteWarmUpSet(warmUpSet: WarmUpSet) {
    setWarmUpSets((prev) => {
      return prev.filter((w) => w.id !== warmUpSet.id);
    });
  }

  function handleMoveWarmUpSet(warmUpSet: WarmUpSet, direction: "up" | "down") {
    setWarmUpSets((prev) => {
      return moveItem(prev, (w) => w.id === warmUpSet.id, direction);
    });
  }

  function handleSaveWarmUpSet(warmUpSet: WarmUpSet) {
    setIsWarmUpSetModalOpen(false);
    if (warmUpSetToEdit) {
      setWarmUpSets((prev) => {
        return prev.map((w) => {
          return w.id === warmUpSetToEdit.id ? warmUpSet : w;
        });
      });
    } else {
      setWarmUpSets((prev) => {
        return [...prev, warmUpSet];
      });
    }
  }

  function getMinimumWeightIncrement() {
    if (form.getValues().type === ExerciseType.DoublePlate) {
      return 5;
    } else if (form.getValues().type === ExerciseType.SinglePlate) {
      return 2.5;
    } else {
      return form.getValues().minimumWeightIncrement;
    }
  }
}
