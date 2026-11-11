# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`bf_loterie` analyses the French FDJ lottery draw history (Loto and EuroMillions) and
suggests weighted draw picks. It has two layers:

- A **Python analysis core** (`analyse.py` + `download.py`) that downloads historical
  draw data from FDJ and computes frequency statistics / weighted suggestions.
- A **Node/Express web UI** (`web/`) that shells out to `analyse.py` and renders results,
  tracking the user's played draws and gains/costs over time.

Code comments, CLI output, and UI strings are in **French** — keep new user-facing text French.

## Commands

### Analysis core (Python, no dependencies beyond stdlib)
```bash
python3 analyse.py                      # analyse all games, human-readable output
python3 analyse.py --jeu loto           # one game only (loto | euromillions | tous)
python3 analyse.py --refresh            # re-download data first (runs download.py)
python3 analyse.py --json               # structured JSON (top_nums/pairs/draws) — used by the web server
python3 analyse.py --draw-only          # JSON draws only, uses disk cache (fast path)
python3 analyse.py --power 2.0          # weighting exponent for random picks (1.0=linear)
python3 analyse.py --count 5            # generate N random suggestions (1–50)
python3 download.py                     # download+extract CSVs into downloads/ (called automatically when data missing)
```

### Web UI
```bash
cd web && npm install
cd web && npm start                     # node server.js, listens on PORT (default 6000)
```

### Linting / checks
```bash
bash checks.sh                          # runs all linters/scanners in the xmk_linters Docker image, writes checks-report.md
cd web && npx eslint server.js public/app.js
```
`checks.sh` requires Docker and runs shellcheck, jsonlint, eslint, semgrep, trivy, gitleaks,
etc. There is **no test suite** in this repo.

## Architecture

### Data flow
1. `urls.json` lists FDJ zip archives per game (`loto`, `euromillions`), each a period + download URL.
2. `download.py` downloads each zip into `downloads/<jeu>/`, extracts CSVs (semicolon-delimited,
   `latin-1` encoded), then deletes the zip.
3. `analyse.py` parses every `downloads/<jeu>/**/*.csv`, auto-detecting the game format from
   CSV headers: `5boules+2etoiles` (EuroMillions, columns `etoile_1/2`), `5boules+chance`
   (Loto, column `numero_chance`), or plain `5boules`. See `detect_ball_columns` /
   `detect_special_columns` / `_detect_format`.

### analyse.py internals
- **`JeuData`** holds the aggregated counters: `num_counter` (ball frequencies),
  `special_counter` (stars/chance), `pair_counter` (co-occurring ball pairs), plus format/total.
- **Disk cache** (`downloads/<jeu>/.cache.json`): keyed on the max CSV mtime. `load_jeu(fast=True)`
  (used by `--draw-only`) reads this and skips CSV re-parsing + pair computation entirely.
- **`weighted_sample`** draws without replacement using the Efraimidis–Spirakis algorithm,
  weighting each number by `count ** power`.
- **`suggest_draw_data`** returns two kinds of picks: a **`fixed`** draw (deterministic — seeded
  from the data so it's stable across runs, `power=1.0`) and **`random`** draw(s) (seeded from the
  OS, honoring `--power`/`--count`). This is the shared entry point for both `--json` and `--draw-only`.

### Web server (`web/server.js`, ES modules)
- Thin wrapper: every analysis request is an `execFile(python3, ['analyse.py', ...])` whose stdout
  JSON is forwarded. Query params (`top`, `power`, `count`) are validated/clamped in
  `parseTopArg`/`parsePowerArg`/`parseCountArg` before being passed to the subprocess.
- `GET /api/analyse` → full `--json`; `GET /api/draw` → fast `--draw-only`.
- **History** (`/api/history`): the user's played draws with gains/costs, stored in
  `web/history.json` (capped at `MAX_HISTORY=50`, newest first). GET is public; POST/PATCH/DELETE
  require owner auth. PATCH only accepts an allow-listed set of fields.
- **Auth** is a single shared password (`OWNER_PASSWORD` env, from `web/.env`). `/api/auth` checks
  it and returns an in-memory bearer token (`ownerToken`) held in a module variable — **it resets
  on every server restart and is not shared across processes**.

### Frontend (`web/public/`)
Vanilla JS, no framework. `app.js` renders summaries, a pie chart and a line chart (gains/costs
over time) on hand-drawn `<canvas>`, manages per-game cost defaults, collapse state, and the auth
modal/session (1-hour client-side expiry). Draw days are hardcoded in `DRAW_DAYS`.

### Deployment
`install.sh` (run as root) deploys to `/opt/bf_loterie`, installs the `web/deploy/bf_loterie_web.service`
systemd unit (runs as `www-data` on port 6000), and wires the `web/deploy/nginx-bf_loterie_web.conf`
snippet into an nginx vhost at `/loterie/`. `history.json` is backed up (never overwritten) and
`.env` is created from `.env.example` only if absent.

## Conventions
- Python targets 3.10+ (uses `X | Y` type unions, `list[...]` generics) and relies only on the
  stdlib — don't add third-party Python dependencies.
- `web/` is pinned to Node 20.20.2 / npm 10.8.2 (see `package.json` engines and `.nvmrc`).
- `downloads/`, `web/.env`, `web/node_modules/`, `web/package-lock.json`, and `tmp/` are gitignored.
