import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

type AdvancedOnlyProps = {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
};

function AdvancedOnly({
  children,
  className,
  fallback = null,
}: AdvancedOnlyProps) {
  const advancedMode = useAppStore((state) => state.advancedMode);
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    if (advancedMode) {
      return <div className={className}>{children}</div>;
    }

    return fallback === null ? null : (
      <div className={className}>{fallback}</div>
    );
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {advancedMode ? (
        <motion.div
          key="advanced-content"
          animate={{ height: "auto", opacity: 1, y: 0 }}
          className={cn("overflow-hidden", className)}
          exit={{ height: 0, opacity: 0, y: -12 }}
          initial={{ height: 0, opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      ) : fallback === null ? null : (
        <motion.div
          key="advanced-fallback"
          animate={{ opacity: 1, y: 0 }}
          className={className}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {fallback}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdvancedOnly;
