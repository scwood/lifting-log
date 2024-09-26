import {
  Button,
  Flex,
  InputDescription,
  InputLabel,
  Modal,
  NumberInput,
  Radio,
  TextInput,
} from "@mantine/core";
import { v4 as uuidV4 } from "uuid";

import { Exercise } from "../types/Exercise";
import { useState } from "react";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSetModal } from "./WarmUpSetModal";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpSetCard } from "./WarmUpSetCard";
import { arraySwap } from "../utils/arraySwap";

export interface ExerciseModalProps {
  opened: boolean;
  exercise?: Exercise;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseModal(props: ExerciseModalProps) {
  const { opened, exercise, onClose, onSave } = props;

  const [name, setName] = useState(exercise?.name ?? "");
  const [weight, setWeight] = useState<string | number>(exercise?.weight ?? "");
  const [sets, setSets] = useState<string | number>(exercise?.sets ?? "");
  const [reps, setReps] = useState<string | number>(exercise?.reps ?? "");
  const [exerciseType, setExerciseType] = useState(
    exercise?.type ?? ExerciseType.Barbell
  );

  const [warmUpSets, setWarmUpSets] = useState(exercise?.warmUpSets ?? []);
  const [isWarmUpSetModalOpen, setIsWarmUpSetModalOpen] = useState(false);
  const [warmUpSetToEdit, setWarmUpSetToEdit] = useState<WarmUpSet | null>(
    null
  );

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
    <>
      <Modal
        centered
        opened={opened}
        onClose={onClose}
        title={`${exercise ? "Edit" : "Create"} exercise`}
      >
        <Flex direction="column" gap="sm">
          <TextInput
            required
            label="Name"
            description="Name of the exercise"
            placeholder="Bench press"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <NumberInput
            required
            label="Weight"
            description="Your current working weight for the exercise in pounds"
            value={weight}
            placeholder="150"
            allowNegative={false}
            allowDecimal={false}
            onChange={setWeight}
          />
          <NumberInput
            required
            label="Sets"
            placeholder="3"
            description="Number of working sets you aim to complete currently"
            value={sets}
            allowNegative={false}
            allowDecimal={false}
            onChange={setSets}
          />
          <NumberInput
            required
            label="Reps"
            placeholder="5"
            description="Number of reps you aim to complete per working set currently"
            allowNegative={false}
            allowDecimal={false}
            value={reps}
            onChange={setReps}
          />
          <Radio.Group
            value={exerciseType}
            onChange={(value) => setExerciseType(value as ExerciseType)}
            required
            name="exerciseType"
            label="Type"
            description="This is used to calculate warm up sets"
          >
            <Flex direction="column" gap="xs" mt="xs">
              <Radio
                value={ExerciseType.Barbell}
                label="Barbell"
                description="Uses 2.5lb, 5lb, 10lb, 25lb, and 45lb plates"
              ></Radio>
              <Radio
                value={ExerciseType.Dumbbell}
                label="Dumbbell"
                description="Uses 5lb increments"
              ></Radio>
              <Radio
                value={ExerciseType.Weighted}
                description="Uses 2.5lb increments. Machines, bodyweight exercises, etc."
                label="Generic weighted"
              />
            </Flex>
          </Radio.Group>
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
                onMoveUp={handleMoveUpWarmUpSet}
                onMoveDown={handleMoveDownWarmUpSet}
                onEdit={handleEditWarmUpSet}
                onDelete={handleDeleteWarmUpSet}
              />
            );
          })}
          <Button onClick={handleCreateWarmUpSet}>Add warm-up set</Button>
        </Flex>
        <Flex justify="flex-end" mt="lg">
          <Button
            color="green"
            disabled={!isFormValid()}
            onClick={handleSaveExercise}
          >
            Save
          </Button>
        </Flex>
      </Modal>
      <WarmUpSetModal
        warmUpSet={warmUpSetToEdit ?? undefined}
        opened={isWarmUpSetModalOpen}
        onClose={() => setIsWarmUpSetModalOpen(false)}
        onSave={handleSaveWarmUpSet}
      />
    </>
  );

  function isFormValid() {
    return (
      name.trim().length > 0 &&
      parsedNumbers.weight >= 0 &&
      parsedNumbers.sets > 0 &&
      parsedNumbers.reps > 0 &&
      exerciseType !== undefined
    );
  }

  function resetInputs() {
    setName(exercise?.name ?? "");
    setWeight(exercise?.weight ?? "");
    setSets(exercise?.sets ?? "");
    setReps(exercise?.reps ?? "");
    setExerciseType(exercise?.type ?? ExerciseType.Barbell);
    setWarmUpSets(exercise?.warmUpSets ?? []);
  }

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

  function handleMoveUpWarmUpSet(warmUpSet: WarmUpSet) {
    setWarmUpSets((prev) => {
      const index = prev.findIndex((w) => w.id === warmUpSet.id);
      if (index === 0 || index === -1) {
        return prev;
      }
      return arraySwap(prev, index, index - 1);
    });
  }

  function handleMoveDownWarmUpSet(warmUpSet: WarmUpSet) {
    setWarmUpSets((prev) => {
      const index = prev.findIndex((w) => w.id === warmUpSet.id);
      if (index === warmUpSets.length - 1 || index === -1) {
        return prev;
      }
      return arraySwap(warmUpSets, index, index + 1);
    });
  }

  function handleSaveWarmUpSet(warmUpSet: WarmUpSet) {
    if (warmUpSetToEdit) {
      setWarmUpSets((prev) => {
        return prev.map((set) => {
          if (set.id === warmUpSetToEdit.id) {
            return warmUpSet;
          } else {
            return set;
          }
        });
      });
    } else {
      setWarmUpSets((prev) => {
        return [...prev, warmUpSet];
      });
    }
  }

  function handleSaveExercise() {
    onClose();
    if (exercise) {
      onSave({
        ...exercise,
        name,
        weight: parsedNumbers.weight,
        sets: parsedNumbers.sets,
        reps: parsedNumbers.reps,
        type: exerciseType,
        warmUpSets,
      });
    } else {
      onSave({
        id: uuidV4(),
        name,
        weight: parsedNumbers.weight,
        sets: parsedNumbers.sets,
        reps: parsedNumbers.reps,
        type: exerciseType,
        warmUpSets,
        workingSets: [],
      });
    }
  }
}
