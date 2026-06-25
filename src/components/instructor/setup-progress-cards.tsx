"use client";

export type SetupStepStatus = "complete" | "attention" | "ready" | "locked";

export interface SetupProgressItem {
  key?: string | number | null;
  step: number;
  title: string;
  description: string;
  status: SetupStepStatus;
  onClick: () => void;
  current?: boolean;
}

const STATUS_COPY: Record<SetupStepStatus, string> = {
  complete: "Complete",
  attention: "Needs setup",
  ready: "Ready",
  locked: "Locked",
};

const CARD_STYLES: Record<SetupStepStatus, string> = {
  complete: "border-[rgba(17,120,144,0.28)] bg-[rgba(17,120,144,0.05)]",
  attention: "border-[rgba(223,47,38,0.2)] bg-white",
  ready: "border-[rgba(17,120,144,0.18)] bg-white",
  locked: "border-[var(--rule)] bg-[rgba(34,34,34,0.02)]",
};

const BADGE_STYLES: Record<SetupStepStatus, string> = {
  complete:
    "border-[rgba(17,120,144,0.24)] bg-[rgba(17,120,144,0.08)] text-[var(--teal)]",
  attention:
    "border-[rgba(223,47,38,0.22)] bg-[rgba(223,47,38,0.08)] text-[var(--signal)]",
  ready: "border-[var(--rule)] bg-white text-[var(--charcoal)]",
  locked:
    "border-[var(--rule)] bg-[rgba(34,34,34,0.02)] text-[var(--dim-grey)]",
};

function SetupProgressCard({
  step,
  title,
  description,
  status,
  current = false,
  onClick,
}: SetupProgressItem) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-xl border p-4 text-left transition-colors hover:border-[rgba(17,120,144,0.28)] ${
        current ? "ring-1 ring-[rgba(17,120,144,0.22)]" : ""
      } ${CARD_STYLES[status]}`}
      aria-current={current ? "step" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex min-w-[2rem] items-center justify-center rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${BADGE_STYLES[status]}`}
        >
          {status === "complete" ? "✓" : step}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dim-grey)]">
          {STATUS_COPY[status]}
        </span>
      </div>
      <h2 className="mt-4 text-base font-medium tracking-[-0.01em] text-[var(--charcoal)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--dim-grey)]">
        {description}
      </p>
    </button>
  );
}

export function SetupProgressCards({ items }: { items: SetupProgressItem[] }) {
  return (
    <section
      className="minerva-card p-4 md:p-5"
      aria-labelledby="setup-map-heading"
    >
      <h2 id="setup-map-heading" className="sr-only">
        Setup progress
      </h2>
      <div className="grid gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <SetupProgressCard key={item.step} {...item} />
        ))}
      </div>
    </section>
  );
}
