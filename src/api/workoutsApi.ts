import {
  CollectionReference,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "@firebase/firestore";
import { getApp } from "firebase/app";

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
      limit(1),
    ),
  );
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data();
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<Workout>,
) {
  await updateDoc(doc(getWorkOutCollection(), workoutId), { ...updates });
}

export async function getWorkouts(userId: string) {
  const snapshot = await getDocs(
    query(
      getWorkOutCollection(),
      where("userId", "==", userId),
      orderBy("createdTimestamp", "desc"),
    ),
  );
  return snapshot.docs.map((doc) => doc.data());
}

function getWorkOutCollection() {
  return collection(
    getFirestore(getApp()),
    "workouts",
  ) as CollectionReference<Workout>;
}
