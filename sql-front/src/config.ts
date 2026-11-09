export const config = {
  api: '/api',
  leaderboard: {
    api: '/leaderboard'
  }
}

export type HttpResponse = {
  success: boolean;
  message: string;
  responseObject: any;
  statusCode: number;
}
