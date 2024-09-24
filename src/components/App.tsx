import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { AuthProvider } from "./AuthProvider";
import { AppRouterProvider } from "./AppRouterProvider";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBQpLMpVWLjHU7xenqPbsEWzGQ1b2eIdcw",
  authDomain: "lifting-log-948d2.firebaseapp.com",
  projectId: "lifting-log-948d2",
  storageBucket: "lifting-log-948d2.appspot.com",
  messagingSenderId: "651878724833",
  appId: "1:651878724833:web:a2b6eccf72b49530bcf3a0",
  measurementId: "G-WE0QE376H5",
});

getAuth(firebaseApp);
getFirestore(firebaseApp);

const theme = createTheme({ headings: { fontWeight: "600" } });
const queryClient = new QueryClient();

export function App() {
  return (
    <AuthProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <QueryClientProvider client={queryClient}>
          <AppRouterProvider />
        </QueryClientProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
