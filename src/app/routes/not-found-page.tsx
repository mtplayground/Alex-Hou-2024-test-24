import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function NotFoundPage() {
  return (
    <Card className="border-dashed border-slate-300 bg-white/85">
      <CardHeader>
        <CardTitle className="font-display text-4xl text-slate-900">
          That page is not part of the pulley workshop yet.
        </CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
          The router includes a fallback page so unknown routes return users to
          the main shell instead of a blank screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return home
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default NotFoundPage;
