import { getApp } from "firebase/app";
import {
  collection,
  query,
  getDocs,
  where,
  getFirestore,
  CollectionReference,
  doc,
  setDoc,
  orderBy,
  limit,
  updateDoc,
} from "@firebase/firestore";

import { Workout } from "../types/Workout";

export async function createWorkout({
  userId,
  ...optionalFields
}: {
  userId: Workout["userId"];
} & Partial<Workout>) {
  const workoutRef = doc(getWorkOutCollection());
  const workout: Workout = {
    id: workoutRef.id,
    userId,
    createdTimestamp: Date.now(),
    completedTimestamp: null,
    notes: null,
    days: [],
    ...optionalFields,
  };
  await setDoc(workoutRef, workout);
}

export async function getCurrentWorkout(userId: string) {
  const snapshot = await getDocs(
    query(
      getWorkOutCollection(),
      where("userId", "==", userId),
      orderBy("createdTimestamp", "desc"),
      limit(1)
    )
  );
  if (snapshot.empty) {
    await createWorkout({ userId });
    return getCurrentWorkout(userId);
  }
  // const data = snapshot.docs[0].data();
  // await updateWorkout(data.id, {
  //   days: data.days.map((day) => {
  //     return {
  //       ...day,
  //       exercises: day.exercises.map((exercise) => {
  //         return { ...exercise, workingSets: {} };
  //       }),
  //     };
  //   }),
  // });
  return snapshot.docs[0].data();
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<Workout>
) {
  await updateDoc(doc(getWorkOutCollection(), workoutId), { ...updates });
}

export async function getWorkouts(userId: string) {
  const snapshot = await getDocs(
    query(
      getWorkOutCollection(),
      where("userId", "==", userId),
      orderBy("createdTimestamp", "desc")
    )
  );
  return snapshot.docs.map((doc) => doc.data());
}

function getWorkOutCollection() {
  return collection(
    getFirestore(getApp()),
    "workouts"
  ) as CollectionReference<Workout>;
}
