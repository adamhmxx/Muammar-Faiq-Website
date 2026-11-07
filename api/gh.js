// Authenticated proxy to the GitHub contents API for this one repository.
// The GitHub token lives only in this function's environment; the browser never sees it.
const { isAuthed } = require('./_auth');

const REPO = process.env.GITHUB_REPO || 'adamhmxx/muammar-faiq-website';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const WRITABLE = /^(content\.json|index\.html|assets\/[\w.\-]+)$/;   // the only files the CMS may touch

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAuthed(req)) return res.status(401).json({ message: 'Not signed in' });
  const m = req.method;
  if (!['GET', 'PUT', 'DELETE'].includes(m)) return res.status(405).json({ message: 'Method not allowed' });
  if (m !== 'GET' && req.headers['x-admin'] !== '1') return res.status(403).json({ message: 'Missing header' });   // CSRF guard on top of SameSite=Strict

  const p = String((req.query || {}).p || '');   // e.g. contents/assets/work-1.mp4
  const mm = /^contents\/(.+)$/.exec(p);
  const file = mm && decodeURIComponent(mm[1]);
  if (!file || file.includes('..') || !WRITABLE.test(file)) return res.status(400).json({ message: 'Path not allowed' });

  const url = `https://api.github.com/repos/${REPO}/contents/${file.split('/').map(encodeURIComponent).join('/')}`;
  const opt = { method: m, headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-cms' } };
  let target = url + '?ref=' + encodeURIComponent(BRANCH);
  if (m !== 'GET') {
    const b = req.body && typeof req.body === 'object' ? { ...req.body } : null;
    if (!b) return res.status(400).json({ message: 'JSON body required' });
    b.branch = BRANCH;   // always the production branch, whatever the browser asked for
    opt.headers['Content-Type'] = 'application/json';
    opt.body = JSON.stringify(b);
    target = url;
  }
  try {
    const r = await fetch(target, opt), text = await r.text();
    res.status(r.status).setHeader('Content-Type', 'application/json').send(text || '{}');
  } catch (e) {
    res.status(502).json({ message: 'GitHub unreachable: ' + e.message });
  }
};
