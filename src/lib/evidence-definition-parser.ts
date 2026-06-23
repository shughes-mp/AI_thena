export interface ParsedLearningOutcome {
  orderIndex: number;
  label: string;
  normalizedKey: string;
}

export function normalizeDefinitionKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function parseLearningOutcomes(raw: string | null | undefined) {
  const seen = new Set<string>();
  const outcomes: ParsedLearningOutcome[] = [];

  for (const line of raw?.split(/\r?\n/) ?? []) {
    const label = line
      .trim()
      .replace(/^[-*•]\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .trim();
    const normalizedKey = normalizeDefinitionKey(label);
    if (!normalizedKey || seen.has(normalizedKey)) continue;
    seen.add(normalizedKey);
    outcomes.push({
      orderIndex: outcomes.length,
      label: label.slice(0, 1000),
      normalizedKey: normalizedKey.slice(0, 1000),
    });
  }

  return outcomes;
}
