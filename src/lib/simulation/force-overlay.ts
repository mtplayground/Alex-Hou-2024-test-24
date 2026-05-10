import { Composite, type Body, type Constraint, type Vector } from "matter-js";

import type { SimulationOverlayApi } from "@/components/simulation/simulation-canvas";

type ForceOverlayOptions = {
  bodyArrowColor?: string;
  bodyLabelColor?: string;
  constraintColor?: string;
  constraintLabelColor?: string;
  font?: string;
};

type Point = {
  x: number;
  y: number;
};

function getConstraintPoint(
  body: Body | null | undefined,
  point: Point | Vector | undefined,
): Point | null {
  if (body != null && point !== undefined) {
    return {
      x: body.position.x + point.x,
      y: body.position.y + point.y,
    };
  }

  if (point !== undefined) {
    return { x: point.x, y: point.y };
  }

  if (body != null) {
    return { x: body.position.x, y: body.position.y };
  }

  return null;
}

function getMidpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

function getLength(start: Point, end: Point) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function normalize(start: Point, end: Point) {
  const length = getLength(start, end);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (end.x - start.x) / length,
    y: (end.y - start.y) / length,
  };
}

function isRopeConstraint(constraint: Constraint) {
  return (
    constraint.bodyA?.label.startsWith("rope-segment-") === true &&
    constraint.bodyB?.label.startsWith("rope-segment-") === true
  );
}

function getApproximateTension(constraint: Constraint, distance: number) {
  const restLength = constraint.length;
  const baseline = Math.max(restLength, 1) * 0.14;
  const stretch = Math.abs(distance - restLength) * 0.65;

  return constraint.stiffness * (baseline + stretch);
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  lineWidth: number,
) {
  const direction = normalize(start, end);
  const headLength = 10;

  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - direction.x * headLength - direction.y * 5,
    end.y - direction.y * headLength + direction.x * 5,
  );
  context.lineTo(
    end.x - direction.x * headLength + direction.y * 5,
    end.y - direction.y * headLength - direction.x * 5,
  );
  context.closePath();
  context.fill();
  context.restore();
}

function drawPillLabel(
  context: CanvasRenderingContext2D,
  position: Point,
  text: string,
  background: string,
  foreground: string,
) {
  context.save();
  context.font = "600 12px 'Sora', sans-serif";
  const metrics = context.measureText(text);
  const width = metrics.width + 18;
  const height = 24;
  const x = position.x - width / 2;
  const y = position.y - height / 2;

  context.fillStyle = background;
  context.beginPath();
  context.roundRect(x, y, width, height, 999);
  context.fill();
  context.fillStyle = foreground;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, position.x, position.y + 1);
  context.restore();
}

function drawBodyForces(
  context: CanvasRenderingContext2D,
  body: Body,
  gravityVector: Point,
  color: string,
  labelColor: string,
) {
  if (body.isStatic) {
    return;
  }

  const magnitude = Math.hypot(gravityVector.x, gravityVector.y) * body.mass;

  if (magnitude <= 0) {
    return;
  }

  const start = { x: body.position.x, y: body.position.y };
  const end = {
    x: start.x + gravityVector.x * body.mass * 6000,
    y: start.y + gravityVector.y * body.mass * 6000,
  };

  drawArrow(context, start, end, color, 3);
  drawPillLabel(
    context,
    { x: end.x, y: end.y + 18 },
    `Load ${(magnitude * 1000).toFixed(1)} N`,
    "rgba(14, 165, 233, 0.14)",
    labelColor,
  );
}

function drawConstraintForce(
  context: CanvasRenderingContext2D,
  constraint: Constraint,
  index: number,
  color: string,
  labelColor: string,
) {
  const start = getConstraintPoint(constraint.bodyA, constraint.pointA);
  const end = getConstraintPoint(constraint.bodyB, constraint.pointB);

  if (start === null || end === null) {
    return;
  }

  const distance = getLength(start, end);

  if (distance < 18) {
    return;
  }

  const direction = normalize(start, end);
  const midpoint = getMidpoint(start, end);
  const indicatorLength = Math.min(34, Math.max(18, distance * 0.28));
  const indicatorStart = {
    x: midpoint.x - direction.x * indicatorLength * 0.5,
    y: midpoint.y - direction.y * indicatorLength * 0.5,
  };
  const indicatorEnd = {
    x: midpoint.x + direction.x * indicatorLength * 0.5,
    y: midpoint.y + direction.y * indicatorLength * 0.5,
  };
  const shouldLabel = !isRopeConstraint(constraint) || index % 4 === 0;
  const shouldDrawIndicator = !isRopeConstraint(constraint) || index % 2 === 0;

  if (shouldDrawIndicator) {
    drawArrow(context, indicatorStart, indicatorEnd, color, 2.5);
  }

  if (shouldLabel) {
    const normal = { x: -direction.y, y: direction.x };
    const tension = getApproximateTension(constraint, distance);

    drawPillLabel(
      context,
      {
        x: midpoint.x + normal.x * 18,
        y: midpoint.y + normal.y * 18,
      },
      `T ${tension.toFixed(1)} N`,
      "rgba(251, 146, 60, 0.16)",
      labelColor,
    );
  }
}

export function drawForceOverlay(
  overlay: SimulationOverlayApi,
  options: ForceOverlayOptions = {},
) {
  const { context, engine } = overlay;
  const allBodies = Composite.allBodies(engine.world);
  const allConstraints = Composite.allConstraints(engine.world);
  const gravityVector = {
    x: engine.gravity.x * engine.gravity.scale,
    y: engine.gravity.y * engine.gravity.scale,
  };
  const bodyArrowColor = options.bodyArrowColor ?? "#0284c7";
  const bodyLabelColor = options.bodyLabelColor ?? "#075985";
  const constraintColor = options.constraintColor ?? "#ea580c";
  const constraintLabelColor = options.constraintLabelColor ?? "#9a3412";

  context.save();
  context.font = options.font ?? "600 12px 'Sora', sans-serif";

  allBodies.forEach((body) => {
    drawBodyForces(
      context,
      body,
      gravityVector,
      bodyArrowColor,
      bodyLabelColor,
    );
  });

  allConstraints.forEach((constraint, index) => {
    drawConstraintForce(
      context,
      constraint,
      index,
      constraintColor,
      constraintLabelColor,
    );
  });

  context.restore();
}
