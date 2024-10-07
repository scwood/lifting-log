import { Button, Radio, Flex, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { Exercise } from "../types/Exercise";
import { NextSessionPlan } from "../types/NextSessionPlan";
import {
  validateNumberGreaterThanZero,
  validateNumberNotEmpty,
} from "../utils/formUtils";

export interface ExerciseCompleteFormProps {
  initialValues: Exercise;
  onSave: (nextSessionPlan: NextSessionPlan) => void;
}

enum NextSessionAction {
  AddWeight = "addWeight",
  AddRep = "addRep",
  DoNothing = "doNothing",
  Custom = "custom",
}

export function ExerciseCompleteForm(props: ExerciseCompleteFormProps) {
  const { initialValues, onSave } = props;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      nextSessionAction: NextSessionAction.DoNothing,
      weight: initialValues.weight,
      sets: initialValues.sets,
      reps: initialValues.reps,
    },
    validate: {
      weight: validateNumberNotEmpty,
      sets: validateNumberGreaterThanZero,
      reps: validateNumberGreaterThanZero,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const nextSessionPlan: NextSessionPlan = {};
    switch (nextSessionAction) {
      case NextSessionAction.AddRep:
        nextSessionPlan.reps = initialValues.reps + 1;
        break;
      case NextSessionAction.AddWeight:
        nextSessionPlan.weight =
          initialValues.weight + initialValues.minimumWeightIncrement;
        nextSessionPlan.reps = values.reps;
        break;
      case NextSessionAction.Custom:
        nextSessionPlan.weight = values.weight;
        nextSessionPlan.sets = values.sets;
        nextSessionPlan.reps = values.reps;
        break;
      case NextSessionAction.DoNothing:
      default:
    }
    onSave(nextSessionPlan);
  });

  const nextSessionAction = form.getValues().nextSessionAction;

  return (
    <form onSubmit={handleSubmit}>
      <Radio.Group
        withAsterisk
        label="What do you want to do next session?"
        key={form.key("nextSessionAction")}
        {...form.getInputProps("nextSessionAction")}
      >
        <Flex gap="xs" direction="column">
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
          <div>
            <Radio
              label="Add weight"
              description="Increases weight by the minimum amount for next session"
              value={NextSessionAction.AddWeight}
            />
            {nextSessionAction === NextSessionAction.AddWeight && (
              <NumberInput
                withAsterisk
                allowDecimal={false}
                allowNegative={false}
                label="Rep goal at new weight"
                mb="xs"
                ml="xl"
                key={form.key("reps")}
                {...form.getInputProps("reps")}
              />
            )}
          </div>
          <div>
            <Radio
              label="Custom"
              description="Change the weight, reps, and/or sets for next session"
              value={NextSessionAction.Custom}
            />

            {nextSessionAction === NextSessionAction.Custom && (
              <Flex direction="column" gap={4} mt={4}>
                <NumberInput
                  withAsterisk
                  allowDecimal={false}
                  allowNegative={false}
                  label="Weight"
                  ml="xl"
                  key={form.key("weight")}
                  {...form.getInputProps("weight")}
                />
                <NumberInput
                  withAsterisk
                  allowDecimal={false}
                  allowNegative={false}
                  label="Sets"
                  ml="xl"
                  key={form.key("sets")}
                  {...form.getInputProps("sets")}
                />
                <NumberInput
                  withAsterisk
                  allowDecimal={false}
                  allowNegative={false}
                  label="Reps"
                  ml="xl"
                  required
                  key={form.key("reps")}
                  {...form.getInputProps("reps")}
                />
              </Flex>
            )}
          </div>
        </Flex>
      </Radio.Group>
      <Flex justify="flex-end" mt="lg">
        <Button color="green" type="submit">
          Save
        </Button>
      </Flex>
    </form>
  );
}
