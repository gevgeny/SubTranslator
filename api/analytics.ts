import { sendAnalytics } from '../server/sendAnalytics';

export async function POST(request: Request) {
  const params = await request.json();
  console.log('analytics params:', params);
  return sendAnalytics(params);
}

const allowedOrigins = [
  'chrome-extension://fbkdpdfffgmkfblnonpdhhpoaglpmcpg',
  'http://localhost:3000',
];

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('Origin') ?? '';
  console.log('origin', origin);
  return new Response('', {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
    },
  });
}

export const config = {
  runtime: 'edge',
};
