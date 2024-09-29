import { waitUntil } from '@vercel/functions';
import { sendAnalytics } from '../server/sendAnalytics';

export async function GET(request: Request) {
  const urlParams = new URLSearchParams(new URL(request.url).search);
  const params = {
    e: 'uninstall',
    uid: urlParams.get('uid') ?? undefined,
  } as const;
  waitUntil(sendAnalytics(params));
  return Response.redirect('https://app.whirr.co/p/clzpavjjl01iior0hza2y7zk5');
}

export const config = {
  runtime: 'edge',
};
