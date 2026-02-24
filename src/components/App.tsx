import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";

import { AppRouter } from "./AppRouter";
import { AuthProvider } from "./AuthProvider";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBQpLMpVWLjHU7xenqPbsEWzGQ1b2eIdcw",
  authDomain: "lifting-log-948d2.firebaseapp.com",
  projectId: "lifting-log-948d2",
  storageBucket: "lifting-log-948d2.appspot.com",
  messagingSenderId: "651878724833",
  appId: "1:651878724833:web:a2b6eccf72b49530bcf3a0",
  measurementId: "G-WE0QE376H5",
});

const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(),
});

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
}

const theme = createTheme({ headings: { fontWeight: "600" } });
const queryClient = new QueryClient();

export function App() {
  return (
    <AuthProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
