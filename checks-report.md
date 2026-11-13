# Checks Report — bf_loterie — 2026-11-13 12:16:49

## Summary

| Check | Status |
|---|---|
| shellcheck  install.sh | ✅ PASS |
| jsonlint  urls.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| hadolint  (tmp/Dockerfile not found) | ⏭ SKIP |
| markdownlint-cli2  (tmp/README.md not found) | ⏭ SKIP |
| eslint  web/server.js  web/public/app.js | ✅ PASS |
| yamllint  (no *.yaml / *.yml files found) | ⏭ SKIP |
| semgrep  analyse.py + download.py + JS sources | ✅ PASS |
| checkov  (tmp/Dockerfile not found) | ⏭ SKIP |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 7 · FAIL: 0 · SKIP: 5 |

---

## Shell

### `shellcheck  install.sh`

**Status:** ✅ PASS

_no output_

---

## JSON

### `jsonlint  urls.json`

**Status:** ✅ PASS

```
{
  "loto": [
    {
      "periode": "mai 1976 - octobre 2008",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afl6",
      "fichier": "1976-2008.zip"
    },
    {
      "periode": "octobre 2008 - mars 2007",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afm6",
      "fichier": "2008-2007.zip"
    },
    {
      "periode": "mars 2017 - fevrier 2019",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afn6",
      "fichier": "2017-2019.zip"
    },
    {
      "periode": "fevrier 2019 - novembre 2026",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afo6",
      "fichier": "2019-2026.zip"
    }
  ],
  "euromillions": [
    {
      "periode": "fevrier 2004 - mai 2011",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afa8",
      "fichier": "2004-2011.zip"
    },
    {
      "periode": "mai 2011 - février 2014",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afa9",
      "fichier": "2011-2014.zip"
    },
    {
      "periode": "février 2014 - septembre 2016",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afb6",
      "fichier": "2014-2016.zip"
    },
    {
      "periode": "septembre 2016 - fevrier 2019",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afc6",
      "fichier": "2016-2019.zip"
    },
    {
      "periode": "mars 2019 - fevrier 2020",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afd6",
      "fichier": "2019-2020.zip"
    },
    {
      "periode": "fevrier 2020 - juin 2026",
      "url": "https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66afe6",
      "fichier": "2020-2026.zip"
    }
  ]
}
```

---

### `jsonlint  web/package.json`

**Status:** ✅ PASS

```
{
  "name": "bf_loterie_web",
  "version": "1.0.0",
  "description": "Web UI for bf_loterie analyse.py",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "22.22.1",
    "npm": "9.2.0"
  },
  "dependencies": {
    "express": "^5.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.5",
    "globals": "^17.14.0"
  }
}
```

---

## Dockerfile

### `hadolint  (tmp/Dockerfile not found)`

**Status:** ⏭ SKIP

---

## Markdown

### `markdownlint-cli2  (tmp/README.md not found)`

**Status:** ⏭ SKIP

---

## JavaScript

### `eslint  web/server.js  web/public/app.js`

**Status:** ✅ PASS

_no output_

---

## YAML

### `yamllint  (no *.yaml / *.yml files found)`

**Status:** ⏭ SKIP

---

## Static Analysis

### `semgrep  analyse.py + download.py + JS sources`

**Status:** ✅ PASS

```
               
               
┌─────────────┐
│ Scan Status │
└─────────────┘
  Scanning 4 files tracked by git with 1074 Code rules:
                                                                                                                        
  Language      Rules   Files          Origin      Rules                                                                
 ─────────────────────────────        ───────────────────                                                               
  <multilang>      47       4          Community    1074                                                                
  python          243       2                                                                                           
  js              153       2                                                                                           
                                                                                                                        
                
                
┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 0 (0 blocking)
 • Rules run: 442
 • Targets scanned: 4
 • Parsed lines: ~100.0%
 • No ignore information available
Ran 442 rules on 4 files: 0 findings.
(need more rules? `semgrep login` for additional free Semgrep Registry rules)

If Semgrep missed a finding, please send us feedback to let us know!
See https://semgrep.dev/docs/reporting-false-negatives/
```

---

## IaC Policy

### `checkov  (tmp/Dockerfile not found)`

**Status:** ⏭ SKIP

---

## Dependency CVEs

### `trivy  HIGH/CRITICAL CVEs`

**Status:** ✅ PASS

```
2026-11-13T11:16:41Z	INFO	[vulndb] Need to update DB
2026-11-13T11:16:41Z	INFO	[vulndb] Downloading vulnerability DB...
2026-11-13T11:16:41Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
25.17 MiB / 133.47 MiB [----------->________________________________________________] 18.86% ? p/s ?65.86 MiB / 133.47 MiB [----------------------------->______________________________] 49.34% ? p/s ?105.54 MiB / 133.47 MiB [---------------------------------------------->____________] 79.07% ? p/s ?133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 180.46 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 180.46 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 180.46 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 168.81 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 168.81 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 168.81 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 157.92 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 157.92 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 157.92 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 147.73 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 147.73 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 147.73 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 138.20 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 138.20 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 138.20 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 129.29 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 129.29 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 129.29 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 120.95 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 120.95 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 120.95 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 113.14 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [------------------------------------------->] 100.00% 113.14 MiB p/s ETA 0s133.47 MiB / 133.47 MiB [-----------------------------------------------] 100.00% 26.53 MiB p/s 5.2s2026-11-13T11:16:47Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-11-13T11:16:47Z	INFO	[vuln] Vulnerability scanning is enabled
2026-11-13T11:16:47Z	INFO	Suppressing dependencies for development and testing. To display them, try the '--include-dev-deps' flag.
2026-11-13T11:16:47Z	INFO	Number of language-specific files	num=1
2026-11-13T11:16:47Z	INFO	[npm] Detecting vulnerabilities...

Report Summary

┌───────────────────────┬──────┬─────────────────┐
│        Target         │ Type │ Vulnerabilities │
├───────────────────────┼──────┼─────────────────┤
│ web/package-lock.json │ npm  │        0        │
└───────────────────────┴──────┴─────────────────┘
Legend:
- '-': Not scanned
- '0': Clean (no security findings detected)
```

---

## Secrets

### `gitleaks  secrets in repo`

**Status:** ✅ PASS

```

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

[90m11:16AM[0m [32mINF[0m [1m85 commits scanned.[0m
[90m11:16AM[0m [32mINF[0m [1mscanned ~225058 bytes (225.06 KB) in 257ms[0m
[90m11:16AM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

