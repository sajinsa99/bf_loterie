'use strict';

const topInput = document.getElementById('top-input');
const powerInput = document.getElementById('power-input');
const btnRefresh = document.getElementById('btn-refresh');
const btnDraw = document.getElementById('btn-draw');
const statusEl = document.getElementById('status');
const historyLists = {
  loto: document.getElementById('history-list-loto'),
  euromillions: document.getElementById('history-list-euromillions'),
};
const historyPanels = {
  loto: document.getElementById('history-loto'),
  euromillions: document.getElementById('history-euromillions'),
};

// Current draws per game, used by the "Jouer" buttons
const currentDraws = { loto: null, euromillions: null };

function setStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function clearStatus() {
  statusEl.className = 'status hidden';
}

function setLoading(on) {
  btnRefresh.disabled = on;
  btnDraw.disabled = on;
}

function topValue() {
  const v = parseInt(topInput.value, 10);
  return Number.isInteger(v) && v > 0 ? v : 10;
}

function powerValue() {
  const v = parseFloat(powerInput.value);
  return Number.isFinite(v) && v > 0 ? v : 1.0;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// --- History ---

function formatBalls(d, gameFormat) {
  const parts = d.boules.map(n => pad(n)).join(' – ');
  if (gameFormat === '5boules+chance' && d.chance != null) {
    return `${parts} ✦ ${pad(d.chance)}`;
  } else if (d.etoiles && d.etoiles.length) {
    return `${parts} ★ ${d.etoiles.map(n => pad(n)).join(' – ')}`;
  }
  return parts;
}

async function loadHistory() {
  try {
    const res = await fetch('api/history');
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function addToHistory(jeu, draws, gameFormat) {
  const raw = new Date().toLocaleString('fr-FR', {
    weekday: 'long', day: '2-digit', month: '2-digit',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const entry = {
    id: Date.now(),
    date: raw.charAt(0).toUpperCase() + raw.slice(1),
    jeu,
    gameFormat,
    draws: {
      fixed: draws.fixed || null,
      random: draws.random || null,
    },
    // legacy text for fallback display
    text: formatBalls(draws.random || draws.fixed, gameFormat),
  };
  await fetch('api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  await renderHistory();
}

async function deleteHistoryEntry(id) {
  await fetch(`api/history/${id}`, { method: 'DELETE' });
  await renderHistory();
}

function parseBallsText(text, gameFormat) {
  if (!text) return null;
  try {
    if (gameFormat === '5boules+chance') {
      const [boulePart, chancePart] = text.split('✦');
      const boules = boulePart.trim().split('–').map(s => parseInt(s.trim(), 10));
      const chance = chancePart ? parseInt(chancePart.trim(), 10) : null;
      return { boules, chance };
    } else {
      const [boulePart, etoilesPart] = text.split('★');
      const boules = boulePart.trim().split('–').map(s => parseInt(s.trim(), 10));
      const etoiles = etoilesPart ? etoilesPart.trim().split('–').map(s => parseInt(s.trim(), 10)) : [];
      return { boules, etoiles };
    }
  } catch { return null; }
}

async function updateHistoryEntry(id, patch) {
  await fetch(`api/history/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

const HISTORY_PAGE = 10;
const historyExpanded = { loto: false, euromillions: false };

async function renderHistory() {
  const entries = await loadHistory();

  for (const jeu of ['loto', 'euromillions']) {
    const list = historyLists[jeu];
    const panel = historyPanels[jeu];
    const jeuEntries = entries.filter(e => e.jeu === jeu);

    list.innerHTML = '';
    panel.classList.toggle('hidden', jeuEntries.length === 0);
    if (jeuEntries.length === 0) continue;

    const expanded = historyExpanded[jeu];
    const visible = expanded ? jeuEntries : jeuEntries.slice(0, HISTORY_PAGE);

    for (const entry of visible) {
      const row = document.createElement('div');
      row.className = 'history-row';

      // Date + delete
      const topLine = document.createElement('div');
      topLine.className = 'history-top-line';

      const meta = document.createElement('span');
      meta.className = 'history-meta';
      meta.textContent = entry.date;

      const del = document.createElement('button');
      del.className = 'btn-delete';
      del.title = 'Supprimer';
      del.textContent = '×';
      del.addEventListener('click', () => deleteHistoryEntry(entry.id));

      topLine.appendChild(meta);
      topLine.appendChild(del);
      row.appendChild(topLine);

      // Upgrade legacy entries: single draw → draws object
      if (!entry.draws && entry.draw) {
        entry.draws = { fixed: null, random: entry.draw };
        updateHistoryEntry(entry.id, { draws: entry.draws });
      }
      if (!entry.draws && entry.text) {
        const parsed = parseBallsText(entry.text, entry.gameFormat);
        if (parsed) {
          entry.draws = { fixed: null, random: parsed };
          updateHistoryEntry(entry.id, { draws: entry.draws });
        }
      }

      if (entry.draws && (entry.draws.fixed || entry.draws.random)) {
        const drawDefs = [
          { key: 'fixed',  label: 'Fixe',      hitKey: 'hit_fixed' },
          { key: 'random', label: 'Aléatoire',  hitKey: 'hit_random' },
        ];
        for (const { key, label, hitKey } of drawDefs) {
          const d = entry.draws[key];
          if (!d) continue;

          const drawBlock = document.createElement('div');
          drawBlock.className = 'history-draw-block';

          const drawLabel = document.createElement('span');
          drawLabel.className = 'history-draw-label';
          drawLabel.textContent = label;
          drawBlock.appendChild(drawLabel);

          const ballsLine = document.createElement('div');
          ballsLine.className = 'history-balls-row';
          const hit = new Set(entry[hitKey] || []);

          const allBalls = [];
          d.boules.forEach(n => allBalls.push({ n, type: 'main' }));
          if (d.chance != null) allBalls.push({ n: d.chance, type: 'chance' });
          if (d.etoiles) d.etoiles.forEach(n => allBalls.push({ n, type: 'star' }));

          allBalls.forEach(({ n, type }) => {
            const b = document.createElement('button');
            b.className = `ball-hist ball-hist-${type}${hit.has(n) ? ' ball-hist-hit' : ''}`;
            b.textContent = pad(n);
            b.addEventListener('click', async () => {
              const newHit = new Set(entry[hitKey] || []);
              if (newHit.has(n)) newHit.delete(n); else newHit.add(n);
              entry[hitKey] = [...newHit];
              await updateHistoryEntry(entry.id, { [hitKey]: entry[hitKey] });
              b.classList.toggle('ball-hist-hit', newHit.has(n));
            });
            ballsLine.appendChild(b);
          });

          drawBlock.appendChild(ballsLine);
          row.appendChild(drawBlock);
        }
      } else {
        // fallback: plain text (old entries without draw data)
        const balls = document.createElement('span');
        balls.className = 'history-balls';
        balls.textContent = entry.text;
        row.appendChild(balls);
      }

      // Gain
      const gainLine = document.createElement('div');
      gainLine.className = 'history-gain-line';

      const gainLabel = document.createElement('label');
      gainLabel.className = 'history-gain-label';
      gainLabel.textContent = 'Gain :';

      const gainInput = document.createElement('input');
      gainInput.type = 'number';
      gainInput.min = '0';
      gainInput.step = '0.01';
      gainInput.className = 'history-gain-input';
      gainInput.value = entry.gain != null ? entry.gain : 0;

      const gainSave = document.createElement('button');
      gainSave.className = 'btn-gain-save';
      gainSave.textContent = '€ Sauvegarder';
      gainSave.addEventListener('click', async () => {
        const val = parseFloat(gainInput.value) || 0;
        entry.gain = val;
        await updateHistoryEntry(entry.id, { gain: val });
        gainSave.textContent = '✓';
        setTimeout(() => { gainSave.textContent = '€ Sauvegarder'; }, 1200);
      });

      gainLine.appendChild(gainLabel);
      gainLine.appendChild(gainInput);
      gainLine.appendChild(gainSave);
      row.appendChild(gainLine);

      list.appendChild(row);
    }

    // "Voir plus / Réduire" button
    if (jeuEntries.length > HISTORY_PAGE) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'btn-history-more';
      moreBtn.textContent = expanded
        ? `Réduire (afficher les ${HISTORY_PAGE} derniers)`
        : `Voir plus (${jeuEntries.length - HISTORY_PAGE} entrées masquées)`;
      moreBtn.addEventListener('click', () => {
        historyExpanded[jeu] = !historyExpanded[jeu];
        renderHistory();
      });
      list.appendChild(moreBtn);
    }
  }
}

document.querySelectorAll('.btn-clear-jeu').forEach(btn => {
  btn.addEventListener('click', async () => {
    await fetch(`api/history?jeu=${btn.dataset.jeu}`, { method: 'DELETE' });
    await renderHistory();
  });
});

// --- Rendering ---

function renderBall(n, cls) {
  const el = document.createElement('span');
  el.className = `ball ${cls}`;
  el.textContent = pad(n);
  return el;
}

function renderDraws(container, draws, gameFormat, jeu) {
  container.innerHTML = '';
  const entries = [
    { key: 'fixed', label: 'Fixe (déterministe)' },
    { key: 'random', label: 'Aléatoire (pondéré)' },
  ];

  for (const { key, label } of entries) {
    const d = draws[key];
    if (!d) continue;

    const card = document.createElement('div');
    card.className = 'draw-card';

    const lbl = document.createElement('div');
    lbl.className = 'draw-label';
    lbl.textContent = label;
    card.appendChild(lbl);

    const balls = document.createElement('div');
    balls.className = 'balls';

    d.boules.forEach((n, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'ball-sep';
        sep.textContent = '–';
        balls.appendChild(sep);
      }
      balls.appendChild(renderBall(n, 'main'));
    });

    if (gameFormat === '5boules+chance' && d.chance != null) {
      const sep = document.createElement('span');
      sep.className = 'ball-sep';
      sep.textContent = ' ✦';
      balls.appendChild(sep);
      balls.appendChild(renderBall(d.chance, 'chance'));
    } else if (d.etoiles) {
      const sep = document.createElement('span');
      sep.className = 'ball-sep';
      sep.textContent = ' ★';
      balls.appendChild(sep);
      d.etoiles.forEach((n, i) => {
        if (i > 0) {
          const sep2 = document.createElement('span');
          sep2.className = 'ball-sep';
          sep2.textContent = '–';
          balls.appendChild(sep2);
        }
        balls.appendChild(renderBall(n, 'star'));
      });
    }

    card.appendChild(balls);
    container.appendChild(card);
  }
}

function renderTable(container, title, rows) {
  container.innerHTML = '';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  container.appendChild(h3);

  const tbl = document.createElement('table');
  tbl.innerHTML = `
    <thead><tr><th>#</th><th>N°</th><th>Occ.</th></tr></thead>
    <tbody></tbody>`;
  const tbody = tbl.querySelector('tbody');
  rows.forEach(([num, count], i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${pad(num)}</td><td>${count}</td>`;
    tbody.appendChild(tr);
  });
  container.appendChild(tbl);
}

function renderJeu(jeu, data) {
  const drawsEl = document.getElementById(`draws-${jeu}`);
  const tablesEl = document.getElementById(`tables-${jeu}`);
  const gameFormat = data.game_format || '';

  currentDraws[jeu] = { draws: data.draws || {}, gameFormat };
  renderDraws(drawsEl, data.draws || {}, gameFormat, jeu);

  tablesEl.innerHTML = '';

  const numsDiv = document.createElement('div');
  numsDiv.className = 'stat-table';
  renderTable(numsDiv, 'Numéros les plus fréquents', data.top_nums || []);
  tablesEl.appendChild(numsDiv);

  if (data.top_specials && data.top_specials.length > 0) {
    const specDiv = document.createElement('div');
    specDiv.className = 'stat-table';
    const label = data.game_format === '5boules+chance' ? 'Numéros chance' : 'Étoiles';
    renderTable(specDiv, label, data.top_specials);
    tablesEl.appendChild(specDiv);
  }
}

function renderAll(data) {
  for (const jeu of ['loto', 'euromillions']) {
    if (data[jeu]) renderJeu(jeu, data[jeu]);
  }
}

async function fetchAnalyse() {
  setLoading(true);
  setStatus('Analyse en cours…');
  try {
    const res = await fetch(`api/analyse?top=${topValue()}&power=${powerValue()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderAll(data);
    clearStatus();
  } catch (e) {
    setStatus(`Erreur : ${e.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

async function fetchDraw() {
  setLoading(true);
  setStatus('Tirage en cours…');
  try {
    const res = await fetch(`api/draw?top=${topValue()}&power=${powerValue()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (const jeu of ['loto', 'euromillions']) {
      if (data[jeu]) {
        const gameFormat = data[jeu].game_format || '';
        currentDraws[jeu] = { draws: data[jeu].draws || {}, gameFormat };
        const drawsEl = document.getElementById(`draws-${jeu}`);
        renderDraws(drawsEl, data[jeu].draws || {}, gameFormat, jeu);
      }
    }
    clearStatus();
  } catch (e) {
    setStatus(`Erreur : ${e.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

function setupJouerButton(jeu) {
  const btn = document.getElementById(`btn-jouer-${jeu}`);
  btn.addEventListener('click', async () => {
    const state = currentDraws[jeu];
    if (!state) return;
    if (!state.draws.fixed && !state.draws.random) return;
    btn.disabled = true;
    await addToHistory(jeu, state.draws, state.gameFormat);
    btn.textContent = '✓ Sauvegardé';
    setTimeout(() => { btn.textContent = 'Jouer'; btn.disabled = false; }, 1500);
  });
}

btnRefresh.addEventListener('click', fetchAnalyse);
btnDraw.addEventListener('click', fetchDraw);
setupJouerButton('loto');
setupJouerButton('euromillions');

// Initial load
fetchAnalyse();
renderHistory();
