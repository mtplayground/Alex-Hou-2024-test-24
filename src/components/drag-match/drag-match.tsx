import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CheckCircle2, GripVertical, Move, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { soundManager } from "@/lib/sound/sound-manager";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

type DragMatchItem = {
  id: string;
  image: string;
  label: string;
  matchId: string;
};

type DragMatchTarget = {
  id: string;
  helperText?: string;
  label: string;
};

type DragMatchProps = {
  className?: string;
  instructions: string;
  items: DragMatchItem[];
  targets: DragMatchTarget[];
  title?: string;
  widgetId: string;
};

type DraggableTileProps = {
  dragging?: boolean;
  item: DragMatchItem;
};

function DraggableTile({ dragging = false, item }: DraggableTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
    });

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "flex w-full items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white/90 px-4 py-4 text-left shadow-sm transition-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
        !dragging &&
          "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(14,165,233,0.12)]",
        (dragging || isDragging) && "cursor-grabbing opacity-90 shadow-2xl",
      )}
      style={
        dragging
          ? undefined
          : {
              transform:
                transform === null
                  ? undefined
                  : `translate3d(${String(transform.x)}px, ${String(
                      transform.y,
                    )}px, 0)`,
            }
      }
      type="button"
      {...attributes}
      {...listeners}
    >
      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-sky-50 text-3xl shadow-inner">
        {item.image}
      </span>
      <div className="flex-1">
        <p className="text-base font-semibold text-slate-900">{item.label}</p>
        <p className="text-sm text-slate-500">Drag to the matching pulley.</p>
      </div>
      <GripVertical className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  );
}

type MatchLaneProps = {
  item: DragMatchItem | undefined;
  target: DragMatchTarget;
};

function MatchLane({ item, target }: MatchLaneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: target.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[1.6rem] border border-dashed p-4 transition-colors",
        isOver ? "border-sky-400 bg-sky-50" : "border-slate-300 bg-slate-50/70",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pulley Type
          </p>
          <p className="font-display text-2xl text-slate-900">{target.label}</p>
          {target.helperText !== undefined ? (
            <p className="mt-1 text-sm text-slate-600">{target.helperText}</p>
          ) : null}
        </div>
        <Move className="h-5 w-5 shrink-0 text-slate-400" />
      </div>

      {item !== undefined ? (
        <DraggableTile item={item} />
      ) : (
        <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white/80 px-4 py-8 text-center text-sm font-medium text-slate-500">
          Drop a picture here
        </div>
      )}
    </div>
  );
}

function DragMatch({
  className,
  instructions,
  items,
  targets,
  title = "Drag to Match",
  widgetId,
}: DragMatchProps) {
  const progress = useAppStore((state) => state.dragMatchProgress[widgetId]);
  const recordDragMatchAttempt = useAppStore(
    (state) => state.recordDragMatchAttempt,
  );
  const resetDragMatchProgress = useAppStore(
    (state) => state.resetDragMatchProgress,
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const matches = progress?.matches ?? {};
  const attempts = progress?.attempts ?? 0;
  const completed = progress?.completed ?? false;
  const matchedTargetCount = items.filter(
    (item) => matches[item.id] === item.matchId,
  ).length;
  const activeItem = items.find((item) => item.id === activeItemId);
  const unassignedItems = items.filter(
    (item) => matches[item.id] === undefined,
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    setActiveItemId(null);

    const itemId = String(event.active.id);
    const targetId = event.over?.id;

    if (targetId === undefined) {
      return;
    }

    const normalizedTargetId = String(targetId);
    const previousOccupant = Object.entries(matches).find(
      ([existingItemId, existingTargetId]) =>
        existingTargetId === normalizedTargetId && existingItemId !== itemId,
    )?.[0];
    const nextMatches = {
      ...matches,
      [itemId]: normalizedTargetId,
    };
    const finalMatches =
      previousOccupant === undefined
        ? nextMatches
        : (Object.fromEntries(
            Object.entries(nextMatches).filter(
              ([existingItemId]) => existingItemId !== previousOccupant,
            ),
          ) as Record<string, string>);

    const isCompleted = items.every(
      (item) => finalMatches[item.id] === item.matchId,
    );

    recordDragMatchAttempt(widgetId, finalMatches, isCompleted);

    if (isCompleted) {
      soundManager.playSuccessChime();
      return;
    }

    soundManager.playClick();
  }

  function handleReset() {
    resetDragMatchProgress(widgetId);
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
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sun/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
              <Move className="h-4 w-4" />
              {title}
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              {instructions}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
              Attempts {String(attempts)}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-2",
                completed
                  ? "bg-kid-mint/30 text-emerald-950"
                  : "bg-kid-sky/15 text-sky-900",
              )}
            >
              {completed
                ? "Completed"
                : `${String(matchedTargetCount)}/${String(items.length)} matched`}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            setActiveItemId(String(event.active.id));
          }}
          onDragCancel={() => {
            setActiveItemId(null);
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Picture Bank
              </p>
              <div className="grid gap-3">
                {unassignedItems.length > 0 ? (
                  unassignedItems.map((item) => (
                    <DraggableTile key={item.id} item={item} />
                  ))
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    Every picture is on the board. Drag any placed card to a new
                    label if you want to adjust a match.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              {targets.map((target) => {
                const matchedItem = items.find(
                  (item) => matches[item.id] === target.id,
                );

                return (
                  <MatchLane
                    key={target.id}
                    item={matchedItem}
                    target={target}
                  />
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeItem !== undefined ? (
              <DraggableTile item={activeItem} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={attempts === 0 && matchedTargetCount === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Match
          </Button>

          {completed ? (
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950 duration-300 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completion saved to progress.
            </p>
          ) : (
            <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              Match each real-world picture to the pulley type that fits best.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DragMatch;
