export async function sendAnalytics(params: object) {
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
