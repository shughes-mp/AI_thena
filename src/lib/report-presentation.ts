const INTERNAL_SESSION_ID = /\s*\((?:session id:\s*)?c[a-z0-9]{20,31}\)/gi;
const STANDALONE_SESSION_ID = /\bsession id:\s*c[a-z0-9]{20,31}\b/gi;

const OMITTED_EXPORT_SECTIONS = new Set([
  "HOW TO READ THIS BRIEF",
  "READINESS EVIDENCE MAP",
  "ACTIVATION EVIDENCE MAP",
  "CONSOLIDATION EVIDENCE MAP",
  "TRANSFER EVIDENCE MAP",
  "LEARNING OUTCOME EVIDENCE",
  "INSTRUCTOR REVIEW STATUS",
  "AI AND FORMATIVE-USE DISCLAIMER",
]);

const REPORT_SECTIONS = new Set([
  "SESSION SNAPSHOT",
  "HOW TO READ THIS BRIEF",
  "SUGGESTED TEACHING MOVES",
  "READINESS EVIDENCE MAP",
  "ACTIVATION EVIDENCE MAP",
  "CONSOLIDATION EVIDENCE MAP",
  "TRANSFER EVIDENCE MAP",
  "WHAT THE EVIDENCE SUGGESTS STUDENTS CAN BUILD ON",
  "WHERE THE EVIDENCE SUGGESTS FOLLOW-UP",
  "WHAT YOUR STUDENTS RECALLED WELL",
  "WHERE RETRIEVAL WAS WEAK",
  "WHAT YOUR STUDENTS CONSOLIDATED",
  "WHAT REMAINS FRAGILE",
  "WHERE YOUR STUDENTS SHOWED DEPTH",
  "WHERE TRANSFER BROKE DOWN",
  "PER-STUDENT NOTES",
  "LEARNING OUTCOME EVIDENCE",
  "INSTRUCTOR REVIEW STATUS",
  "AI AND FORMATIVE-USE DISCLAIMER",
]);

function normalizedHeading(line: string) {
  return line.replace(/^#{1,6}\s*/, "").trim().toUpperCase();
}

export function redactInternalIdentifiers(value: string) {
  return value
    .replace(INTERNAL_SESSION_ID, "")
    .replace(STANDALONE_SESSION_ID, "")
    .replace(/[ \t]+\n/g, "\n");
}

export function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/\x60([^\x60]+)\x60/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

export function prepareNarrativeForExport(value: string) {
  const lines = redactInternalIdentifiers(value).split(/\r?\n/);
  const output: string[] = [];
  let include = false;

  for (const line of lines) {
    const heading = normalizedHeading(line);
    if (REPORT_SECTIONS.has(heading)) {
      include = !OMITTED_EXPORT_SECTIONS.has(heading);
      if (include) output.push(line);
      continue;
    }
    if (include) output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function uniqueNormalizedStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
