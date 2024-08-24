import { waitUntil } from '@vercel/functions';
import { sendAnalytics } from '../server/sendAnalytics';

export async function GET(request: Request) {
  const urlParams = new URLSearchParams(new URL(request.url).search);
  const params = {
    type: 'event',
    event: 'uninstall',
    page_id: 'uninstall',
    path: '/uninstall',
    language: urlParams.get('l'),
    ua: urlParams.get('ua'),
    timezone: urlParams.get('tz'),
    brands: urlParams.get('brands'),
    os_name: urlParams.get('os'),
    meta: {
      version: urlParams.get('v'),
    },
  };
  waitUntil(sendAnalytics(params));
  return Response.redirect('https://app.whirr.co/p/clzpavjjl01iior0hza2y7zk5');
}

export const config = {
  runtime: 'edge',
};
