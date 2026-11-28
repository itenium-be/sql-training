export function pageTitle(pathname: string): string {
  if (pathname.startsWith('/admin')) {
    return 'Admin · SQL Showdown';
  }
  if (pathname.startsWith('/beamer')) {
    return 'Leaderboard · SQL Showdown';
  }
  if (pathname.startsWith('/tutorial')) {
    return 'How it works · SQL Showdown';
  }
  return 'SQL Showdown · DevFest Paris';
}
