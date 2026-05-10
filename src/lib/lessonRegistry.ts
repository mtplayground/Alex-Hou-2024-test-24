export type LessonMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  durationMinutes?: number;
  tags?: readonly string[];
  advancedAvailable?: boolean;
  illustration?: string;
  prerequisites?: readonly string[];
};

export type RegisteredLessonMeta = Omit<
  LessonMeta,
  "prerequisites" | "tags"
> & {
  prerequisites: readonly string[];
  tags: readonly string[];
};

type LessonMetaModule = {
  default?: LessonMeta;
  lessonMeta?: LessonMeta;
  meta?: LessonMeta;
};

const lessonMetaModules = import.meta.glob<LessonMetaModule>(
  "../lessons/*/meta.ts",
  {
    eager: true,
  },
);

function getSlugFromModulePath(modulePath: string) {
  const pathSegments = modulePath.split("/");
  const slug = pathSegments[pathSegments.length - 2];

  if (slug === undefined || slug.length === 0) {
    throw new Error(
      `Unable to derive a lesson slug from module path "${modulePath}".`,
    );
  }

  return slug;
}

function getLessonMetaExport(modulePath: string, module: LessonMetaModule) {
  const lessonMeta = module.default ?? module.lessonMeta ?? module.meta;

  if (lessonMeta === undefined) {
    throw new Error(
      `Lesson metadata module "${modulePath}" must export lesson metadata as the default export, "lessonMeta", or "meta".`,
    );
  }

  return lessonMeta;
}

function normalizeLessonMeta(
  modulePath: string,
  module: LessonMetaModule,
): RegisteredLessonMeta {
  const derivedSlug = getSlugFromModulePath(modulePath);
  const lessonMeta = getLessonMetaExport(modulePath, module);

  if (lessonMeta.slug !== derivedSlug) {
    throw new Error(
      `Lesson metadata in "${modulePath}" declares slug "${lessonMeta.slug}", but the folder-derived slug is "${derivedSlug}".`,
    );
  }

  if (lessonMeta.title.trim().length === 0) {
    throw new Error(`Lesson "${lessonMeta.slug}" must define a title.`);
  }

  if (lessonMeta.description.trim().length === 0) {
    throw new Error(`Lesson "${lessonMeta.slug}" must define a description.`);
  }

  if (!Number.isFinite(lessonMeta.order)) {
    throw new Error(
      `Lesson "${lessonMeta.slug}" must define a finite numeric order.`,
    );
  }

  return {
    ...lessonMeta,
    prerequisites: lessonMeta.prerequisites?.slice() ?? [],
    tags: lessonMeta.tags?.slice() ?? [],
  } satisfies RegisteredLessonMeta;
}

export const lessons = Object.entries(lessonMetaModules)
  .map(([modulePath, module]) => normalizeLessonMeta(modulePath, module))
  .sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
