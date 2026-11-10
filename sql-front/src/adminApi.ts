import { config } from './config';

export async function adminFetch(apiKey: string, path: string, body?: object) {
  const res = await fetch(`${config.api}/game/admin${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? res.statusText);
  }
  return data;
}
