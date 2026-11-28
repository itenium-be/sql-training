import { FakeApi } from './fakeApi';

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() { return items.size; },
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    key: index => [...items.keys()][index] ?? null,
    removeItem: key => { items.delete(key); },
    setItem: (key, value) => { items.set(key, value); },
  };
}

/**
 * Points this page's fetch and localStorage away from the real ones, for good: a tour must never
 * start a real timer, spend a real point or overwrite a real draft. Returns the real localStorage.
 */
export function installSandbox(api: () => FakeApi): Storage {
  const realStorage = window.localStorage;
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!new URL(url, location.href).pathname.startsWith('/api/')) {
      return realFetch(input, init);
    }
    const { status, body } = api()(url, init);
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true });

  return realStorage;
}
