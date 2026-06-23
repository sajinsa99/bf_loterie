import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ownerToken = null;

const app = express(); // nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
const PORT = process.env.PORT || 6000;
const PYTHON = process.env.PYTHON || 'python3';
const ANALYSE_PY = path.join(__dirname, '..', 'analyse.py');
const HISTORY_FILE = process.env.HISTORY_FILE || path.join(__dirname, 'history.json');
const MAX_HISTORY = 50;

// Load .env from same directory (simple parser, no extra dependency)
function loadDotEnv() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    raw.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    });
  } catch { /* .env absent → rely on real env vars */ }
}
loadDotEnv();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
}));

// Auth endpoint — password never leaves the server
app.post('/api/auth', (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.OWNER_PASSWORD;
  if (!expected) return res.status(500).json({ error: 'OWNER_PASSWORD not configured' });
  if (typeof password === 'string' && password === expected) {
    ownerToken = crypto.randomBytes(32).toString('hex');
    return res.json({ ok: true, token: ownerToken });
  }
  res.status(401).json({ ok: false });
});

function requireOwner(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!ownerToken || token !== ownerToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function runAnalyse(args, res) {
  execFile(PYTHON, [ANALYSE_PY, ...args], { timeout: 60000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('[analyse.py error]', stderr || err.message);
      return res.status(500).json({ error: 'analyse.py failed', detail: stderr || err.message });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error('[parse error]', e.message, stdout.slice(0, 200));
      res.status(500).json({ error: 'Invalid JSON from analyse.py' });
    }
  });
}

function parseTopArg(query)  { const v = parseInt(query.top, 10);   return Number.isInteger(v) && v > 0  ? String(v) : '10'; }
function parsePowerArg(query){ const v = parseFloat(query.power);   return Number.isFinite(v) && v > 0  ? String(v) : '1.0'; }
function parseCountArg(query){ const v = parseInt(query.count, 10); return Number.isInteger(v) && v >= 1 && v <= 50 ? String(v) : '1'; }

// Full analysis: top-N numbers + pairs + draws
app.get('/api/analyse', (req, res) => {
  runAnalyse(['--json', '--top', parseTopArg(req.query), '--power', parsePowerArg(req.query), '--count', parseCountArg(req.query)], res);
});

// Fast draw only — uses disk cache, skips CSV re-parse
app.get('/api/draw', (req, res) => {
  runAnalyse(['--json', '--draw-only', '--top', parseTopArg(req.query), '--power', parsePowerArg(req.query), '--count', parseCountArg(req.query)], res);
});

// History
function readHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return []; }
}

function writeHistory(entries) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

app.get('/api/history', (req, res) => {
  res.json(readHistory());
});

app.post('/api/history', requireOwner, (req, res) => {
  const entry = req.body;
  if (!entry || typeof entry !== 'object' || !entry.id) {
    return res.status(400).json({ error: 'Invalid entry' });
  }
  const entries = readHistory();
  entries.unshift(entry);
  if (entries.length > MAX_HISTORY) entries.length = MAX_HISTORY;
  writeHistory(entries);
  res.json({ ok: true });
});

app.delete('/api/history/:id', requireOwner, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entries = readHistory().filter(e => e.id !== id);
  writeHistory(entries);
  res.json({ ok: true });
});

app.patch('/api/history/:id', requireOwner, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entries = readHistory();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const ALLOWED = ['draws', 'gain', 'cost', 'hit_fixed', 'hit_random', 'hits_loto', 'hits_euromillions', 'hits_stars'];
  const patch = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k]) => ALLOWED.includes(k))
  );
  entries[idx] = { ...entries[idx], ...patch };
  writeHistory(entries);
  res.json({ ok: true });
});

app.delete('/api/history', requireOwner, (req, res) => {
  const jeu = req.query.jeu;
  if (jeu) {
    writeHistory(readHistory().filter(e => e.jeu !== jeu));
  } else {
    writeHistory([]);
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`bf_loterie_web running on port ${PORT}`);
});
