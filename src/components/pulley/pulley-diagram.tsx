import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { PulleyDiagramContext } from "@/components/pulley/pulley-context";
import { cn } from "@/lib/utils";
import {
  type Point,
  type RopePathPulley,
  ropePathCompound,
  ropePathFixed,
  ropePathMovable,
} from "@/lib/pulley/pulleyGeometry";
import {
  usePulleyState,
  type PulleyType,
} from "@/lib/pulley/use-pulley-state";

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 520;
const VIEWBOX = "0 0 720 520";
const CEILING_Y = 92;
const PULLEY_RADIUS = 38;
const LOAD_WIDTH = 116;
const LOAD_HEIGHT = 96;

type WeightRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type DiagramPulley = RopePathPulley & {
  supportPoint: Point;
};

type DiagramLayout = {
  ceilingAnchors: Point[];
  handle: Point;
  loadAnchor: Point;
  pulleys: DiagramPulley[];
  rope: string;
  weight: WeightRect;
  weightAnchor: Point;
};

export type PulleyDiagramProps = {
  children?: ReactNode;
  className?: string;
  loadWeight: number;
  maxPullDistance?: number;
  pulleyCount: number;
  showForceArrows?: boolean;
  showLabels?: boolean;
  type: PulleyType;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function averagePoint(points: Point[]) {
  const total = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function topRowCenters(count: number) {
  const spacing = 96;
  const startX = VIEWBOX_WIDTH / 2 - ((count - 1) * spacing) / 2;

  return Array.from({ length: count }, (_, index) => ({
    x: startX + index * spacing,
    y: 174,
  }));
}

function buildFixedLayout(pullDistance: number, loadDistance: number): DiagramLayout {
  const pulley = {
    center: { x: VIEWBOX_WIDTH / 2, y: 174 },
    radius: PULLEY_RADIUS,
    supportPoint: { x: VIEWBOX_WIDTH / 2, y: CEILING_Y - 14 },
  };
  const handle = {
    x: pulley.center.x + pulley.radius,
    y: 316 + pullDistance,
  };
  const loadAnchor = {
    x: pulley.center.x - pulley.radius,
    y: 334 - loadDistance,
  };

  return {
    ceilingAnchors: [{ x: pulley.center.x, y: CEILING_Y }],
    handle,
    loadAnchor,
    pulleys: [pulley],
    rope: ropePathFixed({
      handleEnd: handle,
      loadEnd: loadAnchor,
      pulley,
    }),
    weight: {
      height: LOAD_HEIGHT,
      width: LOAD_WIDTH,
      x: loadAnchor.x - LOAD_WIDTH / 2,
      y: loadAnchor.y,
    },
    weightAnchor: loadAnchor,
  };
}

function buildMovableLayout(pullDistance: number, loadDistance: number): DiagramLayout {
  const upperPulley = {
    center: { x: VIEWBOX_WIDTH / 2, y: 174 },
    radius: PULLEY_RADIUS,
    supportPoint: { x: VIEWBOX_WIDTH / 2, y: CEILING_Y - 14 },
  };
  const lowerPulley = {
    center: { x: VIEWBOX_WIDTH / 2, y: 262 - loadDistance },
    radius: PULLEY_RADIUS,
    supportPoint: { x: VIEWBOX_WIDTH / 2, y: 262 - loadDistance + PULLEY_RADIUS + 16 },
  };
  const ceilingAnchor = {
    x: upperPulley.center.x - upperPulley.radius,
    y: CEILING_Y + 16,
  };
  const handle = {
    x: upperPulley.center.x + upperPulley.radius,
    y: 214 + pullDistance,
  };
  const weightAnchor = {
    x: lowerPulley.center.x,
    y: lowerPulley.center.y + lowerPulley.radius,
  };

  return {
    ceilingAnchors: [ceilingAnchor],
    handle,
    loadAnchor: weightAnchor,
    pulleys: [upperPulley, lowerPulley],
    rope: ropePathMovable({
      ceilingAnchor,
      handleEnd: handle,
      lowerPulley,
      upperPulley,
    }),
    weight: {
      height: LOAD_HEIGHT,
      width: LOAD_WIDTH,
      x: lowerPulley.center.x - LOAD_WIDTH / 2,
      y: lowerPulley.center.y + lowerPulley.radius + 20,
    },
    weightAnchor,
  };
}

function buildCompoundLayout(
  pullDistance: number,
  loadDistance: number,
  pulleyCount: number,
): DiagramLayout {
  const totalPulleys = Math.max(2, Math.floor(pulleyCount));
  const topCount = Math.ceil(totalPulleys / 2);
  const bottomCount = Math.max(1, Math.floor(totalPulleys / 2));
  const topCenters = topRowCenters(topCount);
  const bottomStartX = VIEWBOX_WIDTH / 2 - ((bottomCount - 1) * 96) / 2;
  const bottomCenters = Array.from({ length: bottomCount }, (_, index) => ({
    x: bottomStartX + index * 96,
    y: 292 - loadDistance,
  }));
  const upperPulleys = [...topCenters].reverse().map((topPulley) => ({
    center: topPulley,
    radius: PULLEY_RADIUS,
    supportPoint: { x: topPulley.x, y: CEILING_Y - 14 },
  }));
  const lowerPulleys = [...bottomCenters].reverse().map((bottomPulley) => ({
    center: bottomPulley,
    radius: PULLEY_RADIUS,
    supportPoint: {
      x: bottomPulley.x,
      y: bottomPulley.y + PULLEY_RADIUS + 16,
    },
  }));
  const pulleys = [...upperPulleys, ...lowerPulleys];
  const firstUpperPulley = upperPulleys[0] ?? {
    center: { x: VIEWBOX_WIDTH / 2, y: 174 },
    radius: PULLEY_RADIUS,
    supportPoint: { x: VIEWBOX_WIDTH / 2, y: CEILING_Y - 14 },
  };

  const handle = {
    x: firstUpperPulley.center.x + firstUpperPulley.radius,
    y: 206 + pullDistance,
  };
  const finalPulley = lowerPulleys[lowerPulleys.length - 1] ?? firstUpperPulley;
  const loadAnchor = {
    x: finalPulley.center.x + finalPulley.radius,
    y: CEILING_Y + 10,
  };
  const bottomCenter = averagePoint(bottomCenters);

  return {
    ceilingAnchors: [loadAnchor],
    handle,
    loadAnchor,
    pulleys,
    rope: ropePathCompound({
      handleEnd: handle,
      loadEnd: loadAnchor,
      lowerPulleys,
      upperPulleys,
    }),
    weight: {
      height: 112,
      width: 148,
      x: bottomCenter.x - 74,
      y: bottomCenter.y + PULLEY_RADIUS + 24,
    },
    weightAnchor: {
      x: bottomCenter.x,
      y: bottomCenter.y + PULLEY_RADIUS,
    },
  };
}

function buildDiagramLayout(
  type: PulleyType,
  pulleyCount: number,
  pullDistance: number,
  loadDistance: number,
) {
  switch (type) {
    case "fixed":
      return buildFixedLayout(pullDistance, loadDistance);
    case "movable":
      return buildMovableLayout(pullDistance, loadDistance);
    case "compound":
      return buildCompoundLayout(pullDistance, loadDistance, pulleyCount);
    default:
      return buildFixedLayout(pullDistance, loadDistance);
  }
}

function formatForce(loadWeight: number, mechanicalAdvantage: number) {
  return (loadWeight / mechanicalAdvantage).toFixed(1);
}

function formatLabel(type: PulleyType, pulleyCount: number) {
  switch (type) {
    case "fixed":
      return "Fixed pulley";
    case "movable":
      return "Movable pulley";
    case "compound":
      return `Compound pulley x${String(Math.max(2, Math.floor(pulleyCount)))}`;
    default:
      return "Pulley diagram";
  }
}

function pointFromClientPosition(
  clientX: number,
  clientY: number,
  svgElement: SVGSVGElement,
) {
  const bounds = svgElement.getBoundingClientRect();
  const scaleX = VIEWBOX_WIDTH / bounds.width;
  const scaleY = VIEWBOX_HEIGHT / bounds.height;

  return {
    x: (clientX - bounds.left) * scaleX,
    y: (clientY - bounds.top) * scaleY,
  };
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <marker
      id={id}
      markerHeight="8"
      markerUnits="strokeWidth"
      markerWidth="8"
      orient="auto"
      refX="7"
      refY="4"
    >
      <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
    </marker>
  );
}

export default function PulleyDiagram({
  children,
  className,
  loadWeight,
  maxPullDistance = 180,
  pulleyCount,
  showForceArrows = false,
  showLabels = true,
  type,
}: PulleyDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const pendingFrame = useRef<number | null>(null);
  const pendingPull = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const markerId = useId();
  const { loadDistance, mechanicalAdvantage, pullDistance, reset, setPull } =
    usePulleyState({
      loadWeight,
      pulleyCount,
      type,
    });

  const flushPendingPull = useCallback(() => {
    pendingFrame.current = null;
    setPull(pendingPull.current);
  }, [setPull]);

  const schedulePullUpdate = useCallback(() => {
    if (pendingFrame.current !== null) {
      return;
    }

    pendingFrame.current = window.requestAnimationFrame(flushPendingPull);
  }, [flushPendingPull]);

  const layout = useMemo(
    () => buildDiagramLayout(type, pulleyCount, pullDistance, loadDistance),
    [loadDistance, pulleyCount, pullDistance, type],
  );

  const handleBaseY = useMemo(() => {
    const neutralLayout = buildDiagramLayout(type, pulleyCount, 0, 0);

    return neutralLayout.handle.y;
  }, [pulleyCount, type]);

  const currentForce = useMemo(
    () => formatForce(loadWeight, mechanicalAdvantage),
    [loadWeight, mechanicalAdvantage],
  );
  const contextValue = useMemo(
    () => ({
      forceNeeded: loadWeight / mechanicalAdvantage,
      loadDistance,
      loadWeight,
      mechanicalAdvantage,
      pulleyCount,
      pullDistance,
      type,
    }),
    [
      loadDistance,
      loadWeight,
      mechanicalAdvantage,
      pulleyCount,
      pullDistance,
      type,
    ],
  );

  const stopDragging = useCallback(() => {
    activePointerId.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    return () => {
      if (pendingFrame.current !== null) {
        window.cancelAnimationFrame(pendingFrame.current);
      }
    };
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const svgElement = svgRef.current;

      if (!svgElement) {
        return;
      }

      const pointer = pointFromClientPosition(clientX, clientY, svgElement);
      pendingPull.current = clamp(pointer.y - handleBaseY, 0, maxPullDistance);
      schedulePullUpdate();
    },
    [handleBaseY, maxPullDistance, schedulePullUpdate],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<SVGCircleElement>) => {
      const svgElement = svgRef.current;

      if (!svgElement) {
        return;
      }

      activePointerId.current = event.pointerId;
      svgElement.setPointerCapture(event.pointerId);
      setIsDragging(true);
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (activePointerId.current !== event.pointerId) {
        return;
      }

      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (activePointerId.current !== event.pointerId) {
        return;
      }

      if (svgRef.current?.hasPointerCapture(event.pointerId)) {
        svgRef.current.releasePointerCapture(event.pointerId);
      }

      stopDragging();
    },
    [stopDragging],
  );

  const ropeArrowStart = {
    x: layout.handle.x + 26,
    y: layout.handle.y - 34,
  };
  const ropeArrowEnd = {
    x: ropeArrowStart.x,
    y: ropeArrowStart.y + 66,
  };
  const loadArrowStart = {
    x: layout.weight.x - 32,
    y: layout.weight.y + layout.weight.height,
  };
  const loadArrowEnd = {
    x: loadArrowStart.x,
    y: loadArrowStart.y - 76,
  };

  return (
    <PulleyDiagramContext.Provider value={contextValue}>
      <div
        className={cn(
          "overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,254,255,0.92))] shadow-float",
          className,
        )}
      >
        <svg
          ref={svgRef}
          aria-label={formatLabel(type, pulleyCount)}
          className="block h-auto w-full touch-none"
          onPointerCancel={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          viewBox={VIEWBOX}
        >
        <defs>
          <ArrowMarker id={markerId} />
          <filter id="rope-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" floodColor="rgba(15,23,42,0.2)" stdDeviation="3" />
          </filter>
        </defs>

        <rect fill="url(#diagram-sky)" height={VIEWBOX_HEIGHT} rx="26" width={VIEWBOX_WIDTH} />
        <defs>
          <linearGradient id="diagram-sky" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fefce8" />
            <stop offset="55%" stopColor="#ecfeff" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
        </defs>

        <rect fill="#1e293b" height="16" rx="8" width={VIEWBOX_WIDTH - 120} x="60" y={CEILING_Y - 22} />
        {layout.ceilingAnchors.map((anchorPoint, index) => (
          <g key={`${String(anchorPoint.x)}-${String(anchorPoint.y)}-${String(index)}`}>
            <line
              stroke="#94a3b8"
              strokeDasharray="4 8"
              strokeWidth="2"
              x1={anchorPoint.x}
              x2={anchorPoint.x}
              y1={CEILING_Y - 22}
              y2={anchorPoint.y}
            />
            <circle cx={anchorPoint.x} cy={anchorPoint.y} fill="#334155" r="8" />
          </g>
        ))}

        {layout.pulleys.map((pulley, index) => (
          <g
            key={`${String(pulley.center.x)}-${String(pulley.center.y)}-${String(
              index,
            )}`}
          >
            <line
              stroke="#94a3b8"
              strokeWidth="5"
              x1={pulley.supportPoint.x}
              x2={pulley.center.x}
              y1={pulley.supportPoint.y}
              y2={pulley.center.y}
            />
            <circle
              cx={pulley.center.x}
              cy={pulley.center.y}
              fill="#e2e8f0"
              r={pulley.radius}
              stroke="#334155"
              strokeWidth="8"
            />
            <circle cx={pulley.center.x} cy={pulley.center.y} fill="#475569" r="9" />
          </g>
        ))}

        <path
          d={layout.rope}
          fill="none"
          filter="url(#rope-shadow)"
          stroke="#b45309"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="12"
        />
        <path
          d={layout.rope}
          fill="none"
          stroke="#f59e0b"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />

        <line
          stroke="#64748b"
          strokeWidth="6"
          x1={layout.weightAnchor.x}
          x2={layout.weight.x + layout.weight.width / 2}
          y1={layout.weightAnchor.y}
          y2={layout.weight.y}
        />
        <rect
          fill={type === "compound" ? "#a855f7" : "#0f766e"}
          height={layout.weight.height}
          rx="22"
          stroke="#0f172a"
          strokeWidth="6"
          width={layout.weight.width}
          x={layout.weight.x}
          y={layout.weight.y}
        />
        <text
          fill="white"
          fontFamily="inherit"
          fontSize="22"
          fontWeight="700"
          textAnchor="middle"
          x={layout.weight.x + layout.weight.width / 2}
          y={layout.weight.y + layout.weight.height / 2 - 4}
        >
          {loadWeight.toFixed(0)} N
        </text>
        <text
          fill="rgba(255,255,255,0.84)"
          fontFamily="inherit"
          fontSize="14"
          letterSpacing="0.22em"
          textAnchor="middle"
          x={layout.weight.x + layout.weight.width / 2}
          y={layout.weight.y + layout.weight.height / 2 + 22}
        >
          LOAD
        </text>

        <circle
          cx={layout.handle.x}
          cy={layout.handle.y}
          fill={isDragging ? "#f97316" : "#f43f5e"}
          onPointerDown={handlePointerDown}
          r="18"
          stroke="white"
          strokeWidth="6"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        />

        {showForceArrows ? (
          <g className="text-sky-700">
            <line
              markerEnd={`url(#${markerId})`}
              stroke="currentColor"
              strokeWidth="6"
              x1={ropeArrowStart.x}
              x2={ropeArrowEnd.x}
              y1={ropeArrowStart.y}
              y2={ropeArrowEnd.y}
            />
            <line
              markerEnd={`url(#${markerId})`}
              stroke="currentColor"
              strokeWidth="6"
              x1={loadArrowStart.x}
              x2={loadArrowEnd.x}
              y1={loadArrowStart.y}
              y2={loadArrowEnd.y}
            />
            {showLabels ? (
              <>
                <text
                  fill="currentColor"
                  fontFamily="inherit"
                  fontSize="16"
                  fontWeight="700"
                  x={ropeArrowEnd.x + 14}
                  y={ropeArrowEnd.y - 8}
                >
                  Pull {currentForce} N
                </text>
                <text
                  fill="currentColor"
                  fontFamily="inherit"
                  fontSize="16"
                  fontWeight="700"
                  x={loadArrowEnd.x - 6}
                  y={loadArrowEnd.y - 12}
                >
                  Lift
                </text>
              </>
            ) : null}
          </g>
        ) : null}

        {showLabels ? (
          <g fill="#0f172a" fontFamily="inherit">
            <text fontSize="15" fontWeight="700" x="36" y="42">
              {formatLabel(type, pulleyCount)}
            </text>
            <text fill="#475569" fontSize="14" x="36" y="66">
              Pull: {pullDistance.toFixed(0)} px • Load: {loadDistance.toFixed(0)} px • MA:{" "}
              {mechanicalAdvantage}x
            </text>
            <text fontSize="14" fontWeight="700" x={layout.handle.x + 24} y={layout.handle.y + 6}>
              Drag
            </text>
          </g>
        ) : null}
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-white/80 px-5 py-4 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-900">
              Mechanical advantage: {mechanicalAdvantage}x
            </span>
            <span>Pull distance: {pullDistance.toFixed(0)} px</span>
            <span>Load travel: {loadDistance.toFixed(0)} px</span>
          </div>
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            onClick={reset}
            type="button"
          >
            Reset
          </button>
        </div>

        {children ? (
          <div className="border-t border-slate-200/70 bg-white/70 px-5 py-5">
            {children}
          </div>
        ) : null}
      </div>
    </PulleyDiagramContext.Provider>
  );
}
