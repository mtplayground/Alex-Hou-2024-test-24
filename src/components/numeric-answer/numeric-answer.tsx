import { CheckCircle2, Calculator, RotateCcw, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { soundManager } from "@/lib/sound/sound-manager";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

type NumericAnswerProps = {
  className?: string;
  correctValue: number;
  prompt: string;
  title?: string;
  tolerance: number;
  unit: string;
  widgetId: string;
  workedSolution: string;
};

function NumericAnswer({
  className,
  correctValue,
  prompt,
  title = "Numeric Check",
  tolerance,
  unit,
  widgetId,
  workedSolution,
}: NumericAnswerProps) {
  const progress = useAppStore(
    (state) => state.numericAnswerProgress[widgetId],
  );
  const recordNumericAnswerAttempt = useAppStore(
    (state) => state.recordNumericAnswerAttempt,
  );
  const resetNumericAnswerProgress = useAppStore(
    (state) => state.resetNumericAnswerProgress,
  );
  const [draftValue, setDraftValue] = useState(progress?.rawValue ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const answeredCorrectly = progress?.answeredCorrectly ?? false;
  const solutionVisible = progress?.solutionVisible ?? false;
  const attempts = progress?.attempts ?? 0;
  const submittedValue = progress?.submittedValue ?? null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValue = draftValue.trim().replace(",", ".");
    const parsedValue = Number(normalizedValue);

    if (!Number.isFinite(parsedValue)) {
      setValidationError("Enter a numeric value before submitting.");
      soundManager.playClick();
      return;
    }

    const isCorrect = Math.abs(parsedValue - correctValue) <= tolerance;

    setValidationError(null);
    recordNumericAnswerAttempt(widgetId, draftValue, parsedValue, isCorrect);

    if (isCorrect) {
      soundManager.playSuccessChime();
      return;
    }

    soundManager.playClick();
  }

  function handleReset() {
    resetNumericAnswerProgress(widgetId);
    setDraftValue("");
    setValidationError(null);
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
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-coral/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-950">
              <Calculator className="h-4 w-4" />
              {title}
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              {prompt}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
              Tolerance ±{tolerance} {unit}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-2",
                answeredCorrectly
                  ? "bg-kid-mint/30 text-emerald-950"
                  : attempts > 0
                    ? "bg-kid-coral/20 text-orange-950"
                    : "bg-slate-100 text-slate-600",
              )}
            >
              {answeredCorrectly
                ? "Accepted"
                : attempts > 0
                  ? "Try again"
                  : "Not submitted"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Your answer
              </span>
              <div className="flex items-center rounded-[1.3rem] border border-slate-200 bg-white shadow-sm transition-colors focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100">
                <input
                  inputMode="decimal"
                  className="w-full rounded-l-[1.3rem] bg-transparent px-4 py-4 text-lg font-semibold text-slate-900 outline-none"
                  placeholder={`Enter a value in ${unit}`}
                  type="text"
                  value={draftValue}
                  onChange={(event) => {
                    setDraftValue(event.target.value);
                  }}
                />
                <span className="rounded-r-[1.3rem] bg-slate-100 px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {unit}
                </span>
              </div>
            </label>

            <div className="flex items-end gap-3 sm:w-auto">
              <Button type="submit" disabled={answeredCorrectly}>
                Submit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={attempts === 0 && draftValue.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </form>

        {validationError !== null ? (
          <div className="rounded-[1.2rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-900">
            {validationError}
          </div>
        ) : null}

        {attempts > 0 ? (
          <div
            className={cn(
              "rounded-[1.4rem] border px-4 py-4 transition-all duration-300",
              answeredCorrectly
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-orange-200 bg-orange-50 text-orange-950",
            )}
          >
            <div className="flex items-start gap-3">
              {answeredCorrectly ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                  {answeredCorrectly ? "Correct" : "Not quite"}
                </p>
                <p className="text-sm leading-7">
                  {submittedValue !== null
                    ? `You submitted ${String(submittedValue)} ${unit}. Acceptable answers fall between ${(
                        correctValue - tolerance
                      ).toFixed(2)} ${unit} and ${(
                        correctValue + tolerance
                      ).toFixed(2)} ${unit}.`
                    : `Acceptable answers fall within ±${String(tolerance)} ${unit} of ${String(correctValue)} ${unit}.`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-600">
            Submit any numeric answer to reveal the worked solution.
          </div>
        )}

        <div
          className={cn(
            "overflow-hidden rounded-[1.5rem] border transition-all duration-300",
            solutionVisible
              ? "max-h-[32rem] border-sky-200 bg-sky-50/80 p-4 opacity-100"
              : "max-h-0 border-transparent p-0 opacity-0",
          )}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Worked Solution
            </p>
            <p className="text-sm leading-7 text-slate-700">{workedSolution}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NumericAnswer;
