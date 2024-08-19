export async function POST(request: Request) {
  const params = await request.json();
  console.log('params', params);
  try {
    const response = await fetch('https://queue.simpleanalyticscdn.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        hostname: 'e.gluhotorenko.com',
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send event. Status: ${response.status}, text: ${await response.text()}`,
      );
    }
    return response;
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
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
