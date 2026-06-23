"use client";

import { LoadingState } from "@/components/ui/loading-state";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AccessCodeCard,
  GuidedWorkflowHub,
  SessionInsightsCard,
  AssessmentsSection,
  QuestionsSection,
  ReadingsSection,
  StatusBar,
  TeachingContextSection,
  GoalsSection,
  WorkspaceHeader,
} from "@/components/instructor/session-workspace-panels";
import type {
  CheckpointRecord,
  FileInfo,
  SessionDetails,
} from "@/types";
import { getSessionPurposeOption } from "@/lib/session-purpose";

function getRecommendedCheckpoints(maxExchanges: number): number {
  if (maxExchanges < 8) {
    return 1;
  }
  return Math.floor((maxExchanges - 4) / 4);
}

function formatSavedTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}


export default function SessionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<"reading" | "assessment" | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [generatingMap, setGeneratingMap] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentUploadName, setRecentUploadName] = useState<string | null>(null);
  const [recentUploadCategory, setRecentUploadCategory] = useState<"reading" | "assessment" | null>(null);
  const [configSavedAt, setConfigSavedAt] = useState<Date | null>(null);
  const [showSavedState, setShowSavedState] = useState(false);
  const [dragActive, setDragActive] = useState<"reading" | "assessment" | null>(null);
  const [learnerCount, setLearnerCount] = useState(0);
  const [liveStatus, setLiveStatus] = useState<
    Array<{
      id: string;
      studentName: string;
      hasRecentEngagementConcern: boolean;
      latestEngagementFlag: string | null;
      isWaitingForStudentReply: boolean;
      secondsSinceLastMessage: number | null;
      endedAt: string | Date | null;
    }>
  >([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>([]);
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [savingCheckpoint, setSavingCheckpoint] = useState(false);
  const [showQuestionSavedState, setShowQuestionSavedState] = useState(false);
  const [editingCheckpointId, setEditingCheckpointId] = useState<string | null>(null);
  const [editingCheckpointPrompt, setEditingCheckpointPrompt] = useState("");
  const [newCheckpointPrompt, setNewCheckpointPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{
      prompt: string;
      processLevel: string;
      focusArea: string | null;
      rationale: string;
      qualityLabels: string[];
      expectations: string[];
      misconceptions: string[];
    }>
  >([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [acceptingSuggestionIndex, setAcceptingSuggestionIndex] = useState<number | null>(null);
  const [draggedCheckpointId, setDraggedCheckpointId] = useState<string | null>(null);
  const [dragTargetCheckpointId, setDragTargetCheckpointId] = useState<string | null>(null);
  const [showGoals, setShowGoals] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showReadings, setShowReadings] = useState(true);
  const [showAssessments, setShowAssessments] = useState(false);
  const [showSourceUseDetails, setShowSourceUseDetails] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(false);
  const [sectionsInitialized, setSectionsInitialized] = useState(false);
  const readingInputRef = useRef<HTMLInputElement>(null);
  const assessmentInputRef = useRef<HTMLInputElement>(null);

  const fetchCheckpoints = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load questions.");
      }

      setCheckpoints(Array.isArray(data?.checkpoints) ? data.checkpoints : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load questions.";
      setError(message);
    } finally {
      setLoadingCheckpoints(false);
    }
  }, [sessionId]);

  const fetchLearnerCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/students/summary`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load learners.");
      }

      if (Array.isArray(data)) {
        setLearnerCount(data.length);
        setLiveStatus(data);
      } else {
        setLearnerCount(0);
        setLiveStatus([]);
      }
    } catch (err) {
      console.error("Failed to load learners:", err);
      setLearnerCount(0);
      setLiveStatus([]);
    }
  }, [sessionId]);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/files`);

      const filesContentType = res.headers.get("content-type") ?? "";
      if (!filesContentType.includes("application/json")) {
        throw new Error(
          "The server is not responding correctly. Please refresh the page or contact support if the issue persists."
        );
      }

      const filesData = await res.json();
      if (!res.ok) {
        throw new Error(filesData.error || "Failed to load session files.");
      }
      setFiles(filesData.files);

      const configRes = await fetch(`/api/sessions/${sessionId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (configRes.ok) {
        const configData = await configRes.json().catch(() => null);
        if (configData) {
          setSession({
            id: configData.id,
            name: configData.name,
            description: configData.description,
            courseContext: configData.courseContext,
            learningGoal: configData.learningGoal,
            learningOutcomes: configData.learningOutcomes,
            prerequisiteMap: configData.prerequisiteMap,
            accessCode: configData.accessCode,
            createdAt: "",
            maxExchanges: configData.maxExchanges,
            stance: configData.stance ?? "directed",
            sessionPurpose: configData.sessionPurpose ?? "pre_class",
            opensAt: configData.opensAt ?? null,
            closesAt: configData.closesAt ?? null,
            readingsCount: filesData.files.filter((f: FileInfo) => f.category === "reading").length,
            assessmentsCount: filesData.files.filter((f: FileInfo) => f.category === "assessment").length,
            learnerPreviewCheckedAt: configData.learnerPreviewCheckedAt ?? null,
            instructorRole: configData.instructorRole,
          });
        }
      }

      await Promise.all([fetchCheckpoints(), fetchLearnerCount()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load session.";
      if (message.includes("<!DOCTYPE") || message.includes("Unexpected token")) {
        setError(
          "The server returned an unexpected response. Please refresh the page."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCheckpoints, fetchLearnerCount, sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    setPreviewChecked(Boolean(session?.learnerPreviewCheckedAt));
  }, [session?.learnerPreviewCheckedAt]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!recentUploadName) return;
    const timeout = window.setTimeout(() => {
      setRecentUploadName(null);
      setRecentUploadCategory(null);
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [recentUploadName]);

  useEffect(() => {
    if (!showSavedState) return;
    const timeout = window.setTimeout(() => setShowSavedState(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [showSavedState]);

  useEffect(() => {
    if (!showQuestionSavedState) return;
    const timeout = window.setTimeout(() => setShowQuestionSavedState(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [showQuestionSavedState]);

  // Auto-poll learner status for in-class (live) modes
  useEffect(() => {
    if (!session) return;
    const isLive =
      session.sessionPurpose === "during_class_prep" ||
      session.sessionPurpose === "during_class_reflection";
    if (!isLive || learnerCount === 0) return;
    const interval = window.setInterval(fetchLearnerCount, 15000);
    return () => window.clearInterval(interval);
  }, [session, learnerCount, fetchLearnerCount]);

  useEffect(() => {
    if (!loading && !sectionsInitialized) {
      const hasActiveStudents = learnerCount > 0;
      if (hasActiveStudents) {
        setShowGoals(false);
        setShowConfig(false);
        setShowQuestions(false);
        setShowReadings(false);
        setShowAssessments(false);
      } else {
        const needsReadings = files.filter((file) => file.category === "reading").length === 0;
        const needsQuestion = checkpoints.length === 0;
        const needsPurpose = !session?.learningOutcomes?.trim();
        setShowGoals(needsPurpose || (!needsReadings && !needsQuestion));
        setShowReadings(needsReadings);
        setShowQuestions(!needsReadings && needsQuestion);
        setShowConfig(false);
        setShowAssessments(false);
      }
      setSectionsInitialized(true);
    }
  }, [checkpoints.length, files, learnerCount, loading, sectionsInitialized, session?.learningOutcomes]);

  async function handleUpload(file: File, category: "reading" | "assessment") {
    setUploadingCategory(category);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch(`/api/sessions/${sessionId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const responseText = await res.text();
        let errorMessage = "Failed to upload file.";

        try {
          const data = JSON.parse(responseText) as { error?: string };
          errorMessage = data.error || errorMessage;
        } catch {
          if (res.status >= 500) {
            errorMessage =
              "The server could not process that file. Please try again or upload a text-based PDF, DOCX, TXT, or Markdown file.";
          }
        }

        throw new Error(errorMessage);
      }

      await fetchSession();
      setRecentUploadName(file.name);
      setRecentUploadCategory(category);
      setToast({
        tone: "success",
        message: `${category === "reading" ? "Source material" : "Assessment"} uploaded successfully.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setUploadingCategory(null);
    }
  }

  async function handleRemoveFile(fileId: string, category: string) {
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/files?fileId=${fileId}&category=${category}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove file.");
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed.");
    }
  }

  function handleDrop(e: React.DragEvent, category: "reading" | "assessment") {
    e.preventDefault();
    setDragActive(null);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleUpload(droppedFiles[0], category);
    }
  }

  function handleDragOver(e: React.DragEvent, category: "reading" | "assessment") {
    e.preventDefault();
    setDragActive(category);
  }

  function handleDragLeave() {
    setDragActive(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, category: "reading" | "assessment") {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleUpload(selectedFiles[0], category);
    }
    e.target.value = "";
  }

  async function copyLink() {
    if (!session) return;
    const url = `${window.location.origin}/s/${session.accessCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveTeachingContext() {
    if (!session) return;

    setSavingConfig(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: session.description ?? null,
          courseContext: session.courseContext,
          learningGoal: session.learningGoal,
          learningOutcomes: session.learningOutcomes,
          prerequisiteMap: session.prerequisiteMap,
          stance: session.stance || "directed",
          maxExchanges: session.maxExchanges,
          opensAt: session.opensAt ?? null,
          closesAt: session.closesAt ?? null,
          sessionPurpose: session.sessionPurpose ?? "pre_class",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings.");
      }

      await fetchSession();
      const savedAt = new Date();
      setConfigSavedAt(savedAt);
      setShowSavedState(true);
      setToast({
        tone: "success",
        message: "Settings saved.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSavingConfig(false);
    }
  }

  async function generateSuggestedMap() {
    setGeneratingMap(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/suggest-prerequisite-map`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate prerequisite map.");
      }
      const data = await res.json();
      setSession((prev) =>
        prev
          ? {
              ...prev,
              prerequisiteMap: JSON.stringify(data.map, null, 2),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate prerequisite map.");
    } finally {
      setGeneratingMap(false);
    }
  }

  async function createCheckpoint() {
    if (!newCheckpointPrompt.trim()) {
      setError("Write a question before saving.");
      setShowQuestionSavedState(false);
      return;
    }

    setSavingCheckpoint(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: newCheckpointPrompt,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add outcome.");
      }

      setNewCheckpointPrompt("");
      await fetchCheckpoints();
      setShowQuestionSavedState(true);
      setToast({ tone: "success", message: "Outcome added." });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add outcome.";
      setError(message);
      setShowQuestionSavedState(false);
      setToast({ tone: "error", message });
    } finally {
      setSavingCheckpoint(false);
    }
  }

  async function generateSuggestions() {
    setGeneratingSuggestions(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints/suggest`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate suggestions.");
      }
      setSuggestions(data?.suggestions ?? []);
      if ((data?.suggestions ?? []).length === 0) {
        setToast({
          tone: "error",
          message: "No suggestions were generated. Try adding more source content.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate suggestions.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setGeneratingSuggestions(false);
    }
  }

  async function acceptSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    setAcceptingSuggestionIndex(index);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: suggestion.prompt,
          processLevel: suggestion.processLevel,
          expectations: suggestion.expectations,
          misconceptionSeeds: suggestion.misconceptions,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add outcome.");
      }

      setSuggestions((prev) => prev.filter((_, suggestionIndex) => suggestionIndex !== index));
      await fetchCheckpoints();
      setToast({ tone: "success", message: "Outcome added." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add outcome.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setAcceptingSuggestionIndex(null);
    }
  }

  function dismissSuggestion(index: number) {
    setSuggestions((prev) => prev.filter((_, suggestionIndex) => suggestionIndex !== index));
  }

  function startEditingCheckpoint(checkpoint: CheckpointRecord) {
    setEditingCheckpointId(checkpoint.id);
    setEditingCheckpointPrompt(checkpoint.prompt);
  }

  function cancelEditingCheckpoint() {
    setEditingCheckpointId(null);
    setEditingCheckpointPrompt("");
  }

  async function saveCheckpointEdit(checkpointId: string) {
    if (!editingCheckpointPrompt.trim()) {
      setError("The question can't be empty.");
      return;
    }

    setSavingCheckpoint(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints/${checkpointId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editingCheckpointPrompt,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update outcome.");
      }

      await fetchCheckpoints();
      cancelEditingCheckpoint();
      setToast({ tone: "success", message: "Outcome updated." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update outcome.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSavingCheckpoint(false);
    }
  }

  async function removeCheckpoint(checkpointId: string) {
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/checkpoints`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkpointId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove outcome.");
      }

      await fetchCheckpoints();
      setToast({ tone: "success", message: "Outcome removed." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove outcome.";
      setError(message);
      setToast({ tone: "error", message });
    }
  }

  async function reorderCheckpoints(fromCheckpointId: string, toCheckpointId: string) {
    const currentIndex = checkpoints.findIndex((checkpoint) => checkpoint.id === fromCheckpointId);
    const targetIndex = checkpoints.findIndex((checkpoint) => checkpoint.id === toCheckpointId);

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      currentIndex === targetIndex
    ) {
      return;
    }

    const reordered = [...checkpoints];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setSavingCheckpoint(true);
    setError("");
    try {
      await Promise.all(
        reordered.map((checkpoint, index) =>
          fetch(`/api/sessions/${sessionId}/checkpoints/${checkpoint.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderIndex: index }),
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => null);
              throw new Error(data?.error || "Failed to reorder questions.");
            }
          })
        )
      );

      await fetchCheckpoints();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reorder questions.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSavingCheckpoint(false);
    }
  }

  function startDraggingCheckpoint(checkpointId: string) {
    setDraggedCheckpointId(checkpointId);
    setDragTargetCheckpointId(checkpointId);
  }

  function dragOverCheckpoint(event: React.DragEvent, checkpointId: string) {
    event.preventDefault();
    if (draggedCheckpointId && draggedCheckpointId !== checkpointId) {
      setDragTargetCheckpointId(checkpointId);
    }
  }

  async function dropCheckpoint(checkpointId: string) {
    if (!draggedCheckpointId) return;
    const sourceId = draggedCheckpointId;
    setDraggedCheckpointId(null);
    setDragTargetCheckpointId(null);
    await reorderCheckpoints(sourceId, checkpointId);
  }

  function endDraggingCheckpoint() {
    setDraggedCheckpointId(null);
    setDragTargetCheckpointId(null);
  }

  async function deleteSession() {
    const confirmed = window.confirm(
      `Delete “${session?.name ?? "this session"}” and all of its learner conversations, evidence, and reports? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete the session.");
      }
      router.push("/instructor");
      router.refresh();
    } catch (deleteError) {
      setToast({
        tone: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete the session.",
      });
    }
  }

  const readings = files.filter((f) => f.category === "reading");
  const assessments = files.filter((f) => f.category === "assessment");
  const isActive = readings.length > 0 && Boolean(session?.learningOutcomes?.trim());
  const isReadyToShare = isActive && checkpoints.length > 0 && previewChecked;
  const hasLearningOutcome = Boolean(session?.learningOutcomes?.trim());
  const setupStep: 2 | 3 | 4 | null =
    readings.length === 0
      ? 2
      : (checkpoints.length === 0 || !hasLearningOutcome)
        ? 3
        : learnerCount === 0
          ? 4
          : null;

  if (loading) {
    return <LoadingState variant="page" message="Loading session…" />;
  }

  if (!session) {
    return (
      <main className="minerva-page">
        <div className="minerva-shell">
          <section className="section-rule grid grid-cols-1 md:grid-cols-[156px_minmax(0,1fr)]">
            <div className="hidden border-r border-[var(--rule)] md:block" />
            <div className="px-4 py-16 md:px-8 md:py-20">
              <p className="eyebrow eyebrow-rose">Instructor View</p>
              <h1 className="section-title mt-5">Session not found.</h1>
              <Link href="/instructor" className="mt-6 inline-flex text-[var(--signal)]">
                Create a new session
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="minerva-page">
      <div className="minerva-shell space-y-6 py-8">
        {toast ? (
          <div className="fixed right-5 top-5 z-50 max-w-sm">
            <div
              className={`rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                toast.tone === "success"
                  ? "border-[rgba(17,120,144,0.22)] bg-[rgba(255,255,255,0.94)] text-[var(--charcoal)]"
                  : "border-[rgba(223,47,38,0.28)] bg-[rgba(255,255,255,0.96)] text-[var(--signal)]"
              }`}
            >
              {toast.message}
            </div>
          </div>
        ) : null}

        <WorkspaceHeader
          sessionId={sessionId}
          session={session}
          isActive={isActive}
          setupStep={setupStep}
        />

        <StatusBar
          learnerCount={learnerCount}
          readingsCount={readings.length}
          assessmentsCount={assessments.length}
          checkpointsCount={checkpoints.length}
          purposeLabel={getSessionPurposeOption(session.sessionPurpose).shortLabel}
        />

        <GuidedWorkflowHub
          sessionId={sessionId}
          hasPurpose={hasLearningOutcome}
          hasReadings={readings.length > 0}
          hasEvidenceQuestion={checkpoints.length > 0}
          hasPreviewChecked={previewChecked}
          learnerCount={learnerCount}
        />

        <section className="minerva-card p-6 md:p-8" aria-labelledby="required-setup-heading">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow eyebrow-teal">Required setup</p>
              <h2 id="required-setup-heading" className="mt-3 font-serif text-4xl text-[var(--charcoal)]">
                Create the learner task
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--dim-grey)]">
              These are the only steps required before sharing: purpose, source material, evidence question, and learner preview.
            </p>
          </div>
        </section>

        {error ? (
          <div className="border border-[rgba(223,47,38,0.24)] bg-[rgba(223,47,38,0.08)] px-4 py-3 text-sm text-[var(--signal)]">
            {error}
          </div>
        ) : null}

        {learnerCount > 0 && session ? (
          <SessionInsightsCard
            sessionId={sessionId}
            sessionPurpose={session.sessionPurpose}
            learnerCount={learnerCount}
            liveStatus={liveStatus}
          />
        ) : null}

        <GoalsSection 
          open={showGoals}
          onToggle={() => setShowGoals((v) => !v)}
          session={session}
          setSession={setSession}
          uiState={{ savingConfig, showSavedState, configSavedAt }}
          actions={{ onSaveConfig: saveTeachingContext }}
          formatSavedTime={formatSavedTime}
        />

        <ReadingsSection
          open={showReadings}
          onToggle={() => setShowReadings((value) => !value)}
          readings={readings}
          uiState={{
            dragActive,
            uploadingCategory,
            recentUploadCategory,
            recentUploadName,
          }}
          readingInputRef={readingInputRef}
          handlers={{
            onDrop: handleDrop,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onFileChange: handleFileChange,
            onRemoveFile: handleRemoveFile,
          }}
        />

        <QuestionsSection
          open={showQuestions}
          onToggle={() => setShowQuestions((value) => !value)}
          session={session}
          readingsCount={readings.length}
          checkpoints={checkpoints}
          uiState={{
            loadingCheckpoints,
            savingCheckpoint,
            generatingSuggestions,
            suggestions,
            acceptingSuggestionIndex,
            editingCheckpointId,
            editingCheckpointPrompt,
            draggedCheckpointId,
            dragTargetCheckpointId,
            showQuestionSavedState,
            newCheckpointPrompt,
          }}
          setEditingCheckpointPrompt={setEditingCheckpointPrompt}
          setNewCheckpointPrompt={setNewCheckpointPrompt}
          actions={{
            onGenerateSuggestions: generateSuggestions,
            onAcceptSuggestion: acceptSuggestion,
            onDismissSuggestion: dismissSuggestion,
            onCreateCheckpoint: createCheckpoint,
            onDragStartCheckpoint: startDraggingCheckpoint,
            onDragOverCheckpoint: dragOverCheckpoint,
            onDropCheckpoint: dropCheckpoint,
            onEndDragCheckpoint: endDraggingCheckpoint,
            onStartEditingCheckpoint: startEditingCheckpoint,
            onCancelEditingCheckpoint: cancelEditingCheckpoint,
            onSaveCheckpointEdit: saveCheckpointEdit,
            onRemoveCheckpoint: removeCheckpoint,
          }}
        />

        <section className="minerva-card p-6 md:p-8" aria-labelledby="recommended-prep-heading">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow eyebrow-teal">Recommended, not required</p>
              <h2 id="recommended-prep-heading" className="mt-3 font-serif text-4xl text-[var(--charcoal)]">
                Preview before you share
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--dim-grey)]">
                Check the learner-facing experience, fix any design risks, and prepare a small number of possible teaching moves. You can skip the deeper planning fields when you just need a quick session.
              </p>
            </div>
            <Link href={`/instructor/${sessionId}/planning`} className="minerva-button">
              {previewChecked ? "Preview checked — open again" : "Preview learner experience"}
            </Link>
          </div>
          <p className="mt-5 border-t border-[var(--rule)] pt-4 text-sm text-[var(--dim-grey)]">
            <strong className="text-[var(--charcoal)]">Next:</strong> save the preview, return here, then share the learner link.
          </p>
        </section>

        <TeachingContextSection
          open={showConfig}
          onToggle={() => setShowConfig((value) => !value)}
          session={session}
          setSession={setSession}
          setShowAdvanced={setShowAdvanced}
          readingsCount={readings.length}
          uiState={{
            showAdvanced,
            generatingMap,
            savingConfig,
            showSavedState,
            configSavedAt,
          }}
          actions={{
            onGenerateSuggestedMap: generateSuggestedMap,
            onSaveTeachingContext: saveTeachingContext,
          }}
          recommendedCheckpoints={getRecommendedCheckpoints(session.maxExchanges)}
          formatSavedTime={formatSavedTime}
        />

        <section className="minerva-card p-6 md:p-8" aria-labelledby="source-use-summary-heading">
          <button
            type="button"
            onClick={() => setShowSourceUseDetails((value) => !value)}
            className="flex w-full items-start justify-between gap-4 text-left"
            aria-expanded={showSourceUseDetails}
            aria-controls="source-use-details"
          >
            <div>
              <p className="eyebrow eyebrow-teal">Optional trust check</p>
              <h2 id="source-use-summary-heading" className="mt-3 font-serif text-4xl text-[var(--charcoal)]">
                Source use safeguards
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--dim-grey)]">
                Your readings remain the tutor&apos;s primary reference. Broader explanations, examples, and connections are allowed, but they are distinguished from course-reading claims.
              </p>
            </div>
            <span className="minerva-button minerva-button-secondary shrink-0 text-sm">
              {showSourceUseDetails ? "Hide details" : "Show details"}
            </span>
          </button>
          {showSourceUseDetails ? (
            <div id="source-use-details" className="mt-6 grid gap-5 border-t border-[var(--rule)] pt-6 text-sm md:grid-cols-2">
              <div>
                <p className="eyebrow eyebrow-teal">Source use</p>
                <p className="mt-2 leading-6 text-[var(--dim-grey)]">
                  {readings.length > 0
                    ? "Claims about the reading are passage-checked. AI_thena may add helpful background, analogies, or examples, but it should not present those as if they came from the uploaded course material."
                    : "Upload at least one source material to make it the tutor's primary reference. General background can still be offered, but it will not be presented as course-reading content."}
                </p>
              </div>
              <div>
                <p className="eyebrow eyebrow-rose">Protected assessment files</p>
                <p className="mt-2 leading-6 text-[var(--dim-grey)]">
                  Protected files are excluded from the normal tutor prompt. Answer-extraction attempts receive reasoning coaching and create an instructor audit record.
                </p>
              </div>
              <Link href={`/instructor/${sessionId}/grounding`} className="minerva-button minerva-button-secondary w-max text-sm">
                Open source-use check
              </Link>
            </div>
          ) : null}
        </section>

        <AssessmentsSection
          open={showAssessments}
          onToggle={() => setShowAssessments((value) => !value)}
          assessments={assessments}
          uiState={{
            dragActive,
            uploadingCategory,
            recentUploadCategory,
            recentUploadName,
          }}
          assessmentInputRef={assessmentInputRef}
          handlers={{
            onDrop: handleDrop,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onFileChange: handleFileChange,
            onRemoveFile: handleRemoveFile,
          }}
        />

        <AccessCodeCard
          session={session}
          isActive={isReadyToShare}
          copied={copied}
          hasReadings={readings.length > 0}
          hasEvidenceQuestion={checkpoints.length > 0}
          hasPreviewChecked={previewChecked}
          onCopyLink={copyLink}
        />

        {session.instructorRole === "owner" ? (
          <section className="minerva-card p-6 md:p-8">
            <button
              type="button"
              onClick={() => setShowDangerZone((value) => !value)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={showDangerZone}
              aria-controls="danger-zone"
            >
              <div>
                <p className="eyebrow eyebrow-rose">Advanced data controls</p>
                <h2 className="mt-3 font-serif text-3xl text-[var(--charcoal)]">
                  Session data and deletion
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dim-grey)]">
                  Most instructors do not need this during setup. Open only when you need to remove a test or incorrect session.
                </p>
              </div>
              <span className="text-sm font-semibold text-[var(--signal)]">
                {showDangerZone ? "Hide danger zone" : "Show danger zone"}
              </span>
            </button>
            {showDangerZone ? (
              <div id="danger-zone" className="mt-6 border border-[rgba(223,47,38,0.3)] bg-[rgba(223,47,38,0.04)] p-5">
                <p className="eyebrow eyebrow-rose">Danger zone</p>
                <h3 className="mt-3 text-base font-semibold text-[var(--charcoal)]">
                  Delete this session
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dim-grey)]">
                  Permanently removes the session and its uploaded materials, learner conversations, evidence, reflections, reports, and audit records.
                </p>
                <button
                  type="button"
                  onClick={() => void deleteSession()}
                  className="mt-5 border border-[var(--signal)] px-4 py-2 text-sm font-semibold text-[var(--signal)] hover:bg-[rgba(223,47,38,0.08)]"
                >
                  Delete session and learner data
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

      </div>
    </main>
  );
}
