"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type {
  EvidenceReviewAction,
  EvidenceSignalRecord,
  EvidenceSignalStatus,
  LegacyUnversionedSignalRecord,
} from "@/types";

interface EvidenceReviewPanelProps {
  sessionId: string;
}

const statusTone: Record<EvidenceSignalStatus, string> = {
  provisional: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  revised: "bg-sky-50 text-sky-800",
  rejected: "bg-rose-50 text-rose-800",
  superseded: "bg-slate-100 text-slate-600",
};

export function EvidenceReviewPanel({ sessionId }: EvidenceReviewPanelProps) {
  const [signals, setSignals] = useState<EvidenceSignalRecord[]>([]);
  const [legacySignals, setLegacySignals] = useState<LegacyUnversionedSignalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const loadSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/evidence-signals`);
      const data = (await response.json()) as {
        signals?: EvidenceSignalRecord[];
        legacyUnversioned?: LegacyUnversionedSignalRecord[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Could not load evidence.");
      setSignals(data.signals ?? []);
      setLegacySignals(data.legacyUnversioned ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load evidence.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSignals();
  }, [loadSignals]);

  async function review(signal: EvidenceSignalRecord, action: EvidenceReviewAction) {
    let revisedClaim: string | undefined;
    let rationale: string | undefined;
    let contextualNote: string | undefined;

    if (action === "revise") {
      revisedClaim = window.prompt("Revise the provisional claim:", signal.claim)?.trim();
      if (!revisedClaim) return;
      rationale = window.prompt("Why is this revision more accurate?")?.trim();
    } else if (action === "reject" || action === "mark_acceptable") {
      rationale = window.prompt(
        action === "mark_acceptable"
          ? "Why is this an acceptable interpretation?"
          : "Why should this signal be rejected?"
      )?.trim();
      if (!rationale) return;
    } else if (action === "flag_for_discussion" || action === "add_context") {
      contextualNote = window.prompt("Add an instructor note:")?.trim();
      if (!contextualNote) return;
    }

    setWorkingId(signal.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/evidence-signals/${signal.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, revisedClaim, rationale, contextualNote }),
        }
      );
      const data = (await response.json()) as {
        signal?: EvidenceSignalRecord;
        error?: string;
      };
      if (!response.ok || !data.signal) {
        throw new Error(data.error || "Could not save the review.");
      }
      setSignals((current) =>
        current.map((item) => (item.id === signal.id ? data.signal! : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the review.");
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return <div className="minerva-card p-6 text-sm text-[var(--dim-grey)]">Loading evidence signals…</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {legacySignals.length > 0 && (
        <details className="minerva-card p-6 md:p-8">
          <summary className="cursor-pointer font-serif text-2xl text-[var(--charcoal)]">
            Legacy unversioned records ({legacySignals.length})
          </summary>
          <p className="mt-3 max-w-3xl text-sm text-[var(--dim-grey)]">
            These records predate stable citations and version metadata. They remain readable for compatibility, but cannot be approved as traceable evidence in this workflow.
          </p>
          <div className="mt-5 space-y-3">
            {legacySignals.map((signal) => (
              <div key={signal.id} className="rounded-lg border border-[var(--rule)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--dim-grey)]">
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-mono">legacy-unversioned</span>
                  <span>{signal.learnerName}</span>
                  <span>confidence: {signal.confidence}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--charcoal)]">{signal.claim}</p>
                <p className="mt-2 text-sm text-[var(--dim-grey)]">{signal.description}</p>
                {signal.passageAnchor && (
                  <p className="mt-2 text-xs text-[var(--dim-grey)]">Legacy passage anchor: {signal.passageAnchor}</p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {!error && signals.length === 0 ? (
        <div className="minerva-card p-8">
          <h2 className="font-serif text-2xl text-[var(--charcoal)]">No traceable signals yet</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--dim-grey)]">
            New possible misunderstandings appear here only when AI_thena can link the learner&apos;s exact words to a validated source passage.
          </p>
        </div>
      ) : (
        signals.map((signal) => (
          <article key={signal.id} className="minerva-card p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dim-grey)]">
                  Inference · {signal.learnerName || "Learner"}
                </p>
                <div className="mt-2 max-w-3xl text-xl font-semibold text-[var(--charcoal)]">
                  <ReactMarkdown>{signal.claim}</ReactMarkdown>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone[signal.status]}`}>
                {signal.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {signal.citations.map((citation) => (
                <div key={citation.id} className="rounded-lg border border-[var(--rule)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--teal)]">
                    {citation.citationType === "source_passage" ? "Source evidence" : citation.citationType.replace(/_/g, " ")}
                  </p>
                  <blockquote className="mt-3 border-l-2 border-[var(--teal)] pl-3 text-sm text-[var(--charcoal)]">
                    {citation.quotedText}
                  </blockquote>
                  {citation.sourceFilename && (
                    <p className="mt-2 text-xs text-[var(--dim-grey)]">
                      {citation.sourceFilename} · passage {citation.passageId}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-[var(--dim-grey)]">{citation.relevanceRationale}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Info title={`Confidence: ${signal.confidenceLevel}`} text={signal.confidenceRationale} />
              <Info title="Missing evidence" text={signal.missingEvidence} />
              <Info title="Limitations / alternative" text={signal.limitations} />
            </div>

            {(signal.learningOutcomes.length > 0 || signal.evidenceQuestions.length > 0) && (
              <div className="mt-5 rounded-lg border border-[var(--rule)] p-4 text-sm">
                {signal.learningOutcomes.length > 0 && (
                  <p className="text-[var(--charcoal)]">
                    <span className="font-semibold">Learning outcome:</span>{" "}
                    {signal.learningOutcomes.map((outcome) => outcome.label).join(" · ")}
                  </p>
                )}
                {signal.evidenceQuestions.length > 0 && (
                  <p className="mt-2 text-[var(--dim-grey)]">
                    <span className="font-semibold text-[var(--charcoal)]">Evidence question:</span>{" "}
                    {signal.evidenceQuestions.map((question) => question.prompt).join(" · ")}
                  </p>
                )}
              </div>
            )}

            {signal.recommendation && (
              <div className="mt-5 rounded-lg bg-[rgba(17,120,144,0.06)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--teal)]">
                  Recommended {signal.recommendation.mode} move · rule {signal.recommendation.ruleVersion}
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--charcoal)]">{signal.recommendation.suggestedMove}</p>
                {signal.recommendation.suggestedPhrase && (
                  <p className="mt-3 text-sm italic text-[var(--dim-grey)]">“{signal.recommendation.suggestedPhrase}”</p>
                )}
                <p className="mt-3 text-xs text-[var(--dim-grey)]">
                  Release control when: {signal.recommendation.releaseCondition}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--rule)] pt-5">
              <Action label="Approve" onClick={() => review(signal, "approve")} disabled={workingId === signal.id} />
              <Action label="Revise" onClick={() => review(signal, "revise")} disabled={workingId === signal.id} secondary />
              <Action label="Reject" onClick={() => review(signal, "reject")} disabled={workingId === signal.id} secondary />
              <Action label="Mark acceptable" onClick={() => review(signal, "mark_acceptable")} disabled={workingId === signal.id} secondary />
              <Action label="Flag for discussion" onClick={() => review(signal, "flag_for_discussion")} disabled={workingId === signal.id} secondary />
              <Action label="Add context" onClick={() => review(signal, "add_context")} disabled={workingId === signal.id} secondary />
              {signal.reviews.length > 0 && signal.status !== "provisional" && (
                <Action label="Undo last state change" onClick={() => review(signal, "undo")} disabled={workingId === signal.id} secondary />
              )}
            </div>

            {signal.reviews.length > 0 && (
              <details className="mt-5 text-sm text-[var(--dim-grey)]">
                <summary className="cursor-pointer font-medium text-[var(--charcoal)]">Review history ({signal.reviews.length})</summary>
                <ol className="mt-3 space-y-2">
                  {signal.reviews.map((item) => (
                    <li key={item.id} className="rounded-md bg-[rgba(34,34,34,0.03)] p-3">
                      {item.action.replace(/_/g, " ")} · {item.previousStatus} → {item.newStatus}
                      {(item.rationale || item.contextualNote) && <p className="mt-1">{item.rationale || item.contextualNote}</p>}
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <p className="mt-5 font-mono text-[10px] text-[var(--dim-grey)]">
              {signal.modelId} · {signal.promptVersion} · {signal.parserVersion} · {signal.evidencePolicyVersion}
            </p>
          </article>
        ))
      )}
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-[rgba(34,34,34,0.03)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--dim-grey)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--charcoal)]">{text}</p>
    </div>
  );
}

function Action({ label, onClick, disabled, secondary = false }: { label: string; onClick: () => void; disabled: boolean; secondary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`minerva-button ${secondary ? "minerva-button-secondary" : ""}`}>
      {label}
    </button>
  );
}
