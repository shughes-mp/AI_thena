import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export function getAnthropic() {
  if (!globalForAnthropic.anthropic) {
    globalForAnthropic.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return globalForAnthropic.anthropic;
}
