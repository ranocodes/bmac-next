"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        We hit an unexpected error loading this page. Try again, or head back
        to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
