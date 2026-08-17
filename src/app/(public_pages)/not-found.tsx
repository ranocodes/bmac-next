import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-background min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-display font-bold text-xl text-secondary mb-6">
          BMAC Jos
        </p>
        <h1 className="font-display text-3xl font-bold text-secondary mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/programs"
            className="inline-flex items-center justify-center px-5 py-3 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Programs
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-5 py-3 border border-border text-secondary rounded-lg text-sm font-bold hover:border-primary/40 hover:text-primary transition-colors"
          >
            Events
          </Link>
          <Link
            href="/get-involved"
            className="inline-flex items-center justify-center px-5 py-3 border border-border text-secondary rounded-lg text-sm font-bold hover:border-primary/40 hover:text-primary transition-colors"
          >
            Get Involved
          </Link>
        </div>
      </div>
    </main>
  );
}
