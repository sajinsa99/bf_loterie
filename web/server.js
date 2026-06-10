'use strict';

const { execFile } = require('child_process');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 6000;
const PYTHON = process.env.PYTHON || 'python3';
const ANALYSE_PY = path.join(__dirname, '..', 'analyse.py');

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

app.listen(PORT, () => {
  console.log(`bf_loterie_web running on port ${PORT}`);
});
