const text = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Simple Analytics</title>
    <script async defer data-hostname="e.gluhotorenko.com" src="https://scripts.simpleanalyticscdn.com/latest.dev.js"></script>
    <script async src="https://scripts.simpleanalyticscdn.com/auto-events.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/manuelmhtr/countries-and-timezones@latest/dist/index.js" type="text/javascript"></script>
    <script>
      const session_id = crypto.randomUUID();
      const page_id = crypto.randomUUID();
      
      function post() {
        fetch('http://localhost:3000/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "e":"test","tz":"Europe/Amsterdam","l":"en-US","sid":"2d097167-ea9d-4ee4-a7be-4a11f5c783d4","site":"www.netflix.com","osn":"macOS","osv":"14.5.0","b":"Chrome","bv":"128","uid":"63e92c49-f7ab-4650-8309-0d81fa2c9db8","meta":{"sourceLang":"en","targetLang":"es","isHidden":false}
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
