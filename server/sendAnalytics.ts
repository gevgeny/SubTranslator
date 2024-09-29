import { sql } from '@vercel/postgres';
import ct from 'countries-and-timezones';

interface AnalyticData {
  e: 'popup' | 'install' | 'uninstall';
  tz?: string;
  l?: string;
  sid?: string;
  uid?: string;
  s?: string;
  osn?: string;
  osv?: string;
  b?: string;
  bv?: string;
  meta?: Record<string, string | null>;
}

export async function sendAnalytics(params: AnalyticData) {
  const meta = Object.entries(params.meta ?? {})
    .map(([key, value]) => `${key} => ${value}`)
    .join(', ');

  const country = ct.getCountryForTimezone(params.tz ?? '');

  try {
    await sql`
      INSERT INTO analytic_events (
        event_name, 
        timezone, 
        language, 
        session_id, 
        user_id, 
        path, 
        os_name, 
        os_version, 
        browser_name, 
        browser_version, 
        country, 
        meta
      )
      VALUES (
        ${params.e}, 
        ${params.tz ?? ''}, 
        ${params.l ?? ''}, 
        ${params.sid ?? ''}, 
        ${params.uid ?? ''},  
        ${params.s ?? ''},  
        ${params.osn ?? ''},  
        ${params.osv ?? ''},  
        ${params.b ?? ''},  
        ${params.bv ?? ''},  
        ${country?.id ?? ''},
        ${meta}
      );
    `;
    return new Response('Ok', { status: 200 });
  } catch (error) {
    console.error('Failed to insert analytic event:', error);
    return new Response('Error', { status: 500 });
  }
}
