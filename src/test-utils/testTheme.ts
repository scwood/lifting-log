import { Menu, Modal, createTheme } from "@mantine/core";

// Disables Menu and Modal (and other Transition-based) animations so that
// content renders synchronously after a click in tests.
export const testTheme = createTheme({
  components: {
    Menu: Menu.extend({
      defaultProps: {
        transitionProps: { duration: 0 },
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: { duration: 0 },
      },
    }),
  },
});
