const key = (game: string, exerciseId: number) => `sqlDraft:${game}:${exerciseId}`;

export function loadDraft(storage: Storage, game: string, exerciseId: number): string {
  return storage.getItem(key(game, exerciseId)) ?? '';
}

export function saveDraft(storage: Storage, game: string, exerciseId: number, sql: string) {
  if (sql) {
    storage.setItem(key(game, exerciseId), sql);
  } else {
    storage.removeItem(key(game, exerciseId));
  }
}
