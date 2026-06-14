#!/usr/bin/env bash
# Code quality and security checks for bf_loterie.
# Runs all tools inside the xmk_linters Docker image — no local install required.
# Usage:  bash checks.sh

set -uo pipefail

# ── always run from repo root (so $(pwd) resolves correctly for the volume mount) ──
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

IMAGE="xmake-deploy-milestone.int.repositories.cloud.sap/com.sap.internal.prd.xmk.tools/xmk_linters:1.1.4"
DOCKER_RUN=(docker run --rm --user root -v "$(pwd):/work" -w /work "$IMAGE")

# ── colour (terminal only) ───────────────────────────────────────────────────
if [ -t 1 ]; then
  C_BLUE=$'\033[0;34m'; C_GREEN=$'\033[0;32m'
  C_RED=$'\033[0;31m';  C_YELLOW=$'\033[1;33m'; C_RESET=$'\033[0m'
else
  C_BLUE=''; C_GREEN=''; C_RED=''; C_YELLOW=''; C_RESET=''
fi

PASS=0; FAIL=0; SKIP=0

step() {
  local label="$1"; shift
  printf "\n%s┌─ %s%s\n" "$C_BLUE" "$label" "$C_RESET"
  if "$@"; then
    printf "%s└─ PASS%s\n" "$C_GREEN" "$C_RESET"
    PASS=$((PASS + 1))
  else
    printf "%s└─ FAIL%s\n" "$C_RED" "$C_RESET"
    FAIL=$((FAIL + 1))
  fi
}

skip() {
  printf "\n%s○ SKIP%s  %s\n" "$C_YELLOW" "$C_RESET" "$1"
  SKIP=$((SKIP + 1))
}

# ── Shell ────────────────────────────────────────────────────────────────────
step "shellcheck  web/install.sh" \
  "${DOCKER_RUN[@]}" shellcheck web/install.sh

# ── JSON ─────────────────────────────────────────────────────────────────────
step "jsonlint  urls.json" \
  "${DOCKER_RUN[@]}" jsonlint urls.json

step "jsonlint  web/package.json" \
  "${DOCKER_RUN[@]}" jsonlint web/package.json

# ── Dockerfile ───────────────────────────────────────────────────────────────
step "hadolint  tmp/Dockerfile" \
  "${DOCKER_RUN[@]}" hadolint tmp/Dockerfile

# ── Markdown ─────────────────────────────────────────────────────────────────
step "markdownlint-cli2  tmp/README.md" \
  "${DOCKER_RUN[@]}" markdownlint-cli2 tmp/README.md

# ── JavaScript (eslint v9 requires a flat config; skip when absent) ──────────
if [[ -f eslint.config.js || -f web/eslint.config.js || -f .eslintrc.json ]]; then
  step "eslint  web/server.js  web/public/app.js" \
    "${DOCKER_RUN[@]}" eslint web/server.js web/public/app.js
else
  skip "eslint  (no eslint.config.js found — create one to enable)"
fi

# ── YAML (dynamic — skip when no files present) ──────────────────────────────
mapfile -t yaml_files < <(find . -path './.git' -prune -o \( -name '*.yaml' -o -name '*.yml' \) -print)
if [[ ${#yaml_files[@]} -gt 0 ]]; then
  step "yamllint  YAML files" \
    "${DOCKER_RUN[@]}" yamllint "${yaml_files[@]}"
else
  skip "yamllint  (no *.yaml / *.yml files found)"
fi

# ── Static analysis — Python + JS ────────────────────────────────────────────
step "semgrep  analyse.py + download.py + JS sources" \
  "${DOCKER_RUN[@]}" semgrep scan --config auto --error \
    analyse.py download.py web/server.js web/public/app.js

# ── IaC policy ───────────────────────────────────────────────────────────────
step "checkov  tmp/Dockerfile" \
  "${DOCKER_RUN[@]}" checkov -f tmp/Dockerfile --quiet --compact

# ── Dependency CVEs (HIGH + CRITICAL only) ───────────────────────────────────
step "trivy  HIGH/CRITICAL CVEs" \
  "${DOCKER_RUN[@]}" trivy fs --scanners vuln --exit-code 1 --severity HIGH,CRITICAL .

# ── Secrets ──────────────────────────────────────────────────────────────────
step "gitleaks  secrets in repo" \
  "${DOCKER_RUN[@]}" gitleaks detect --source . --redact

if [[ -f .secrets.baseline ]]; then
  step "detect-secrets  new secrets vs baseline" \
    "${DOCKER_RUN[@]}" detect-secrets scan --baseline .secrets.baseline
else
  skip "detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
printf "\n%s\n" "════════════════════════════════════"
printf "  %sPASS%s %-3d  %sFAIL%s %-3d  %sSKIP%s %d\n" \
  "$C_GREEN" "$C_RESET" "$PASS" \
  "$C_RED"   "$C_RESET" "$FAIL" \
  "$C_YELLOW" "$C_RESET" "$SKIP"
printf "%s\n" "════════════════════════════════════"

[ "$FAIL" -eq 0 ]
