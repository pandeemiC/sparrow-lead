"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-8">
      <p className="text-sm text-white/70">
        Something went wrong loading this page.
      </p>
      <button onClick={() => unstable_retry()} className="sp-ghost">
        Try again
      </button>
    </div>
  );
}
