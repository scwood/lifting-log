import { Checkbox, NumberInput, Table, Tooltip } from "@mantine/core";
import { useState } from "react";

import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { WorkingSet } from "../types/WorkingSet";
import { calculatePlates } from "../utils/weightUtils";
import { selectExerciseUsesPlates } from "../utils/workoutSelectors";

export interface WorkingSetTableRowProps {
  exerciseDefinition: ExerciseDefinition;
  setNumber: number;
  workingSet: WorkingSet;
  onChange: (workingSet: WorkingSet) => void;
}

export function WorkingSetTableRow(props: WorkingSetTableRowProps) {
  const { exerciseDefinition, setNumber, workingSet, onChange } = props;

  const [localReps, setLocalReps] = useState(
    workingSet.reps ?? exerciseDefinition.trainingLoad.reps,
  );
  const [localWeight, setLocalWeight] = useState(
    workingSet.weight ?? exerciseDefinition.trainingLoad.weight,
  );

  // When the training load changes (e.g. after completing this exercise on
  // another day), reset local state to reflect the new defaults — but only for
  // sets the user hasn't touched yet.
  const [prevExerciseDefinition, setPrevExerciseDefinition] =
    useState(exerciseDefinition);
  if (exerciseDefinition !== prevExerciseDefinition) {
    setPrevExerciseDefinition(exerciseDefinition);
    if (workingSet.reps === null) {
      setLocalReps(exerciseDefinition.trainingLoad.reps);
    }
    if (workingSet.weight === null) {
      setLocalWeight(exerciseDefinition.trainingLoad.weight);
    }
  }

  const weightInputWidth = getDynamicInputWidth(localWeight);
  const repsInputWidth = getDynamicInputWidth(localReps);

  const isLocalRepsValid = localReps >= 0;
  const isLocalWeightValid = localWeight >= 0;
  const isSetValid = isLocalRepsValid && isLocalWeightValid;

  return (
    <Table.Tr>
      <Table.Td>
        <NumberInput
          inputMode="decimal"
          styles={{
            input: {
              width: `${weightInputWidth}ch`,
              textAlign: "center",
            },
          }}
          allowDecimal
          min={0}
          placeholder={String(exerciseDefinition.trainingLoad.weight)}
          aria-label={`Weight for set ${setNumber}`}
          value={localWeight}
          onChange={handleOnChangeWeight}
          onFocus={handleOnFocusWeight}
          hideControls
        />
      </Table.Td>
      {selectExerciseUsesPlates(exerciseDefinition) && (
        <Table.Td>
          {isLocalWeightValid
            ? calculatePlates(localWeight, exerciseDefinition.type)
            : ""}
        </Table.Td>
      )}
      <Table.Td>
        <NumberInput
          inputMode="numeric"
          styles={{
            input: {
              width: `${repsInputWidth}ch`,
              textAlign: "center",
            },
          }}
          allowDecimal={false}
          max={99}
          min={0}
          placeholder={String(exerciseDefinition.trainingLoad.reps)}
          aria-label={`Reps for set ${setNumber}`}
          value={localReps}
          onChange={handleOnChangeReps}
          onFocus={handleOnFocusReps}
          hideControls
        />
      </Table.Td>
      <Table.Td>
        <Tooltip
          label="Enter weight and reps to log"
          withArrow
          disabled={isSetValid}
          events={{ hover: true, touch: true, focus: false }}
        >
          <Checkbox
            size="md"
            color="green"
            onChange={handleOnChangeIsLogged}
            disabled={!isSetValid}
            checked={workingSet.isLogged}
          />
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );

  function handleOnChangeReps(value: string | number) {
    const parsedValue = parseInt(String(value));
    const isValid = parsedValue >= 0;
    setLocalReps(parsedValue);
    onChange({
      isLogged: isValid && isLocalWeightValid ? workingSet.isLogged : false,
      reps: isValid ? parsedValue : null,
      weight: isLocalWeightValid ? localWeight : null,
    });
  }

  function handleOnChangeIsLogged(event: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      isLogged: event.target.checked,
      reps: isLocalRepsValid ? localReps : null,
      weight: isLocalWeightValid ? localWeight : null,
    });
  }

  function handleOnChangeWeight(value: string | number) {
    const parsedValue = parseFloat(String(value));
    const isValid = parsedValue >= 0;
    setLocalWeight(parsedValue);
    onChange({
      isLogged: isValid && isLocalRepsValid ? workingSet.isLogged : false,
      reps: isLocalRepsValid ? localReps : null,
      weight: isValid ? parsedValue : null,
    });
  }

  function handleOnFocusReps(event: React.FocusEvent<HTMLInputElement>) {
    event.currentTarget.select();
  }

  function handleOnFocusWeight(event: React.FocusEvent<HTMLInputElement>) {
    event.currentTarget.select();
  }
}

function getDynamicInputWidth(value: number): number {
  const valueText = Number.isFinite(value) ? String(value) : " ";
  const buffer = 4;
  return valueText.length + buffer;
}
