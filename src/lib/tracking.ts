/**
 * Analytics tracking helper
 * TODO: Connect to analytics provider (Mixpanel, Segment, Plausible, etc.)
 */
export function track(event: string, properties?: Record<string, unknown>) {
  // TODO: Connect to analytics provider (Mixpanel, Segment, etc.)
  if (import.meta.env.DEV) {
    console.log("[track]", event, properties);
  }
}
