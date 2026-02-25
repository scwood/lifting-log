import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
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
    const exercise = makeExercise({
      name: "Bench Press",
      sets: 3,
      reps: 5,
      weight: 135,
      workingSets: {
        0: { reps: 5, isLogged: true, weight: 135 },
        1: { reps: 5, isLogged: true, weight: 135 },
        2: { reps: 4, isLogged: true, weight: 130 },
      },
    });
    const workout = makeWorkout({
      days: [makeDay({ exercises: [exercise] })],
    });
    renderPastWorkoutCard({ workout });
    expect(
      screen.getByText(/Bench Press: 3x5x135 \(5x135,5x135,4x130\)/, {
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
