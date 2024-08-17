const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = `G-10D0GXBJNL`;
const API_SECRET = `6QIwdPp2RU-lNboK2AFhTg`;

function translated(from: string, to: string, host: string) {
  fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      events: [
        {
          name: 'translated',
          params: { from, to, host },
        },
      ],
    }),
  });
}
