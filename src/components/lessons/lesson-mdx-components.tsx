import AdvancedOnly from "@/components/advanced/advanced-only";
import BucketLiftWidget from "@/components/lessons/bucket-lift-widget";
import FixedPulleySandbox from "@/components/lessons/fixed-pulley-sandbox";
import DragMatch from "@/components/drag-match/drag-match";
import LessonPulleyDemo from "@/components/lessons/lesson-pulley-demo";
import LessonSection from "@/components/lessons/lesson-section";
import NumericAnswer from "@/components/numeric-answer/numeric-answer";
import Quiz from "@/components/quiz/quiz";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import type { LessonMdxComponentMap } from "@/lib/lessonRegistry";

export const lessonMdxComponents = {
  AdvancedOnly,
  BucketLiftWidget,
  FixedPulleySandbox,
  DragMatch,
  ForceMeter,
  LessonSection,
  MechanicalAdvantage,
  NumericAnswer,
  PulleyDemo: LessonPulleyDemo,
  Quiz,
} satisfies LessonMdxComponentMap;
