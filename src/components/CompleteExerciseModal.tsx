import { Button, Modal, Radio, Flex, NumberInput } from "@mantine/core";
import { useState } from "react";

import { Exercise } from "../types/Exercise";
import { NextSessionPlan } from "../types/NextSessionPlan";

export interface CompleteExerciseModalProps {
  exercise: Exercise | null;
  opened: boolean;
  onClose: () => void;
  onSave: (nextSessionPlan: NextSessionPlan) => void;
}

enum NextSessionAction {
  AddWeight = "addWeight",
  AddRep = "addRep",
  DoNothing = "doNothing",
  Custom = "custom",
}

export function CompleteExerciseModal(props: CompleteExerciseModalProps) {
  const { opened, exercise, onClose, onSave } = props;
  const [nextSessionAction, setNextSessionAction] = useState<NextSessionAction>(
    NextSessionAction.DoNothing
  );
  const [weight, setWeight] = useState<number | string>(exercise?.weight ?? "");
  const [sets, setSets] = useState<number | string>(exercise?.sets ?? "");
  const [reps, setReps] = useState<number | string>(exercise?.reps ?? "");

  const [prevOpened, setPrevOpened] = useState(opened);
  if (prevOpened !== opened) {
    setPrevOpened(opened);
    resetInputs();
  }

  const parsedNumbers = {
    weight: parseInt(String(weight)),
    sets: parseInt(String(sets)),
    reps: parseInt(String(reps)),
  };

  return (
    <Modal opened={opened} onClose={onClose} centered title="Exercise complete">
      <Radio.Group
        label="What do you want to do next session?"
        required
        value={nextSessionAction ?? ""}
        onChange={(value) => setNextSessionAction(value as NextSessionAction)}
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
                allowDecimal={false}
                allowNegative={false}
                value={reps}
                onChange={setReps}
                label="Rep goal at new weight"
                required
                mb="xs"
                ml="xl"
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
                  allowDecimal={false}
                  allowNegative={false}
                  value={weight}
                  onChange={setWeight}
                  label="Weight"
                  ml="xl"
                  required
                />
                <NumberInput
                  allowDecimal={false}
                  allowNegative={false}
                  value={sets}
                  onChange={setSets}
                  label="Sets"
                  ml="xl"
                  required
                />
                <NumberInput
                  allowDecimal={false}
                  allowNegative={false}
                  value={reps}
                  onChange={setReps}
                  label="Reps"
                  ml="xl"
                  required
                />
              </Flex>
            )}
          </div>
        </Flex>
      </Radio.Group>
      <Flex justify="flex-end" mt="lg">
        <Button color="green" disabled={!isSaveEnabled()} onClick={handleSave}>
          Save
        </Button>
      </Flex>
    </Modal>
  );

  function handleSave() {
    if (exercise === null) {
      return;
    }
    const nextSessionPlan: NextSessionPlan = {};
    switch (nextSessionAction) {
      case NextSessionAction.AddRep:
        nextSessionPlan.reps = exercise.reps + 1;
        break;
      case NextSessionAction.AddWeight:
        nextSessionPlan.weight =
          exercise.weight + exercise.minimumWeightIncrement;
        nextSessionPlan.reps = parsedNumbers.reps;
        break;
      case NextSessionAction.Custom:
        nextSessionPlan.weight = parsedNumbers.weight;
        nextSessionPlan.sets = parsedNumbers.sets;
        nextSessionPlan.reps = parsedNumbers.reps;
        break;
      case NextSessionAction.DoNothing:
      default:
    }
    onSave(nextSessionPlan);
    onClose();
  }

  function isSaveEnabled() {
    if (nextSessionAction === NextSessionAction.Custom) {
      return (
        parsedNumbers.weight >= 0 &&
        parsedNumbers.sets >= 0 &&
        parsedNumbers.reps >= 0
      );
    }
    if (nextSessionAction === NextSessionAction.AddWeight) {
      return parsedNumbers.reps >= 0;
    }
    return true;
  }

  function resetInputs() {
    setNextSessionAction(NextSessionAction.DoNothing);
    setWeight(exercise?.weight ?? "");
    setSets(exercise?.sets ?? "");
    setReps(exercise?.reps ?? "");
  }
}
