export function parseDisqualify(body: any): { name: string; disqualified: boolean } | { error: string } {
  if (typeof body?.name !== "string" || !body.name || typeof body.disqualified !== "boolean") {
    return { error: "name and disqualified (boolean) are required" };
  }
  return { name: body.name, disqualified: body.disqualified };
}
