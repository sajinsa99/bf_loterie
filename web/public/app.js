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

async function addToHistory(jeu, drawData, gameFormat) {
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString('fr-FR'),
    jeu,
    text: formatBalls(drawData, gameFormat),
    gameFormat,
    draw: drawData,
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

async function renderHistory() {
  const entries = await loadHistory();

  for (const jeu of ['loto', 'euromillions']) {
    const list = historyLists[jeu];
    const panel = historyPanels[jeu];
    const jeuEntries = entries.filter(e => e.jeu === jeu);

    list.innerHTML = '';
    panel.classList.toggle('hidden', jeuEntries.length === 0);

    for (const entry of jeuEntries) {
      const row = document.createElement('div');
      row.className = 'history-row';

      const meta = document.createElement('span');
      meta.className = 'history-meta';
      meta.textContent = entry.date;

      const balls = document.createElement('span');
      balls.className = 'history-balls';
      balls.textContent = entry.text;

      const del = document.createElement('button');
      del.className = 'btn-delete';
      del.title = 'Supprimer';
      del.textContent = '×';
      del.addEventListener('click', () => deleteHistoryEntry(entry.id));

      row.appendChild(meta);
      row.appendChild(balls);
      row.appendChild(del);
      list.appendChild(row);
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
    const draw = state.draws.random || state.draws.fixed;
    if (!draw) return;
    btn.disabled = true;
    await addToHistory(jeu, draw, state.gameFormat);
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
