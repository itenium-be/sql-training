const TUTORIAL_SEEN = 'tutorialSeen';

export function shouldAutoStart(storage: Storage, registered: boolean): boolean {
  return registered && !storage.getItem(TUTORIAL_SEEN);
}

export function markTutorialSeen(storage: Storage) {
  storage.setItem(TUTORIAL_SEEN, '1');
}
