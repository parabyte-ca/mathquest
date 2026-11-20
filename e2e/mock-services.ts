// Mock Resend + GitHub releases for e2e. The app is pointed at this server through RESEND_API_BASE / RELEASES_URL.
import { createServer } from 'node:http';

const outbox: { to: string[]; subject: string; text: string }[] = [];
const port = Number(process.env.MOCK_PORT ?? 18788);

createServer((req, res) => {
  const json = (code: number, body: unknown) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  if (req.method === 'POST' && req.url === '/emails') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      outbox.push(JSON.parse(raw));
      json(200, { id: 'mock' });
    });
  } else if (req.method === 'GET' && req.url === '/outbox') json(200, outbox);
  else if (req.method === 'DELETE' && req.url === '/outbox') {
    outbox.length = 0;
    json(200, { ok: true });
  } else if (req.method === 'GET' && req.url === '/releases/latest') {
    json(200, { tag_name: 'v99.0.0', body: 'Mock release notes', html_url: 'https://example.invalid/r' });
  } else json(404, {});
}).listen(port, '127.0.0.1', () => console.log(`mock services on ${port}`));
