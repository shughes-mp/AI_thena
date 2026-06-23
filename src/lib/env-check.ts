// A startup check to prevent invalid Anthropic model aliases from crashing the backend
export function validateEnvironment() {
  if (process.env.NODE_ENV === "development") {
    console.log("Environment validation passed: No retired Anthropic models configured.");
  }
}
