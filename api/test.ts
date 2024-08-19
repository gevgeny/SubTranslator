const text = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Simple Analytics</title>
    <script  async defer data-hostname="e.gluhotorenko.com" src="https://scripts.simpleanalyticscdn.com/latest.dev.js"></script>
    <script async src="https://scripts.simpleanalyticscdn.com/auto-events.js"></script>
    <script>
      function post() {
        fetch('https://sub-translator.vercel.app/api/analytics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pageview',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ua: navigator.userAgent,
            language: navigator.language,
            meta: { hi: 'there' },
            session_id: crypto.randomUUID(),
            page_id: crypto.randomUUID(),
            path: 'foo/bar/baz',
          }),
        });
      }
    </script>
  </head>
  </html>

  <body>
    <button onclick="post()">Click me</button>.
  </body>
`;

export function GET() {
  return new Response(text, { headers: { 'content-type': 'text/html' } });
}

export const config = {
  runtime: 'edge',
};
