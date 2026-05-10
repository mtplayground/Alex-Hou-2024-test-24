import {
  lazy,
  type ComponentType,
  type ElementType,
  type LazyExoticComponent,
} from "react";

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

export type LessonSectionMeta = {
  id: string;
  title: string;
};

export type LessonMdxComponentMap = Record<string, ElementType>;

export type LessonContentProps = {
  components?: LessonMdxComponentMap;
};

export type LessonContentModule = {
  default: ComponentType<LessonContentProps>;
  lessonSections?: readonly LessonSectionMeta[];
};

export type RegisteredLesson = RegisteredLessonMeta & {
  Content: LazyExoticComponent<ComponentType<LessonContentProps>>;
  lessonSections: readonly LessonSectionMeta[];
  loadContent: () => Promise<LessonContentModule>;
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
const lessonContentModules = import.meta.glob<LessonContentModule>(
  "../lessons/*/lesson.mdx",
);
const lessonSectionModules = import.meta.glob<{
  lessonSections: readonly LessonSectionMeta[];
}>("../lessons/*/sections.ts", {
  eager: true,
});

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
  .map(([modulePath, module]) => {
    const lessonMeta = normalizeLessonMeta(modulePath, module);
    const lessonDirectoryPath = modulePath.slice(
      0,
      modulePath.lastIndexOf("/meta.ts"),
    );
    const contentModulePath = `${lessonDirectoryPath}/lesson.mdx`;
    const lessonSectionModulePath = `${lessonDirectoryPath}/sections.ts`;
    const loadContent = lessonContentModules[contentModulePath];
    const lessonSectionModule = lessonSectionModules[lessonSectionModulePath];

    if (loadContent === undefined) {
      throw new Error(
        `Lesson "${lessonMeta.slug}" is missing a matching lesson.mdx module at "${contentModulePath}".`,
      );
    }

    if (lessonSectionModule === undefined) {
      throw new Error(
        `Lesson "${lessonMeta.slug}" is missing section metadata at "${lessonSectionModulePath}".`,
      );
    }

    return {
      ...lessonMeta,
      Content: lazy(async () => {
        const lessonContentModule = await loadContent();

        return {
          default: lessonContentModule.default,
        };
      }),
      lessonSections: lessonSectionModule.lessonSections,
      loadContent,
    } satisfies RegisteredLesson;
  })
  .sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
