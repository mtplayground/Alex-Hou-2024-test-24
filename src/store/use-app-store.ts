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

type AppStore = {
  lessonProgress: Record<string, LessonProgress>;
  quizProgress: Record<string, QuizProgress>;
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
  resetQuizProgress: (quizId?: string) => void;
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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      lessonProgress: {},
      quizProgress: {},
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
      resetLessonProgress: () => {
        set({ lessonProgress: {} });
      },
    }),
    {
      name: "pulley-playground-app-store",
      version: 2,
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
        advancedMode: state.advancedMode,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
