import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-background flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <div className="font-display font-bold text-6xl text-primary tracking-tight">
          BMAC<span className="text-secondary">.</span>
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Page not found
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-secondary">
          This page has gone missing
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Head back
          to one of our main sections to keep exploring.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-muted transition-colors"
          >
            Programs
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-muted transition-colors"
          >
            Events
          </Link>
        </div>
      </div>
    </main>
  );
}
