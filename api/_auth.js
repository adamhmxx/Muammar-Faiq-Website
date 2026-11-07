// Shared helpers for the admin API: signed session cookie and password check.
const crypto = require('crypto');

const COOKIE = 'adm';
const TTL = 12 * 3600; // session length in seconds

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET is missing or shorter than 32 characters');
  return s;
};
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('base64url');
const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ADMIN_PASSWORD_HASH = scrypt$<salt hex>$<hash hex>   (made by tools/hash-password.js)
exports.checkPassword = (pw) => {
  const [alg, salt, hash] = String(process.env.ADMIN_PASSWORD_HASH || '').split('$');
  if (alg !== 'scrypt' || !salt || !hash || typeof pw !== 'string' || !pw || pw.length > 200) return false;
  const got = crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64).toString('hex');
  return safeEq(got, hash);
};

exports.sessionCookie = () => {
  const exp = Math.floor(Date.now() / 1000) + TTL, v = String(exp);
  return `${COOKIE}=${v}.${sign(v)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`;
};
exports.clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

exports.isAuthed = (req) => {
  const m = /(?:^|;\s*)adm=(\d+)\.([\w-]+)/.exec(req.headers.cookie || '');
  return !!m && safeEq(m[2], sign(m[1])) && +m[1] > Date.now() / 1000;
};
