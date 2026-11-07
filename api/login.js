const { checkPassword, sessionCookie } = require('./_auth');

// Failed attempts are slowed down and counted per IP (per warm instance: a speed bump, not a hard lock).
const fails = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const f = fails.get(ip) || { n: 0, t: 0 };
  if (Date.now() - f.t > 15 * 60e3) f.n = 0;
  if (f.n >= 8) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  let ok = false;
  try { ok = checkPassword((req.body || {}).password); }
  catch (e) { return res.status(500).json({ error: 'Server is not configured: ' + e.message }); }
  if (!ok) {
    fails.set(ip, { n: f.n + 1, t: Date.now() });
    await sleep(700);
    return res.status(401).json({ error: 'Wrong password.' });
  }
  fails.delete(ip);
  res.setHeader('Set-Cookie', sessionCookie());
  res.status(200).json({ ok: true });
};
