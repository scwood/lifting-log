import { Menu, createTheme } from "@mantine/core";

// Disables Menu (and other Transition-based) animations so that dropdown
// content renders synchronously after a click in tests.
export const testTheme = createTheme({
  components: {
    Menu: Menu.extend({
      defaultProps: {
        transitionProps: { duration: 0 },
      },
    }),
  },
});
