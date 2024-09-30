export const config = {
  api: 'http://localhost:8080',
  leaderboard: {
    api: 'http://localhost:8000'
  }
}

export type HttpResponse = {
  success: boolean;
  message: string;
  responseObject: any;
  statusCode: number;
}
