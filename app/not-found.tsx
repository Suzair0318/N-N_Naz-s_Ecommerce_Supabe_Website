import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-offwhite px-6 text-center">
      <span className="eyebrow text-gold">Error 404</span>
      <h1 className="font-serif text-5xl tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
