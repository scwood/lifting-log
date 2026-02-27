import {
  Button,
  Flex,
  InputDescription,
  InputLabel,
  Modal,
  Radio,
} from "@mantine/core";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import z from "zod";

import { useAppForm } from "../hooks/useAppForm";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { Direction, moveItem } from "../utils/arrayUtils";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { WarmUpSetCard } from "./WarmUpSetCard";
import { WarmUpSetForm } from "./WarmUpSetForm";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  weight: z
    .number("Weight is required")
    .min(0, "Weight must be greater than or equal to 0"),
  sets: z
    .number("Sets is required")
    .min(1, "Sets must be greater than or equal to 1"),
  reps: z
    .number("Reps is required")
    .min(1, "Reps must be greater than or equal to 1"),
  type: z.enum(ExerciseType),
  minimumWeightIncrement: z
    .number("Minimum weight increment is required")
    .gt(0, "Minimum weight increment must be greater than 0"),
});

export interface ExerciseFormProps {
  defaultValues?: ExerciseDefinition;
  onSave: (exercise: ExerciseDefinition) => void;
}

export function ExerciseForm(props: ExerciseFormProps) {
  const { defaultValues, onSave } = props;

  const [warmUpSets, setWarmUpSets] = useState(defaultValues?.warmUpSets ?? []);
  const [isWarmUpSetModalOpen, setIsWarmUpSetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [warmUpSetToEdit, setWarmUpSetToEdit] = useState<WarmUpSet | null>(
    null,
  );

  const form = useAppForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      weight: defaultValues?.trainingLoad.weight,
      sets: defaultValues?.trainingLoad.sets,
      reps: defaultValues?.trainingLoad.reps,
      type: defaultValues?.type ?? ExerciseType.DoublePlate,
      minimumWeightIncrement: defaultValues?.minimumWeightIncrement ?? 5,
    },
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const parsedValues = formSchema.parse(value);
      if (defaultValues) {
        onSave({
          ...defaultValues,
          type: parsedValues.type,
          name: parsedValues.name,
          minimumWeightIncrement: parsedValues.minimumWeightIncrement,
          trainingLoad: {
            sets: parsedValues.sets,
            reps: parsedValues.reps,
            weight: parsedValues.weight,
          },
          warmUpSets,
        });
      } else {
        onSave({
          id: uuidV4(),
          type: parsedValues.type,
          name: parsedValues.name,
          minimumWeightIncrement: parsedValues.minimumWeightIncrement,
          trainingLoad: {
            sets: parsedValues.sets,
            reps: parsedValues.reps,
            weight: parsedValues.weight,
          },
          warmUpSets,
        });
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Flex direction="column" gap="sm">
        <form.AppField name="name">
          {(field) => {
            return (
              <field.AppTextInput
                withAsterisk
                label="Name"
                description="Name of the exercise"
                placeholder="Bench press"
              />
            );
          }}
        </form.AppField>
        <form.AppField name="weight">
          {(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Weight"
                description="Your current working weight for the exercise"
                placeholder="150"
                allowNegative={false}
                allowDecimal
                inputMode="decimal"
                hideControls
              />
            );
          }}
        </form.AppField>
        <form.AppField name="sets">
          {(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Sets"
                placeholder="3"
                description="Number of working sets you aim to complete currently"
                allowNegative={false}
                allowDecimal={false}
                inputMode="numeric"
                hideControls
              />
            );
          }}
        </form.AppField>
        <form.AppField name="reps">
          {(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Reps"
                placeholder="5"
                description="Number of reps you aim to complete currently"
                allowNegative={false}
                allowDecimal={false}
                inputMode="numeric"
                hideControls
              />
            );
          }}
        </form.AppField>
        <form.AppField
          name="type"
          listeners={{
            onChange: ({ value }) => {
              if (value === ExerciseType.SinglePlate) {
                form.setFieldValue("minimumWeightIncrement", 2.5);
              } else {
                form.setFieldValue("minimumWeightIncrement", 5);
              }
            },
          }}
        >
          {(field) => {
            return (
              <field.AppRadioGroup
                withAsterisk
                name="exerciseType"
                label="Exercise type"
                description="This field tells the app how to calculate warm-up sets. If your exercise uses plates, the app will tell you which plates to load."
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
              </field.AppRadioGroup>
            );
          }}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) => {
            return (
              type === ExerciseType.Other && (
                <form.AppField name="minimumWeightIncrement">
                  {(field) => {
                    return (
                      <field.AppNumberInput
                        withAsterisk
                        allowDecimal
                        inputMode="decimal"
                        ml="xl"
                        allowNegative={false}
                        placeholder="5"
                        label="Minimum weight increment"
                        description="The smallest weight increment for the exercise (might be 5 for a dumbbell exercise, 2.5 for a certain machine, etc.)"
                        hideControls
                      />
                    );
                  }}
                </form.AppField>
              )
            );
          }}
        </form.Subscribe>
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
              onMoveUp={() => handleMoveWarmUpSet(index, Direction.Up)}
              onMoveDown={() => handleMoveWarmUpSet(index, Direction.Down)}
              onEdit={handleEditWarmUpSet}
              onDelete={handleConfirmDeleteWarmUpSet}
            />
          );
        })}
        <Button onClick={handleCreateWarmUpSet}>Add warm-up set</Button>
      </Flex>
      <form.AppForm>
        <Flex justify="flex-end" mt="md">
          <form.AppSubmitButton />
        </Flex>
      </form.AppForm>
      <Modal
        centered
        opened={isWarmUpSetModalOpen}
        onClose={() => setIsWarmUpSetModalOpen(false)}
        title={`${warmUpSetToEdit ? "Edit" : "Create"} warm-up set`}
      >
        <WarmUpSetForm
          defaultValues={warmUpSetToEdit ?? undefined}
          onSave={handleSaveWarmUpSet}
        />
      </Modal>
      <DeleteConfirmationModal
        opened={isDeleteModalOpen}
        itemName="warm-up set"
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteWarmUpSet}
      />
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

  function handleConfirmDeleteWarmUpSet(warmUpSet: WarmUpSet) {
    setWarmUpSetToEdit(warmUpSet);
    setIsDeleteModalOpen(true);
  }

  function handleDeleteWarmUpSet() {
    if (!warmUpSetToEdit) {
      return;
    }
    setWarmUpSets((prev) => {
      return prev.filter((w) => w.id !== warmUpSetToEdit.id);
    });
  }

  function handleMoveWarmUpSet(index: number, direction: Direction) {
    setWarmUpSets((prev) => moveItem(prev, index, direction));
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
}
