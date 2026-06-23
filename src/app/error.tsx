"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Route rendering failed", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f5f4f1] px-6 py-20 text-[#292724]">
      <section className="mx-auto max-w-2xl border border-[#d8d4cd] bg-white p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#087f96]">
          Something interrupted this page
        </p>
        <h1 className="font-serif text-5xl leading-tight">Let&apos;s try that again.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#67615a]">
          Your work may still be saved. Retry the page first; if the problem
          continues, return to the previous screen and repeat the last action.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-8 bg-[#087f96] px-5 py-3 font-semibold text-white hover:bg-[#066b7e]"
        >
          Try again
        </button>
        {error.digest ? (
          <p className="mt-6 text-xs text-[#8a847c]">Reference: {error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
