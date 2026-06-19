import Link from "next/link";

import { GroundingAuditPanel } from "@/components/instructor/grounding-audit-panel";

export default async function GroundingAuditPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <main className="min-h-screen bg-[var(--paper)] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <nav className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dim-grey)]">
          <Link href={`/instructor/${sessionId}`} className="hover:text-[var(--teal)]">Session workspace</Link>
          <span className="px-2">/</span>
          <span className="text-[var(--charcoal)]">Grounding &amp; protection</span>
        </nav>
        <header className="mb-8 mt-5">
          <h1 className="font-serif text-[44px] leading-none tracking-[-0.03em] text-[var(--charcoal)]">Grounding &amp; protection</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--dim-grey)]">
            Inspect which tutor responses were grounded in uploaded passages, when the source set was insufficient, and when protected assessment material changed the coaching path.
          </p>
        </header>
        <GroundingAuditPanel sessionId={sessionId} />
      </div>
    </main>
  );
}
