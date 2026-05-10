import { Camera, FerrisWheel, Sailboat, Wrench } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const galleryHighlights = [
  {
    title: "Construction cranes",
    description:
      "Massive hoists use pulley systems to trade force for controlled lifting.",
    icon: Wrench,
  },
  {
    title: "Sailing rigs",
    description:
      "Block-and-tackle setups help sailors adjust heavy sails with less effort.",
    icon: Sailboat,
  },
  {
    title: "Amusement rides",
    description:
      "Maintenance teams rely on pulley-driven mechanisms for safe inspection work.",
    icon: FerrisWheel,
  },
];

function GalleryPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-100 via-rose-50 to-sky-100 shadow-float">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
            <Camera className="h-4 w-4" />
            Real-World Gallery
          </div>
          <CardTitle className="font-display text-4xl text-slate-900 sm:text-5xl">
            A dedicated route for pulley examples outside the core lesson path.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-700">
            This page is a stable destination in the router for the future
            gallery experience. For now, it showcases the shell and layout with
            a small set of placeholder examples.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {galleryHighlights.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/85">
            <CardHeader>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-kid-coral/15 text-kid-ink">
                <Icon className="h-5 w-5" />
              </span>
              <CardTitle className="font-display text-2xl text-slate-900">
                {title}
              </CardTitle>
              <CardDescription className="text-base leading-7 text-slate-600">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Gallery content, media, and story cards will grow here without
              changing the surrounding app shell.
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default GalleryPage;
