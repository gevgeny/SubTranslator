import { waitUntil } from '@vercel/functions';
import { sendAnalytics } from '../server/sendAnalytics';

export async function GET(request: Request) {
  const urlParams = new URLSearchParams(new URL(request.url).search);
  const params = {
    type: 'event',
    event: 'uninstall',
    page_id: 'uninstall',
    path: '/uninstall',
    uid: urlParams.get('uid') ?? undefined,
    language: urlParams.get('l') ?? undefined,
    ua: urlParams.get('ua') ?? undefined,
    timezone: urlParams.get('tz') ?? undefined,
    brands: urlParams.get('brands') ?? undefined,
    os_name: urlParams.get('os') ?? undefined,
    os_version: urlParams.get('osv') ?? undefined,
    b: urlParams.get('b') ?? undefined,
    bv: urlParams.get('bv') ?? undefined,
    meta: {
      version: urlParams.get('v'),
    },
  } as const;
  waitUntil(sendAnalytics(params));
  return Response.redirect('https://app.whirr.co/p/clzpavjjl01iior0hza2y7zk5');
}

export const config = {
  runtime: 'edge',
};
