export const config = {
  api: '/api',
  leaderboard: {
    api: '/leaderboard'
  }
}

export const TOKEN_STORAGE = 'token';

export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
      Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE) ?? ''}`,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_STORAGE);
    localStorage.removeItem('userName');
    window.location.reload();
  }
  return res;
}
