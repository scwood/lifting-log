import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// jsdom does not implement window.matchMedia. Mantine's MantineProvider calls
// it on mount to detect the OS color scheme preference.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom does not implement ResizeObserver. Mantine's combobox-based inputs use
// it when positioning and sizing dropdown content.
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserver,
});

// jsdom elements do not implement scrollIntoView. Mantine's combobox uses it
// when keyboard navigation highlights dropdown options.
Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  value: vi.fn(),
});
