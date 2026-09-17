export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[<>]/g, "").trim().slice(0, maxLength)
    : "";
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export function isParticipantToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{20,96}$/.test(value);
}
