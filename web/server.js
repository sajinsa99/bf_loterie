'use strict';

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');

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

// Full analysis: top-N numbers + draws
app.get('/api/analyse', (req, res) => {
  const top = parseInt(req.query.top, 10);
  const topArg = Number.isInteger(top) && top > 0 ? String(top) : '10';
  const power = parseFloat(req.query.power);
  const powerArg = Number.isFinite(power) && power > 0 ? String(power) : '1.0';
  runAnalyse(['--json', '--top', topArg, '--power', powerArg], res);
});

// New draw only (random re-seed, skip heavy CSV parsing)
app.get('/api/draw', (req, res) => {
  const top = parseInt(req.query.top, 10);
  const topArg = Number.isInteger(top) && top > 0 ? String(top) : '10';
  const power = parseFloat(req.query.power);
  const powerArg = Number.isFinite(power) && power > 0 ? String(power) : '1.0';
  runAnalyse(['--json', '--draw-only', '--top', topArg, '--power', powerArg], res);
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
  const ALLOWED = ['draws', 'gain', 'hits_loto', 'hits_euromillions', 'hits_stars'];
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
