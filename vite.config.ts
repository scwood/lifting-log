import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Lifting Log",
        short_name: "Lifting Log",
        description: "Track your workouts",
        theme_color: "#242424",
        background_color: "#242424",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  base: "/lifting-log/",
  // A fix to allow firebase emulators to properly export their data on exit
  // Source: https://github.com/firebase/firebase-tools/issues/3092#issuecomment-1491220706
  server: { watch: { usePolling: true } },
});
