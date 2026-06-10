'use strict';

const topInput = document.getElementById('top-input');
const btnRefresh = document.getElementById('btn-refresh');
const btnDraw = document.getElementById('btn-draw');
const statusEl = document.getElementById('status');

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

function pad(n) {
  return String(n).padStart(2, '0');
}

function renderBall(n, cls) {
  const el = document.createElement('span');
  el.className = `ball ${cls}`;
  el.textContent = pad(n);
  return el;
}

function renderDraws(container, draws, gameFormat) {
  container.innerHTML = '';
  const entries = [
    { key: 'fixed', label: 'Fixe (déterministe)' },
    { key: 'random', label: 'Aléatoire' },
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

  renderDraws(drawsEl, data.draws || {}, data.game_format || '');

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
    const res = await fetch(`/api/analyse?top=${topValue()}`);
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
    const res = await fetch(`/api/draw?top=${topValue()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (const jeu of ['loto', 'euromillions']) {
      if (data[jeu]) {
        const drawsEl = document.getElementById(`draws-${jeu}`);
        renderDraws(drawsEl, data[jeu].draws || {}, data[jeu].game_format || '');
      }
    }
    clearStatus();
  } catch (e) {
    setStatus(`Erreur : ${e.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

btnRefresh.addEventListener('click', fetchAnalyse);
btnDraw.addEventListener('click', fetchDraw);

// Initial load
fetchAnalyse();
