export const config = {
  api: 'http://localhost:8080',
  leaderboard: {
    api: 'http://pongit.synology.me:4001' // TODO: put my local IP here!
  }
}

export type HttpResponse = {
  success: boolean;
  message: string;
  responseObject: any;
  statusCode: number;
}
