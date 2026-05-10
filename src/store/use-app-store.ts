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

export type QuizProgress = {
  selectedOptionId: string | null;
  answeredCorrectly: boolean;
  explanationVisible: boolean;
  attempts: number;
  completedAt: string | null;
};

export type DragMatchProgress = {
  matches: Record<string, string>;
  attempts: number;
  completed: boolean;
  completedAt: string | null;
};

type AppStore = {
  lessonProgress: Record<string, LessonProgress>;
  quizProgress: Record<string, QuizProgress>;
  dragMatchProgress: Record<string, DragMatchProgress>;
  advancedMode: boolean;
  soundEnabled: boolean;
  setAdvancedMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  markLessonVisited: (slug: string) => void;
  markLessonCompleted: (slug: string, completed?: boolean) => void;
  recordQuizAnswer: (
    quizId: string,
    selectedOptionId: string,
    answeredCorrectly: boolean,
  ) => void;
  recordDragMatchAttempt: (
    widgetId: string,
    matches: Record<string, string>,
    completed: boolean,
  ) => void;
  resetQuizProgress: (quizId?: string) => void;
  resetDragMatchProgress: (widgetId?: string) => void;
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

function getExistingQuizProgress(
  quizProgress: Record<string, QuizProgress>,
  quizId: string,
) {
  return (
    quizProgress[quizId] ?? {
      selectedOptionId: null,
      answeredCorrectly: false,
      explanationVisible: false,
      attempts: 0,
      completedAt: null,
    }
  );
}

function getExistingDragMatchProgress(
  dragMatchProgress: Record<string, DragMatchProgress>,
  widgetId: string,
) {
  return (
    dragMatchProgress[widgetId] ?? {
      matches: {},
      attempts: 0,
      completed: false,
      completedAt: null,
    }
  );
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      lessonProgress: {},
      quizProgress: {},
      dragMatchProgress: {},
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
      recordQuizAnswer: (quizId, selectedOptionId, answeredCorrectly) => {
        set((state) => {
          const existingQuizProgress = getExistingQuizProgress(
            state.quizProgress,
            quizId,
          );

          return {
            quizProgress: {
              ...state.quizProgress,
              [quizId]: {
                ...existingQuizProgress,
                selectedOptionId,
                answeredCorrectly,
                explanationVisible: true,
                attempts: existingQuizProgress.attempts + 1,
                completedAt: answeredCorrectly
                  ? new Date().toISOString()
                  : existingQuizProgress.completedAt,
              },
            },
          };
        });
      },
      recordDragMatchAttempt: (widgetId, matches, completed) => {
        set((state) => {
          const existingProgress = getExistingDragMatchProgress(
            state.dragMatchProgress,
            widgetId,
          );

          return {
            dragMatchProgress: {
              ...state.dragMatchProgress,
              [widgetId]: {
                ...existingProgress,
                matches,
                attempts: existingProgress.attempts + 1,
                completed,
                completedAt: completed
                  ? new Date().toISOString()
                  : existingProgress.completedAt,
              },
            },
          };
        });
      },
      resetQuizProgress: (quizId) => {
        set((state) => {
          if (quizId === undefined) {
            return { quizProgress: {} };
          }

          const nextQuizProgress = Object.fromEntries(
            Object.entries(state.quizProgress).filter(
              ([existingQuizId]) => existingQuizId !== quizId,
            ),
          ) as Record<string, QuizProgress>;

          return {
            quizProgress: nextQuizProgress,
          };
        });
      },
      resetDragMatchProgress: (widgetId) => {
        set((state) => {
          if (widgetId === undefined) {
            return { dragMatchProgress: {} };
          }

          const nextDragMatchProgress = Object.fromEntries(
            Object.entries(state.dragMatchProgress).filter(
              ([existingWidgetId]) => existingWidgetId !== widgetId,
            ),
          ) as Record<string, DragMatchProgress>;

          return {
            dragMatchProgress: nextDragMatchProgress,
          };
        });
      },
      resetLessonProgress: () => {
        set({ lessonProgress: {} });
      },
    }),
    {
      name: "pulley-playground-app-store",
      version: 3,
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
        quizProgress: state.quizProgress,
        dragMatchProgress: state.dragMatchProgress,
        advancedMode: state.advancedMode,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
