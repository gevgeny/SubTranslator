const text = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Simple Analytics</title>
    <script  async defer data-hostname="e.gluhotorenko.com" src="https://scripts.simpleanalyticscdn.com/latest.dev.js"></script>
    <script async src="https://scripts.simpleanalyticscdn.com/auto-events.js"></script>
    <script>
      const session_id = crypto.randomUUID();
      const page_id = crypto.randomUUID();
      
      function post() {
        fetch('https://sub-translator.vercel.app/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pageview',
            event: 'pageview',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ua: navigator.userAgent,
            language: navigator.language,
            session_id,
            page_id,
            path: 'foo/bar/baz',
          }),
        });
      }
      
      function myClick() {
        fetch('https://sub-translator.vercel.app/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'event',
            event: 'my-click',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ua: navigator.userAgent,
            language: navigator.language,
            meta: { hi: 'there' },
            session_id,
            page_id,
            path: '/foo/bar/baz',
          }),
        });
      }
    </script>
  </head>
  </html>

  <body>
    <button onclick="post()">post</button>.
    <button onclick="myClick()">click</button>.
  </body>
`;

export function GET() {
  return new Response(text, { headers: { 'content-type': 'text/html' } });
}

export const config = {
  runtime: 'edge',
};
