import {
  animate,
  useReducedMotion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedNumber(value: number, precision = 1) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 18,
    stiffness: 170,
  });
  const [displayValue, setDisplayValue] = useState(value.toFixed(precision));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);

      return undefined;
    }

    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: "easeOut",
    });

    return () => {
      controls.stop();
    };
  }, [motionValue, precision, reduceMotion, value]);

  useMotionValueEvent(springValue, "change", (latest) => {
    setDisplayValue(latest.toFixed(precision));
  });

  return reduceMotion ? value.toFixed(precision) : displayValue;
}
