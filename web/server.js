'use strict';

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 6000;
const PYTHON = process.env.PYTHON || 'python3';
const ANALYSE_PY = path.join(__dirname, '..', 'analyse.py');
const HISTORY_FILE = process.env.HISTORY_FILE || path.join(__dirname, 'history.json');
const MAX_HISTORY = 50;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
}));

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

app.post('/api/history', (req, res) => {
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

app.delete('/api/history/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entries = readHistory().filter(e => e.id !== id);
  writeHistory(entries);
  res.json({ ok: true });
});

app.patch('/api/history/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entries = readHistory();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  entries[idx] = { ...entries[idx], ...req.body };
  writeHistory(entries);
  res.json({ ok: true });
});

app.delete('/api/history', (req, res) => {
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
