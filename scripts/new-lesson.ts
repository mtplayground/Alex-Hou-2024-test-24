import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type LessonTemplate = {
  lessonMdx: string;
  meta: string;
  simulationsIndex: string;
};

function printUsage() {
  console.error("Usage: pnpm new-lesson <slug>");
}

function getValidatedSlug(rawSlug: string | undefined) {
  if (rawSlug === undefined) {
    printUsage();
    process.exitCode = 1;
    throw new Error("A lesson slug is required.");
  }

  const normalizedSlug = rawSlug.trim().toLowerCase();
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugPattern.test(normalizedSlug)) {
    process.exitCode = 1;
    throw new Error(
      `Invalid slug "${rawSlug}". Use lowercase letters, numbers, and single hyphens.`,
    );
  }

  return normalizedSlug;
}

function getTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createLessonTemplate(slug: string): LessonTemplate {
  const lessonTitle = getTitleFromSlug(slug);

  return {
    meta: `import type { LessonMeta } from "@/lib/lessonRegistry";

const lessonMeta: LessonMeta = {
  slug: "${slug}",
  title: "${lessonTitle}",
  description: "${lessonTitle} introduces the core idea for this lesson.",
  order: 0,
  durationMinutes: 10,
  tags: ["pulleys"],
  advancedAvailable: false,
};

export default lessonMeta;
`,
    lessonMdx: `# ${lessonTitle}

Welcome to **${lessonTitle}**.

## Learning goals

- Explain the main pulley concept this lesson covers.
- Connect the concept to a hands-on or real-world example.
- Decide which question, simulation, or checkpoint should come next.

## Draft outline

Start with a short introduction, then add visuals, interactivity, and checks
for understanding as the lesson takes shape.
`,
    simulationsIndex: `export type LessonSimulationDefinition = {
  id: string;
  title: string;
  description: string;
};

export const lessonSimulations: LessonSimulationDefinition[] = [];
`,
  };
}

async function scaffoldLesson(slug: string) {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const lessonsRootDirectory = path.resolve(scriptDirectory, "../src/lessons");
  const lessonDirectory = path.resolve(lessonsRootDirectory, slug);
  const simulationsDirectory = path.join(lessonDirectory, "simulations");
  const metaPath = path.join(lessonDirectory, "meta.ts");
  const lessonMdxPath = path.join(lessonDirectory, "lesson.mdx");
  const simulationsIndexPath = path.join(simulationsDirectory, "index.ts");
  const template = createLessonTemplate(slug);

  await mkdir(lessonsRootDirectory, { recursive: true });
  await mkdir(lessonDirectory, { recursive: false });
  await mkdir(simulationsDirectory, { recursive: false });
  await Promise.all([
    writeFile(metaPath, template.meta, { encoding: "utf8", flag: "wx" }),
    writeFile(lessonMdxPath, template.lessonMdx, {
      encoding: "utf8",
      flag: "wx",
    }),
    writeFile(simulationsIndexPath, template.simulationsIndex, {
      encoding: "utf8",
      flag: "wx",
    }),
  ]);

  console.log(`Created lesson scaffold for "${slug}":`);
  console.log(`- ${path.relative(process.cwd(), metaPath)}`);
  console.log(`- ${path.relative(process.cwd(), lessonMdxPath)}`);
  console.log(`- ${path.relative(process.cwd(), simulationsIndexPath)}`);
}

async function main() {
  try {
    const slug = getValidatedSlug(process.argv[2]);
    await scaffoldLesson(slug);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown lesson scaffolding error.";

    console.error(message);

    if (process.exitCode === undefined || process.exitCode === 0) {
      process.exitCode = 1;
    }
  }
}

void main();
