import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  makeDay,
  makeDayExercise,
  makeExerciseDefinition,
  makeWorkout,
} from "../test-utils/factories";
import { PastWorkoutCard, PastWorkoutCardProps } from "./PastWorkoutCard";

function renderPastWorkoutCard(
  propsOverrides: Partial<PastWorkoutCardProps> = {},
) {
  const props: PastWorkoutCardProps = {
    workout: makeWorkout(),
    ...propsOverrides,
  };
  render(
    <MantineProvider>
      <PastWorkoutCard {...props} />
    </MantineProvider>,
  );
}

describe("PastWorkoutCard", () => {
  it("renders the completed-on date", () => {
    renderPastWorkoutCard({
      workout: makeWorkout({ completedTimestamp: 1700000000000 }),
    });
    expect(
      screen.getByText(/Completed on/, { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("renders each day name", () => {
    const workout = makeWorkout({
      days: [
        makeDay({ id: "d1", name: "Push Day" }),
        makeDay({ id: "d2", name: "Pull Day" }),
      ],
    });
    renderPastWorkoutCard({ workout });
    expect(screen.getByText("Push Day", { selector: "u" })).toBeInTheDocument();
    expect(screen.getByText("Pull Day", { selector: "u" })).toBeInTheDocument();
  });

  it("renders each exercise with name and volume load", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      name: "Bench Press",
    });
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: {
        0: { reps: 5, isLogged: true, weight: 135 },
        1: { reps: 5, isLogged: true, weight: 135 },
        2: { reps: 4, isLogged: true, weight: 130 },
      },
    });
    const workout = makeWorkout({
      days: [makeDay({ exercises: [exercise] })],
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });
    renderPastWorkoutCard({ workout });
    expect(
      screen.getByText(/Bench Press:\s*5x135,\s*5x135,\s*4x130/, {
        selector: "span",
      }),
    ).toBeInTheDocument();
  });

  describe("notes", () => {
    it("renders the notes section when notes are present", () => {
      const workout = makeWorkout({ notes: "Felt great today" });
      renderPastWorkoutCard({ workout });
      expect(screen.getByText("Notes:", { selector: "u" })).toBeInTheDocument();
    });

    it("does not render the notes section when notes are absent", () => {
      renderPastWorkoutCard({ workout: makeWorkout({ notes: null }) });
      expect(
        screen.queryByText("Notes:", { selector: "u" }),
      ).not.toBeInTheDocument();
    });
  });
});
