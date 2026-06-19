"use client";

import { useState } from "react";

interface LearnerReflectionFormProps {
  studentSessionId: string;
  capabilityToken: string;
  onSaved: () => void;
}

export function LearnerReflectionForm({
  studentSessionId,
  capabilityToken,
  onSaved,
}: LearnerReflectionFormProps) {
  const [changedThinking, setChangedThinking] = useState("");
  const [supportedClaim, setSupportedClaim] = useState("");
  const [remainingUncertainty, setRemainingUncertainty] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [summaryAnnotation, setSummaryAnnotation] = useState("");
  const [summaryContested, setSummaryContested] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const hasInput = Boolean(
    changedThinking.trim() ||
    supportedClaim.trim() ||
    remainingUncertainty.trim() ||
    nextStep.trim() ||
    summaryAnnotation.trim() ||
    summaryContested
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    try {
      const response = await fetch(
        `/api/student-sessions/${studentSessionId}/reflection`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capabilityToken,
            changedThinking,
            supportedClaim,
            remainingUncertainty,
            nextStep,
            summaryAnnotation,
            summaryContested,
          }),
        }
      );

      if (!response.ok) throw new Error("Could not save reflection");
      setStatus("saved");
      onSaved();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="minerva-card mt-8 max-w-3xl p-6 md:p-8">
      <p className="eyebrow eyebrow-olive">Your reflection</p>
      <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[var(--charcoal)]">
        Add your view before your instructor reviews this
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dim-grey)]">
        These prompts are optional. Answer the ones that are useful, or simply correct the AI summary below.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <ReflectionField
          id="changed-thinking"
          label="What changed or became clearer in your thinking?"
          value={changedThinking}
          onChange={setChangedThinking}
        />
        <ReflectionField
          id="supported-claim"
          label="Which claim can you now support with evidence?"
          value={supportedClaim}
          onChange={setSupportedClaim}
        />
        <ReflectionField
          id="remaining-uncertainty"
          label="What remains uncertain?"
          value={remainingUncertainty}
          onChange={setRemainingUncertainty}
        />
        <ReflectionField
          id="next-step"
          label="What will you try or examine next?"
          value={nextStep}
          onChange={setNextStep}
        />
      </div>

      <div className="mt-6 border-t border-[var(--rule)] pt-6">
        <ReflectionField
          id="summary-annotation"
          label="Is the AI summary inaccurate or incomplete? Add a correction."
          value={summaryAnnotation}
          onChange={setSummaryAnnotation}
          rows={3}
        />
        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[var(--charcoal)]">
          <input
            type="checkbox"
            checked={summaryContested}
            onChange={(event) => setSummaryContested(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--teal)]"
          />
          Mark the AI summary as inaccurate or incomplete for instructor review.
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!hasInput || status === "saving" || status === "saved"}
          className="minerva-button"
        >
          {status === "saving" ? "Saving..." : status === "saved" ? "Reflection saved" : "Save reflection"}
        </button>
        <p aria-live="polite" className="text-sm text-[var(--dim-grey)]">
          {status === "saved" && "Your reflection will accompany the AI summary."}
          {status === "error" && "Your reflection was not saved. Please try again."}
        </p>
      </div>
    </form>
  );
}

function ReflectionField({
  id,
  label,
  value,
  onChange,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="minerva-label">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        maxLength={2000}
        className="minerva-input mt-2 min-h-28 resize-y"
      />
    </div>
  );
}
