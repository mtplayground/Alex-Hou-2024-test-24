import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { soundManager } from "@/lib/sound/sound-manager";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

type QuizOption = {
  id: string;
  label: string;
  text: string;
};

type QuizProps = {
  className?: string;
  correctOptionId: string;
  explanation: string;
  options: QuizOption[];
  prompt: string;
  quizId: string;
  title?: string;
};

function Quiz({
  className,
  correctOptionId,
  explanation,
  options,
  prompt,
  quizId,
  title = "Quick Check",
}: QuizProps) {
  const progress = useAppStore((state) => state.quizProgress[quizId]);
  const recordQuizAnswer = useAppStore((state) => state.recordQuizAnswer);
  const resetQuizProgress = useAppStore((state) => state.resetQuizProgress);
  const selectedOptionId = progress?.selectedOptionId ?? null;
  const answeredCorrectly = progress?.answeredCorrectly ?? false;
  const explanationVisible = progress?.explanationVisible ?? false;
  const attempts = progress?.attempts ?? 0;
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId,
  );
  const submittedIncorrectly =
    selectedOptionId !== null && selectedOptionId !== correctOptionId;

  function handleOptionSelect(optionId: string) {
    if (answeredCorrectly) {
      return;
    }

    const isCorrect = optionId === correctOptionId;
    recordQuizAnswer(quizId, optionId, isCorrect);

    if (isCorrect) {
      soundManager.playSuccessChime();
      return;
    }

    soundManager.playClick();
  }

  function handleReset() {
    resetQuizProgress(quizId);
    soundManager.playClick();
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white/90 shadow-float backdrop-blur",
        className,
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sky/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
              <Sparkles className="h-4 w-4" />
              {title}
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              {prompt}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
              Attempts {String(attempts)}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-2",
                answeredCorrectly
                  ? "bg-kid-mint/30 text-emerald-950"
                  : selectedOptionId !== null
                    ? "bg-kid-coral/20 text-orange-950"
                    : "bg-slate-100 text-slate-600",
              )}
            >
              {answeredCorrectly
                ? "Mastered"
                : selectedOptionId !== null
                  ? "Keep trying"
                  : "Not started"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const isCorrectSelection =
              isSelected && option.id === correctOptionId;
            const isIncorrectSelection =
              isSelected && option.id !== correctOptionId;

            return (
              <button
                key={option.id}
                className={cn(
                  "group rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
                  answeredCorrectly
                    ? "cursor-default"
                    : "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(14,165,233,0.12)]",
                  isCorrectSelection &&
                    "border-emerald-300 bg-emerald-50 shadow-[0_18px_50px_rgba(16,185,129,0.18)]",
                  isIncorrectSelection &&
                    "border-orange-300 bg-orange-50 shadow-[0_18px_50px_rgba(249,115,22,0.16)]",
                  !isSelected &&
                    "border-slate-200 bg-white/80 hover:border-sky-200",
                )}
                type="button"
                onClick={() => {
                  handleOptionSelect(option.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isCorrectSelection && "bg-emerald-500 text-white",
                      isIncorrectSelection && "bg-orange-500 text-white",
                      !isSelected && "bg-slate-100 text-slate-700",
                    )}
                  >
                    {option.label}
                  </span>

                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900">
                      {option.text}
                    </p>
                    {isCorrectSelection ? (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900 duration-300 animate-in fade-in zoom-in-95">
                        <CheckCircle2 className="h-4 w-4" />
                        Correct answer
                      </div>
                    ) : null}
                    {isIncorrectSelection ? (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-900 duration-300 animate-in fade-in zoom-in-95">
                        <XCircle className="h-4 w-4" />
                        Not quite yet
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-[1.5rem] border transition-all duration-300",
            explanationVisible
              ? "max-h-96 border-sky-200 bg-sky-50/80 p-4 opacity-100"
              : "max-h-0 border-transparent p-0 opacity-0",
          )}
        >
          <div className="flex items-start gap-3">
            {answeredCorrectly ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {answeredCorrectly ? "Explanation" : "Hint"}
              </p>
              <p className="text-sm leading-7 text-slate-700">{explanation}</p>
              {submittedIncorrectly && selectedOption !== undefined ? (
                <p className="text-sm font-medium text-slate-600">
                  You chose {selectedOption.label}. Try another answer whenever
                  you are ready.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={selectedOptionId === null}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Quiz
          </Button>

          {answeredCorrectly ? (
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950 duration-300 animate-in fade-in zoom-in-95">
              Explanation revealed and completion saved to progress.
            </p>
          ) : selectedOptionId !== null ? (
            <p className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-950 duration-300 animate-in fade-in zoom-in-95">
              Feedback saved. Pick again until you get it right.
            </p>
          ) : (
            <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              Select one answer to reveal the explanation.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Quiz;
