export async function sendAnalytics(params: object) {
  try {
    const body = {
      ...params,
      https: true,
      time: +new Date(),
      id: crypto.randomUUID(),
      hostname: 'e.gluhotorenko.com',
    };
    console.log('body', body);
    const response = await fetch('https://queue.simpleanalyticscdn.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
