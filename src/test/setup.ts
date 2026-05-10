import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: matchMediaMock,
});
Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: matchMediaMock,
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

beforeAll(() => {
  class MockResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  }

  class MockIntersectionObserver {
    root = null;

    rootMargin = "";

    thresholds = [];

    observe() {}

    unobserve() {}

    disconnect() {}

    takeRecords() {
      return [];
    }
  }

  globalThis.ResizeObserver = MockResizeObserver;
  globalThis.IntersectionObserver = MockIntersectionObserver;

  Element.prototype.scrollIntoView = vi.fn();
  function scrollToMock(options?: ScrollToOptions): void;
  function scrollToMock(x: number, y: number): void;
  function scrollToMock(optionsOrX?: ScrollToOptions | number, y?: number) {
    void optionsOrX;
    void y;
  }

  window.scrollTo = scrollToMock;
});

vi.mock("@/lib/sound/sound-manager", () => ({
  soundManager: {
    playClick: vi.fn(),
    playRopeCreak: vi.fn(),
    playSuccessChime: vi.fn(),
  },
}));

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");

  return {
    ...actual,
    useReducedMotion: () => false,
  };
});
