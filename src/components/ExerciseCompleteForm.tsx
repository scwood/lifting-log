import { Button, Radio, Flex, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

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
  const [nextSessionAction, setNextSessionAction] = useState<NextSessionAction>(
    NextSessionAction.DoNothing
  );

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
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

  return (
    <div>
      <Radio.Group
        value={nextSessionAction}
        onChange={(value) => setNextSessionAction(value as NextSessionAction)}
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
      </Radio.Group>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4} ml="xl" mt={4}>
          <NumberInput
            withAsterisk
            disabled={nextSessionAction !== NextSessionAction.Custom}
            allowDecimal={false}
            allowNegative={false}
            label="Weight"
            key={form.key("weight")}
            {...form.getInputProps("weight")}
          />
          <NumberInput
            withAsterisk
            disabled={nextSessionAction !== NextSessionAction.Custom}
            allowDecimal={false}
            allowNegative={false}
            label="Sets"
            key={form.key("sets")}
            {...form.getInputProps("sets")}
          />
          <NumberInput
            withAsterisk
            disabled={nextSessionAction !== NextSessionAction.Custom}
            allowDecimal={false}
            allowNegative={false}
            label="Reps"
            required
            key={form.key("reps")}
            {...form.getInputProps("reps")}
          />
        </Flex>
        <Flex justify="flex-end" mt="lg">
          <Button color="green" type="submit">
            Save
          </Button>
        </Flex>
      </form>
    </div>
  );
}
