"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getInstructorWorkspacePhases,
  type InstructorWorkspaceNavKey,
  type InstructorWorkspacePhase,
} from "@/lib/instructor-ux";

function useLocationHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return hash;
}

function getActiveNavKey(
  pathname: string,
  hash: string,
  view: string | null
): InstructorWorkspaceNavKey {
  if (pathname.endsWith("/planning")) return "preview";
  if (pathname.endsWith("/monitor")) {
    if (view === "live" && hash === "#suggested-moves") return "suggested-moves";
    if (view === "live") return "live-signals";
    return "learner-activity";
  }
  if (pathname.endsWith("/evidence")) return "evidence-review";
  if (pathname.endsWith("/grounding")) return "source-use";
  if (pathname.endsWith("/report")) return "export";
  if (pathname.endsWith("/analysis")) return "teaching-brief";

  if (hash === "#source-materials") return "sources";
  if (hash === "#evidence-questions") return "evidence-questions";
  if (hash === "#learner-link") return "share";
  return "setup";
}

function getActivePhase(key: InstructorWorkspaceNavKey): InstructorWorkspacePhase {
  switch (key) {
    case "setup":
    case "sources":
    case "evidence-questions":
    case "preview":
    case "share":
      return "prepare";
    case "learner-activity":
    case "live-signals":
    case "suggested-moves":
      return "run";
    case "teaching-brief":
    case "evidence-review":
    case "source-use":
    case "export":
      return "review";
  }
}

export function InstructorWorkspaceNavigation({
  sessionId,
}: {
  sessionId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = useLocationHash();

  const phases = useMemo(
    () => getInstructorWorkspacePhases(sessionId),
    [sessionId]
  );

  const activeItemKey = getActiveNavKey(
    pathname,
    hash,
    searchParams.get("view")
  );
  const activePhase = getActivePhase(activeItemKey);
  const activePhaseConfig = phases.find((phase) => phase.key === activePhase) ?? phases[0];

  return (
    <div className="space-y-4 border-t border-[var(--rule)] pt-6">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Instructor workspace phases"
      >
        {phases.map((phase) => {
          const selected = phase.key === activePhase;
          return (
            <Link
              key={phase.key}
              href={phase.href}
              role="tab"
              aria-selected={selected}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-white"
                  : "border-[var(--rule)] bg-white text-[var(--dim-grey)] hover:text-[var(--charcoal)]"
              }`}
            >
              {phase.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {activePhaseConfig.items.map((item) => {
          const selected = item.key === activeItemKey;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`border p-4 transition-colors ${
                selected
                  ? "border-[var(--teal)] bg-[rgba(17,120,144,0.06)]"
                  : "border-[var(--rule)] bg-white hover:border-[rgba(17,120,144,0.28)]"
              }`}
              aria-current={selected ? "page" : undefined}
            >
              <p className="text-sm font-semibold text-[var(--charcoal)]">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--dim-grey)]">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
