import { sql } from '@vercel/postgres';

interface AnalyticData {
  event: 'popup' | 'install' | 'uninstall';
  timezone?: string;
  language?: string;
  session_id?: string;
  uid?: string;
  path?: string;
  os_name?: string;
  os_version?: string;
  b?: string;
  bv?: string;
  meta?: Record<string, string | null>;
}

export async function sendAnalytics(params: AnalyticData) {
  const meta = Object.entries(params.meta ?? {})
    .map(([key, value]) => `${key} => ${value}`)
    .join(', ');

  try {
    await sql`
      INSERT INTO analytic_events (event_name, timezone, language, session_id, user_id, path, os_name, os_version, browser_name, browser_version, meta)
      VALUES (
        ${params.event}, 
        ${params.timezone ?? ''}, 
        ${params.language ?? ''}, 
        ${params.session_id ?? ''}, 
        ${params.uid ?? ''},  
        ${params.path ?? ''},  
        ${params.os_name ?? ''},  
        ${params.os_version ?? ''},  
        ${params.b ?? ''},  
        ${params.bv ?? ''},  
        ${meta}
      );
    `;
  } catch (error) {
    console.error('Failed to insert analytic event:', error);
  }

  try {
    const body = {
      ...params,
      https: true,
      time: +new Date(),
      id: crypto.randomUUID(),
      hostname: 'e.gluhotorenko.com',
    };
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
