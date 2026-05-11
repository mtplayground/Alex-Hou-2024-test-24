import type { Body as MatterBody } from "matter-js";

import type { SimulationOverlayApi } from "@/components/simulation/simulation-canvas";
import type { RopeOverlayStyle } from "@/lib/simulation/pulleys";

type Point = {
  x: number;
  y: number;
};

export type RopeRenderable = {
  branches: {
    end: {
      segments: MatterBody[];
    };
    start: {
      segments: MatterBody[];
    };
  };
  contactPoints: {
    end: Point;
    start: Point;
  };
  pulley: null | {
    center: Point;
    radius: number;
  };
  renderStyle?: RopeOverlayStyle;
};

function midpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

function buildArcPoints(
  center: Point,
  radius: number,
  startPoint: Point,
  endPoint: Point,
) {
  const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
  const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);
  let delta = endAngle - startAngle;

  if (delta > Math.PI) {
    delta -= Math.PI * 2;
  } else if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  const steps = Math.max(6, Math.ceil((Math.abs(delta) * radius) / 14));
  const points: Point[] = [];

  for (let index = 1; index < steps; index += 1) {
    const angle = startAngle + (delta * index) / steps;

    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }

  return points;
}

function getUniquePoints(points: Point[]) {
  return points.filter((point, index) => {
    const previous = points[index - 1];

    if (previous === undefined) {
      return true;
    }

    return Math.hypot(point.x - previous.x, point.y - previous.y) > 0.5;
  });
}

function getRopePoints(rope: RopeRenderable) {
  const startPoints = rope.branches.start.segments.map((segment) => ({
    x: segment.position.x,
    y: segment.position.y,
  }));
  const endPoints = rope.branches.end.segments.map((segment) => ({
    x: segment.position.x,
    y: segment.position.y,
  }));
  const arcPoints =
    rope.pulley === null
      ? []
      : buildArcPoints(
          rope.pulley.center,
          rope.pulley.radius,
          rope.contactPoints.start,
          rope.contactPoints.end,
        );

  return getUniquePoints([
    ...startPoints,
    rope.contactPoints.start,
    ...arcPoints,
    rope.contactPoints.end,
    ...endPoints,
  ]);
}

function strokeSmoothPath(
  context: CanvasRenderingContext2D,
  points: Point[],
  style: RopeOverlayStyle,
) {
  if (points.length < 2) {
    return;
  }

  const firstPoint = points[0];

  if (firstPoint === undefined) {
    return;
  }

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = style.width ?? 12;
  context.shadowBlur = style.shadowBlur ?? 10;
  context.shadowColor = style.shadowColor ?? "rgba(15, 23, 42, 0.2)";
  context.strokeStyle = style.color ?? "#334155";
  context.beginPath();
  context.moveTo(firstPoint.x, firstPoint.y);

  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const nextPoint = points[index + 1];

    if (point === undefined || nextPoint === undefined) {
      continue;
    }

    const controlPoint = midpoint(point, nextPoint);
    context.quadraticCurveTo(point.x, point.y, controlPoint.x, controlPoint.y);
  }

  const lastPoint = points[points.length - 1];

  if (lastPoint !== undefined) {
    context.lineTo(lastPoint.x, lastPoint.y);
  }

  context.stroke();
  context.restore();
}

export function drawRopeOverlay(
  overlay: SimulationOverlayApi,
  ropes: RopeRenderable[],
) {
  for (const rope of ropes) {
    strokeSmoothPath(
      overlay.context,
      getRopePoints(rope),
      rope.renderStyle ?? {},
    );
  }
}
