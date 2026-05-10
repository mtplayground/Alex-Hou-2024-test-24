import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { soundFeatureEnabled } from "@/lib/sound/sound-config";

function getDefaultSoundEnabled() {
  return soundFeatureEnabled;
}

export type LessonProgress = {
  started: boolean;
  completed: boolean;
  lastVisitedAt: string | null;
};

type AppStore = {
  lessonProgress: Record<string, LessonProgress>;
  advancedMode: boolean;
  soundEnabled: boolean;
  setAdvancedMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  markLessonVisited: (slug: string) => void;
  markLessonCompleted: (slug: string, completed?: boolean) => void;
  resetLessonProgress: () => void;
};

function getExistingLessonProgress(
  lessonProgress: Record<string, LessonProgress>,
  slug: string,
) {
  return (
    lessonProgress[slug] ?? {
      started: false,
      completed: false,
      lastVisitedAt: null,
    }
  );
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      lessonProgress: {},
      advancedMode: false,
      soundEnabled: getDefaultSoundEnabled(),
      setAdvancedMode: (enabled) => {
        set({ advancedMode: enabled });
      },
      setSoundEnabled: (enabled) => {
        set({ soundEnabled: soundFeatureEnabled ? enabled : false });
      },
      markLessonVisited: (slug) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [slug]: {
              ...getExistingLessonProgress(state.lessonProgress, slug),
              started: true,
              lastVisitedAt: new Date().toISOString(),
            },
          },
        }));
      },
      markLessonCompleted: (slug, completed = true) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [slug]: {
              ...getExistingLessonProgress(state.lessonProgress, slug),
              started: true,
              completed,
              lastVisitedAt: new Date().toISOString(),
            },
          },
        }));
      },
      resetLessonProgress: () => {
        set({ lessonProgress: {} });
      },
    }),
    {
      name: "pulley-playground-app-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persistedStore = persistedState as Partial<AppStore> | undefined;

        return {
          ...currentState,
          ...persistedStore,
          soundEnabled:
            soundFeatureEnabled &&
            (persistedStore?.soundEnabled ?? currentState.soundEnabled),
        };
      },
      partialize: (state) => ({
        lessonProgress: state.lessonProgress,
        advancedMode: state.advancedMode,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
