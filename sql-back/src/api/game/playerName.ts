export const MAX_NAME_LENGTH = 20;

export function validateName(raw: unknown): { name: string } | { error: string } {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) {
    return { error: "Name is required" };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is too long (max ${MAX_NAME_LENGTH} characters)` };
  }
  return { name };
}
