# Checks Report — bf_loterie — 2026-06-23 14:10:04

## Summary

| Check | Status |
|---|---|
| shellcheck  web/install.sh | ✅ PASS |
| jsonlint  urls.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| hadolint  (tmp/Dockerfile not found) | ⏭ SKIP |
| markdownlint-cli2  (tmp/README.md not found) | ⏭ SKIP |
| eslint  web/server.js  web/public/app.js | ❌ FAIL |
| yamllint  (no *.yaml / *.yml files found) | ⏭ SKIP |
| semgrep  analyse.py + download.py + JS sources | ✅ PASS |
| checkov  (tmp/Dockerfile not found) | ⏭ SKIP |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 6 · FAIL: 1 · SKIP: 5 |

---

## Shell

### `shellcheck  web/install.sh`

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
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
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

**Status:** ❌ FAIL (exit 2)

```

Oops! Something went wrong! :(

ESLint: 9.29.0

Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js' imported from /work/web/eslint.config.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:855:18)
    at defaultResolve (node:internal/modules/esm/resolve:985:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:747:20)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:724:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:320:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:182:49)
(node:1) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///work/web/eslint.config.js?mtime=1781428805557 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /work/web/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
```

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
  Scanning 4 files tracked by git with 1059 Code rules:
                                                                                                                        
  Language      Rules   Files          Origin      Rules                                                                
 ─────────────────────────────        ───────────────────                                                               
  <multilang>      47       4          Community    1059                                                                
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


A new version of Semgrep is available. See https://semgrep.dev/docs/upgrading
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
2026-06-23T12:09:57Z	INFO	[vulndb] Need to update DB
2026-06-23T12:09:57Z	INFO	[vulndb] Downloading vulnerability DB...
2026-06-23T12:09:57Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
30.55 MiB / 96.98 MiB [------------------->_________________________________________] 31.50% ? p/s ?72.46 MiB / 96.98 MiB [--------------------------------------------->_______________] 74.72% ? p/s ?96.98 MiB / 96.98 MiB [----------------------------------------------------------->] 100.00% ? p/s ?96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 110.65 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 110.65 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 110.65 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 103.51 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 103.51 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [--------------------------------------------->] 100.00% 103.51 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 96.84 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 96.84 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 96.84 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 90.59 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 90.59 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 90.59 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 84.74 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 84.74 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 84.74 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 79.28 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [---------------------------------------------->] 100.00% 79.28 MiB p/s ETA 0s96.98 MiB / 96.98 MiB [-------------------------------------------------] 100.00% 25.11 MiB p/s 4.1s2026-06-23T12:10:01Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-06-23T12:10:01Z	INFO	[vuln] Vulnerability scanning is enabled
2026-06-23T12:10:01Z	INFO	Number of language-specific files	num=0
2026-06-23T12:10:01Z	WARN	[report] Supported files for scanner(s) not found.	scanners=[vuln]

Report Summary

┌────────┬──────┬─────────────────┐
│ Target │ Type │ Vulnerabilities │
├────────┼──────┼─────────────────┤
│   -    │  -   │        -        │
└────────┴──────┴─────────────────┘
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

[90m12:10PM[0m [32mINF[0m [1m56 commits scanned.[0m
[90m12:10PM[0m [32mINF[0m [1mscanned ~154075 bytes (154.07 KB) in 316ms[0m
[90m12:10PM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

