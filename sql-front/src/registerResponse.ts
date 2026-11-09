export type RegisterOutcome =
  | { registered: true; name: string; token: string; message: string }
  | { registered: false; message: string };

export function interpretRegister(status: number, body: string, typedName: string): RegisterOutcome {
  let data: { message?: string; name?: string; token?: string };
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    data = {};
  }

  if (status === 200 && data.token) {
    return {
      registered: true,
      name: data.name ?? typedName.trim(),
      token: data.token,
      message: data.message ?? '',
    };
  }

  return {
    registered: false,
    message: data.message ?? `Couldn't register — the game server returned ${status}. Try again.`,
  };
}
