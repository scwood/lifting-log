import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  base: "/lifting-log/",
  // A fix to allow firebase emulators to properly export their data on exit
  // Source: https://github.com/firebase/firebase-tools/issues/3092#issuecomment-1491220706
  server: { watch: { usePolling: true } },
});
