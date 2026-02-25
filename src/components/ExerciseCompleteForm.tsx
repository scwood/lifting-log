import { Flex, Radio } from "@mantine/core";
import z from "zod";

import { useAppForm } from "../hooks/useAppForm";
import { Exercise } from "../types/Exercise";
import { NextSessionPlan } from "../types/NextSessionPlan";

export interface ExerciseCompleteFormProps {
  defaultValues: Exercise;
  onSave: (nextSessionPlan: NextSessionPlan) => void;
}

enum NextSessionAction {
  AddWeight = "addWeight",
  AddRep = "addRep",
  DoNothing = "doNothing",
  Custom = "custom",
}

const formSchema = z.object({
  nextSessionAction: z.enum(NextSessionAction),
  weight: z
    .number("Weight is required")
    .min(0, "Weight must be greater than or equal to 0"),
  reps: z
    .number("Reps is required")
    .min(1, "Reps must be greater than or equal to 1"),
  sets: z
    .number("Sets is required")
    .min(1, "Sets must be greater than or equal to 1"),
});

export function ExerciseCompleteForm(props: ExerciseCompleteFormProps) {
  const { defaultValues, onSave } = props;

  const form = useAppForm({
    defaultValues: {
      nextSessionAction: NextSessionAction.DoNothing,
      weight: defaultValues.weight,
      sets: defaultValues.sets,
      reps: defaultValues.reps,
    },
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      const nextSessionPlan: NextSessionPlan = {};
      const { nextSessionAction, reps, weight, sets } = value;
      switch (nextSessionAction) {
        case NextSessionAction.AddRep:
          nextSessionPlan.reps = defaultValues.reps + 1;
          break;
        case NextSessionAction.AddWeight:
          nextSessionPlan.weight =
            defaultValues.weight + defaultValues.minimumWeightIncrement;
          nextSessionPlan.reps = reps;
          break;
        case NextSessionAction.Custom:
          nextSessionPlan.weight = weight;
          nextSessionPlan.sets = sets;
          nextSessionPlan.reps = reps;
          break;
        case NextSessionAction.DoNothing:
        default:
      }
      onSave(nextSessionPlan);
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
      <form.AppField name="nextSessionAction">
        {(field) => {
          return (
            <field.AppRadioGroup
              withAsterisk
              label="What do you want to do next session?"
            >
              <Flex direction="column" gap="xs">
                <Radio
                  mt="md"
                  label="Do nothing"
                  description="Keep things the same for next session"
                  value={NextSessionAction.DoNothing}
                />
                <Radio
                  label="Add a rep"
                  description="Add a single rep for next session"
                  value={NextSessionAction.AddRep}
                />
                <Radio
                  label="Add weight"
                  description="Increases weight by the minimum amount for next session"
                  value={NextSessionAction.AddWeight}
                />
                <Radio
                  label="Custom"
                  description="Change the weight, reps, and/or sets for next session"
                  value={NextSessionAction.Custom}
                />
              </Flex>
            </field.AppRadioGroup>
          );
        }}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.nextSessionAction}>
        {(nextSessionAction) => {
          return (
            <Flex direction="column" gap={4} ml="xl" mt={4}>
              <form.AppField name="weight">
                {(field) => {
                  return (
                    <field.AppNumberInput
                      label="Weight"
                      withAsterisk
                      disabled={nextSessionAction !== NextSessionAction.Custom}
                      allowDecimal
                      inputMode="decimal"
                      allowNegative={false}
                      hideControls
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="sets">
                {(field) => {
                  return (
                    <field.AppNumberInput
                      label="Sets"
                      withAsterisk
                      disabled={nextSessionAction !== NextSessionAction.Custom}
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
                      label="Reps"
                      withAsterisk
                      disabled={nextSessionAction !== NextSessionAction.Custom}
                      allowNegative={false}
                      allowDecimal={false}
                      inputMode="numeric"
                      hideControls
                    />
                  );
                }}
              </form.AppField>
            </Flex>
          );
        }}
      </form.Subscribe>
      <form.AppForm>
        <Flex justify="flex-end" mt="lg">
          <form.AppSubmitButton />
        </Flex>
      </form.AppForm>
    </form>
  );
}
