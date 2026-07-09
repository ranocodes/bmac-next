"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/5 border border-destructive/15 flex items-center justify-center mb-5">
        <span className="text-2xl font-bold text-destructive">!</span>
      </div>
      <h1 className="font-display text-xl font-bold text-secondary mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{error.message}</p>
      <button onClick={reset}
        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-primary transition-colors">
        Try again
      </button>
    </div>
  );
}
