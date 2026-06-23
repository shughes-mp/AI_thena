import Link from "next/link";
import type { TeachingBriefV1 } from "@/lib/teaching-brief";
import { INSTRUCTOR_LABELS } from "@/lib/instructor-ux";

const MODE_LABELS = {
  observer: "Observer · step back",
  guide: "Guide · offer one focusing prompt",
  conductor: "Conductor · use a brief shared reset",
} as const;

export function TeachingBriefFacilitationPivots({
  sessionId,
  pivots,
}: {
  sessionId: string;
  pivots: TeachingBriefV1["facilitationPivots"];
}) {
  return (
    <section className="minerva-card p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow eyebrow-teal">{INSTRUCTOR_LABELS.teachingMoves}</p>
          <h2 className="mt-2 font-serif text-[34px] leading-[1] tracking-[-0.03em] text-[var(--charcoal)]">
            Recommended pivots
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--dim-grey)]">
            These rule-based recommendations suggest the least intervention that appears proportionate. The instructor remains in control, and every recommendation says when to step back again.
          </p>
        </div>
        <Link
          href={`/instructor/${sessionId}/monitor`}
          className="minerva-button minerva-button-secondary"
        >
          Open live review
        </Link>
      </div>

      {pivots.length === 0 ? (
        <p className="mt-5 border border-[var(--rule)] bg-[rgba(34,34,34,0.02)] p-4 text-sm text-[var(--dim-grey)]">
          No evidence-supported teaching move was recorded for this brief.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {pivots.map((pivot) => (
            <article key={pivot.id} className="border-l-4 border-[var(--teal)] bg-[rgba(17,120,144,0.05)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--dim-grey)]">
                    {pivot.scopeType} scope · {pivot.evidenceScope}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold capitalize text-[var(--charcoal)]">
                    {MODE_LABELS[pivot.mode]}
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--rule)] bg-white px-3 py-1 text-xs font-semibold capitalize">
                  {pivot.reviewState.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--charcoal)]">
                <strong>Observed:</strong> {pivot.observedCondition}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--dim-grey)]">
                <strong className="text-[var(--charcoal)]">Suggested move:</strong>{" "}
                {pivot.suggestedMove}
              </p>
              {pivot.suggestedPhrase ? (
                <blockquote className="mt-3 border-l-2 border-[var(--teal)] pl-3 text-sm italic leading-6 text-[var(--dim-grey)]">
                  “{pivot.suggestedPhrase}”
                </blockquote>
              ) : null}
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="bg-white p-3 text-[var(--dim-grey)]">
                  <strong className="text-[var(--charcoal)]">Escalate only when:</strong>{" "}
                  {pivot.escalationCondition ?? "No automatic escalation is recommended."}
                </p>
                <p className="bg-white p-3 text-[var(--dim-grey)]">
                  <strong className="text-[var(--charcoal)]">Step back when:</strong>{" "}
                  {pivot.releaseCondition}
                </p>
              </div>
              <p className="mt-3 text-xs text-[var(--dim-grey)]">
                {pivot.confidence} confidence · {pivot.createdBy}-generated mode · instructor-controlled
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
