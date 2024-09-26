const text = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Simple Analytics</title>
    <script async defer data-hostname="e.gluhotorenko.com" src="https://scripts.simpleanalyticscdn.com/latest.dev.js"></script>
    <script async src="https://scripts.simpleanalyticscdn.com/auto-events.js"></script>
    <script>
      const session_id = crypto.randomUUID();
      const page_id = crypto.randomUUID();
      
      function post() {
        fetch('http://localhost:3000/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'test',
            event: 'test',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ua: navigator.userAgent,
            language: navigator.language,
            session_id,
            page_id,
            path: 'foo/bar/baz',
            b: 'browser.name',
            bv: 'browser.major',
            uid: 'uid',
            os_name: 'os_name',
            os_version: 'os_version',
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
    <button onclick="post()">local</button>.
    <button onclick="myClick()">server</button>.
  </body>
`;

export function GET() {
  return new Response(text, { headers: { 'content-type': 'text/html' } });
}

export const config = {
  runtime: 'edge',
};
