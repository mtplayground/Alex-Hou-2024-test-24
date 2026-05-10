import { createBrowserRouter } from "react-router-dom";

import AppShell from "@/app/app-shell";
import GalleryPage from "@/app/routes/gallery-page";
import HomePage from "@/app/routes/home-page";
import LessonPage from "@/app/routes/lesson-page";
import NotFoundPage from "@/app/routes/not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "lessons/:slug",
        element: <LessonPage />,
      },
      {
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
