const adminTabs = ['overview', 'players', 'exercises'] as const;
export type AdminTab = typeof adminTabs[number];

export function tabFromSearch(search: string): AdminTab {
  const tab = new URLSearchParams(search).get('tab');
  return adminTabs.find(t => t === tab) ?? 'overview';
}

export function searchForTab(tab: AdminTab): string {
  return `?tab=${tab}`;
}

export function gameFromSearch(search: string): string {
  return new URLSearchParams(search).get('game') ?? 'all';
}

export function searchWith(search: string, key: string, value: string): string {
  const params = new URLSearchParams(search);
  if (value === 'all') params.delete(key);
  else params.set(key, value);
  const s = params.toString();
  return s ? `?${s}` : '';
}
