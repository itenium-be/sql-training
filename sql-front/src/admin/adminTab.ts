export const adminTabs = ['overview', 'players', 'exercises'] as const;
export type AdminTab = typeof adminTabs[number];

export function tabFromSearch(search: string): AdminTab {
  const tab = new URLSearchParams(search).get('tab');
  return adminTabs.find(t => t === tab) ?? 'overview';
}

export function searchForTab(tab: AdminTab): string {
  return `?tab=${tab}`;
}
