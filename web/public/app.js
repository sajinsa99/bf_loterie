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

// --- Auth ---
const AUTH_PASSWORD = 'bf2026';
let isOwner = sessionStorage.getItem('bf_owner') === '1';
const _authDone = sessionStorage.getItem('bf_owner') !== null;

function setStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function clearStatus() {
  statusEl.className = 'status hidden';
}

function setLoading(on) {
  if (!isOwner) return;
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

// --- Auth modal ---

function applyVisitorLock() {
  // Disable header controls
  [btnRefresh, btnDraw, topInput, powerInput].forEach(el => { el.disabled = true; });
  // Disable "Jouer" and "+ Manuel" buttons
  document.querySelectorAll('.btn-save-jeu, .btn-add-entry, .btn-clear-jeu').forEach(el => { el.disabled = true; });
}

function showAuthBanner() {
  const banner = document.createElement('div');
  banner.id = 'auth-banner';
  banner.innerHTML = `
    <span class="auth-banner-msg">Mode visiteur — lecture seule</span>
    <button type="button" id="auth-owner-btn">Connexion propriétaire</button>
  `;
  document.getElementById('app').insertAdjacentElement('afterbegin', banner);
  document.getElementById('auth-owner-btn').addEventListener('click', () => showAuthModal(false));
}

function showAuthModal(firstVisit) {
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.innerHTML = `
    <div id="auth-modal">
      <div id="auth-modal-title">Accès propriétaire</div>
      <input id="auth-pwd-input" type="password" placeholder="Mot de passe" autocomplete="current-password">
      <div id="auth-modal-error" class="hidden">Mot de passe incorrect</div>
      <div id="auth-modal-btns">
        <button type="button" id="auth-cancel-btn">${firstVisit ? 'Visiteur' : 'Annuler'}</button>
        <button type="button" id="auth-ok-btn">Valider</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const pwdInput = document.getElementById('auth-pwd-input');
  const errEl = document.getElementById('auth-modal-error');

  function tryLogin() {
    if (pwdInput.value === AUTH_PASSWORD) {
      sessionStorage.setItem('bf_owner', '1');
      document.body.removeChild(overlay);
      location.reload();
    } else {
      errEl.classList.remove('hidden');
      pwdInput.value = '';
      pwdInput.focus();
    }
  }

  function onCancel() {
    document.body.removeChild(overlay);
    if (firstVisit) {
      sessionStorage.setItem('bf_owner', '0');
      applyVisitorLock();
      showAuthBanner();
    }
  }

  document.getElementById('auth-ok-btn').addEventListener('click', tryLogin);
  document.getElementById('auth-cancel-btn').addEventListener('click', onCancel);
  pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  setTimeout(() => pwdInput.focus(), 50);
}

function promptAuth() {
  showAuthModal(true);
}

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

function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

function entryIsFuture(entry) {
  if (entry.dateISO) return entry.dateISO > todayISO();
  // fallback : essaie de parser depuis la chaîne FR "Samedi 14/06/2026"
  const m = (entry.date || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}` > todayISO();
  return false;
}

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

      const future = entryIsFuture(entry);
      const noData = !future
        && (!entry.hit_fixed || entry.hit_fixed.length === 0)
        && (!entry.hit_random || entry.hit_random.length === 0)
        && (!entry.gain || entry.gain === 0);
      const topLine = document.createElement('div');
      topLine.className = 'history-top-line';

      const meta = document.createElement('span');
      meta.className = 'history-meta';
      if (future) {
        meta.textContent = `${entry.date} ⏳`;
        meta.style.fontWeight = '700';
        meta.style.color = '#f5c518';
      } else if (noData) {
        meta.textContent = `${entry.date} 📋`;
        meta.style.color = '#888';
        meta.title = 'Aucun numéro sélectionné ni gain saisi';
      } else {
        meta.textContent = entry.date;
      }

      const del = document.createElement('button');
      del.className = 'btn-delete';
      del.title = 'Supprimer';
      del.textContent = '×';
      if (isOwner) {
        del.addEventListener('click', () => deleteHistoryEntry(entry.id));
      } else {
        del.disabled = true;
        del.style.display = 'none';
      }

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
            if (future || !isOwner) {
              b.disabled = true;
              b.style.cursor = 'not-allowed';
            } else {
              b.addEventListener('click', async () => {
                const newHit = new Set(entry[hitKey] || []);
                if (newHit.has(n)) newHit.delete(n); else newHit.add(n);
                entry[hitKey] = [...newHit];
                await updateHistoryEntry(entry.id, { [hitKey]: entry[hitKey] });
                b.classList.toggle('ball-hist-hit', newHit.has(n));
              });
            }
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
      if (future) gainInput.disabled = true;
      if (!isOwner) gainInput.disabled = true;

      const gainSave = document.createElement('button');
      gainSave.className = 'btn-gain-save';
      gainSave.textContent = '€ Sauvegarder';
      if (future || !isOwner) {
        gainSave.disabled = true;
      } else {
        gainSave.addEventListener('click', async () => {
          const val = parseFloat(gainInput.value) || 0;
          entry.gain = val;
          await updateHistoryEntry(entry.id, { gain: val });
          gainSave.textContent = '✓';
          setTimeout(() => { gainSave.textContent = '€ Sauvegarder'; }, 1200);
        });
      }

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
    if (!isOwner) return;
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
    if (!isOwner) return;
    const state = currentDraws[jeu];
    if (!state) return;
    if (!state.draws.fixed && !state.draws.random) return;
    btn.disabled = true;
    await addToHistory(jeu, state.draws, state.gameFormat);
    btn.textContent = '✓ Sauvegardé';
    setTimeout(() => { btn.textContent = 'Jouer'; btn.disabled = false; }, 1500);
  });
}

btnRefresh.addEventListener('click', () => { if (isOwner) fetchAnalyse(); });
btnDraw.addEventListener('click', () => { if (isOwner) fetchDraw(); });
setupJouerButton('loto');
setupJouerButton('euromillions');

// --- Manual entry form ---

const JEU_CONFIG = {
  loto:         { boules: 5, max: 49, specials: 1, specialLabel: 'Chance', specialMax: 10, gameFormat: '5boules+chance' },
  euromillions: { boules: 5, max: 50, specials: 2, specialLabel: 'Étoiles', specialMax: 12, gameFormat: '5boules+2etoiles' },
};

function buildNumberInputs(count, max, placeholder) {
  return Array.from({ length: count }, (_, i) => {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '1';
    inp.max = String(max);
    inp.placeholder = placeholder || String(i + 1);
    inp.className = 'manual-num-input';
    return inp;
  });
}

function collectNumbers(inputs) {
  return inputs.map(i => parseInt(i.value, 10)).filter(n => !isNaN(n) && n > 0);
}

function buildManualForm(jeu) {
  const cfg = JEU_CONFIG[jeu];
  const form = document.getElementById(`history-form-${jeu}`);
  form.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'manual-form-inner';

  // Title + close
  const header = document.createElement('div');
  header.className = 'manual-form-header';
  const title = document.createElement('span');
  title.textContent = 'Saisie manuelle';
  title.className = 'manual-form-title';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'manual-form-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => form.classList.add('hidden'));
  header.appendChild(title);
  header.appendChild(closeBtn);
  wrap.appendChild(header);

  // Date input
  const dateRow = document.createElement('div');
  dateRow.className = 'manual-form-row';
  const dateLabel = document.createElement('label');
  dateLabel.className = 'manual-form-label';
  dateLabel.textContent = 'Date';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'manual-date-input';
  const now = new Date();
  const localTodayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  dateInput.value = localTodayISO;

  const dateFmt = document.createElement('span');
  dateFmt.className = 'manual-date-fmt';

  function updateDateFmt() {
    const v = dateInput.value;
    if (!v) { dateFmt.textContent = ''; dateFmt.style.fontWeight = '400'; dateFmt.style.color = '#888'; return; }
    const [y, m, d] = v.split('-');
    const isFuture = v > localTodayISO;
    dateFmt.textContent = `${d}/${m}/${y}${isFuture ? ' ⏳' : ''}`;
    dateFmt.style.fontWeight = isFuture ? '700' : '400';
    dateFmt.style.color = isFuture ? '#f5c518' : '#888';
  }

  updateDateFmt();
  dateInput.addEventListener('change', updateDateFmt);
  dateInput.addEventListener('input', updateDateFmt);

  dateRow.appendChild(dateLabel);
  dateRow.appendChild(dateInput);
  dateRow.appendChild(dateFmt);
  wrap.appendChild(dateRow);

  // Helper to build a draw row
  function buildDrawRow(label) {
    const row = document.createElement('div');
    row.className = 'manual-form-row manual-form-draw-row';
    const lbl = document.createElement('span');
    lbl.className = 'manual-form-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    const boulesGroup = document.createElement('div');
    boulesGroup.className = 'manual-inputs-group';
    const boulesInputs = buildNumberInputs(cfg.boules, cfg.max);
    boulesInputs.forEach(i => boulesGroup.appendChild(i));
    row.appendChild(boulesGroup);

    const sep = document.createElement('span');
    sep.className = 'manual-sep';
    sep.textContent = cfg.specials === 1 ? '✦' : '★';
    row.appendChild(sep);

    const specGroup = document.createElement('div');
    specGroup.className = 'manual-inputs-group';
    const specInputs = buildNumberInputs(cfg.specials, cfg.specialMax);
    specInputs.forEach(i => specGroup.appendChild(i));
    row.appendChild(specGroup);

    return { row, boulesInputs, specInputs };
  }

  const fixedDraw  = buildDrawRow('Fixe');
  const randomDraw = buildDrawRow('Aléatoire');
  wrap.appendChild(fixedDraw.row);
  wrap.appendChild(randomDraw.row);

  // Gain
  const gainRow = document.createElement('div');
  gainRow.className = 'manual-form-row';
  const gainLabel = document.createElement('label');
  gainLabel.className = 'manual-form-label';
  gainLabel.textContent = 'Gain (€)';
  const gainInput = document.createElement('input');
  gainInput.type = 'number';
  gainInput.min = '0';
  gainInput.step = '0.01';
  gainInput.value = '0';
  gainInput.className = 'history-gain-input';
  gainRow.appendChild(gainLabel);
  gainRow.appendChild(gainInput);
  wrap.appendChild(gainRow);

  // Error display zone
  const errorEl = document.createElement('div');
  errorEl.className = 'manual-error hidden';
  wrap.appendChild(errorEl);

  function showError(html) {
    errorEl.innerHTML = html;
    errorEl.classList.remove('hidden');
  }
  function hideError() {
    errorEl.innerHTML = '';
    errorEl.classList.add('hidden');
  }

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'btn-manual-save';
  saveBtn.textContent = 'Sauvegarder';
  saveBtn.addEventListener('click', async () => {
    const fixedBoules  = collectNumbers(fixedDraw.boulesInputs);
    const fixedSpec    = collectNumbers(fixedDraw.specInputs);
    const randomBoules = collectNumbers(randomDraw.boulesInputs);
    const randomSpec   = collectNumbers(randomDraw.specInputs);

    const hasFixed  = fixedBoules.length > 0;
    const hasRandom = randomBoules.length > 0;
    if (!hasFixed && !hasRandom) {
      showError('Saisis au moins un tirage (fixe ou aléatoire).');
      return;
    }

    // Duplicate detection
    const errors = [];

    function findDups(nums, label) {
      const seen = new Set(), dups = new Set();
      nums.forEach(n => { if (seen.has(n)) dups.add(n); else seen.add(n); });
      if (dups.size) errors.push(`${label} : doublon(s) → ${[...dups].map(n => pad(n)).join(', ')}`);
    }

    if (hasFixed)  findDups(fixedBoules,  'Fixe – boules');
    if (hasRandom) findDups(randomBoules, 'Aléatoire – boules');
    // étoiles uniquement pour euromillions (specials === 2)
    if (cfg.specials === 2) {
      if (hasFixed  && fixedSpec.length  > 1) findDups(fixedSpec,  'Fixe – étoiles');
      if (hasRandom && randomSpec.length > 1) findDups(randomSpec, 'Aléatoire – étoiles');
    }

    if (errors.length) {
      showError(errors.join('<br>'));
      return;
    }

    hideError();

    function buildDraw(boules, spec) {
      if (!boules.length) return null;
      if (cfg.specials === 1) return { boules, chance: spec[0] ?? null };
      return { boules, etoiles: spec };
    }

    const draws = {
      fixed:  hasFixed  ? buildDraw(fixedBoules,  fixedSpec)  : null,
      random: hasRandom ? buildDraw(randomBoules, randomSpec) : null,
    };

    const isoDate = dateInput.value || localTodayISO;
    const dt = new Date(isoDate + 'T12:00:00');
    const dateStr = dt.toLocaleString('fr-FR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const refDraw = draws.random || draws.fixed;
    const entry = {
      id: Date.now(),
      date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      dateISO: isoDate,
      jeu,
      gameFormat: cfg.gameFormat,
      draws,
      text: formatBalls(refDraw, cfg.gameFormat),
      gain: parseFloat(gainInput.value) || 0,
    };

    await fetch('api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    form.classList.add('hidden');
    await renderHistory();
  });
  wrap.appendChild(saveBtn);
  form.appendChild(wrap);
}

document.querySelectorAll('.btn-add-entry').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!isOwner) return;
    const jeu = btn.dataset.jeu;
    const form = document.getElementById(`history-form-${jeu}`);
    if (form.classList.contains('hidden')) {
      buildManualForm(jeu);
      form.classList.remove('hidden');
      // show history panel too
      historyPanels[jeu].classList.remove('hidden');
    } else {
      form.classList.add('hidden');
    }
  });
});

// Initial load
if (!_authDone) {
  // First ever visit: show modal, then load data after choice
  fetchAnalyse();
  renderHistory();
  // Modal shown after a tick so DOM is ready
  setTimeout(promptAuth, 0);
} else {
  if (!isOwner) {
    applyVisitorLock();
    showAuthBanner();
  }
  fetchAnalyse();
  renderHistory();
}

// Re-render history at midnight so future entries unlock automatically
(function scheduleMidnightRefresh() {
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) - now;
  setTimeout(() => { renderHistory(); scheduleMidnightRefresh(); }, msToMidnight);
})();
