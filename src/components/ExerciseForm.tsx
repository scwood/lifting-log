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
import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { moveItem } from "../utils/arrayUtils";
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

export interface ExerciseModalProps {
  defaultValues?: Exercise;
  onSave: (exercise: Exercise) => void;
}

export function ExerciseForm(props: ExerciseModalProps) {
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
      weight: defaultValues?.weight,
      sets: defaultValues?.sets,
      reps: defaultValues?.reps,
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
          ...parsedValues,
          warmUpSets,
        });
      } else {
        onSave({
          ...parsedValues,
          id: uuidV4(),
          warmUpSets,
          workingSets: {},
          nextSession: {},
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
        <form.AppField
          name="name"
          children={(field) => {
            return (
              <field.AppTextInput
                withAsterisk
                label="Name"
                description="Name of the exercise"
                placeholder="Bench press"
              />
            );
          }}
        />
        <form.AppField
          name="weight"
          children={(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Weight"
                description="Your current working weight for the exercise"
                placeholder="150"
                allowNegative={false}
                allowDecimal
              />
            );
          }}
        />
        <form.AppField
          name="sets"
          children={(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Sets"
                placeholder="3"
                description="Number of working sets you aim to complete currently"
                allowNegative={false}
                allowDecimal={false}
              />
            );
          }}
        />
        <form.AppField
          name="reps"
          children={(field) => {
            return (
              <field.AppNumberInput
                withAsterisk
                label="Reps"
                placeholder="5"
                description="Number of reps you aim to complete currently"
                allowNegative={false}
                allowDecimal={false}
              />
            );
          }}
        />
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
          children={(field) => {
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
        />
        <form.Subscribe
          selector={(state) => state.values.type}
          children={(type) => {
            return (
              type === ExerciseType.Other && (
                <form.AppField
                  name="minimumWeightIncrement"
                  children={(field) => {
                    return (
                      <field.AppNumberInput
                        withAsterisk
                        allowDecimal
                        ml="xl"
                        allowNegative={false}
                        placeholder="5"
                        label="Minimum weight increment"
                        description="The smallest weight increment for the exercise (might be 5 for a dumbbell exercise, 2.5 for a certain machine, etc.)"
                      />
                    );
                  }}
                />
              )
            );
          }}
        />
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
}
