export const config = {
  api: 'http://localhost:8080',
  leaderboard: {
    api: 'http://192.168.3.93:8000' // TODO: put my local IP here!
  }
}

export type HttpResponse = {
  success: boolean;
  message: string;
  responseObject: any;
  statusCode: number;
}
