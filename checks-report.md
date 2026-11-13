# Checks Report — bf_loterie — 2026-11-13 16:36:42

## Summary

| Check | Status |
|---|---|
| shellcheck  install.sh | ✅ PASS |
| jsonlint  urls.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| hadolint  (tmp/Dockerfile not found) | ⏭ SKIP |
| markdownlint-cli2  (tmp/README.md not found) | ⏭ SKIP |
| eslint  web/server.js  web/public/app.js | ✅ PASS |
| htmlhint  HTML files | ✅ PASS |
| stylelint  CSS files | ✅ PASS |
| yamllint  (no *.yaml / *.yml files found) | ⏭ SKIP |
| pylint  analyse.py  download.py | ✅ PASS |
| bandit  analyse.py  download.py | ✅ PASS |
| semgrep  analyse.py + download.py + JS sources | ✅ PASS |
| checkov  (tmp/Dockerfile not found) | ⏭ SKIP |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 11 · FAIL: 0 · SKIP: 5 |

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

## HTML

### `htmlhint  HTML files`

**Status:** ✅ PASS

```

Scanned 1 files, no errors found (14 ms).
```

---

## CSS

### `stylelint  CSS files`

**Status:** ✅ PASS

_no output_

---

## YAML

### `yamllint  (no *.yaml / *.yml files found)`

**Status:** ⏭ SKIP

---

## Python

### `pylint  analyse.py  download.py`

**Status:** ✅ PASS

```

------------------------------------
Your code has been rated at 10.00/10
```

---

### `bandit  analyse.py  download.py`

**Status:** ✅ PASS

```
[main]	INFO	profile include tests: None
[main]	INFO	profile exclude tests: None
[main]	INFO	cli include tests: None
[main]	INFO	cli exclude tests: None
[main]	INFO	running on Python 3.14.4
[tester]	ERROR	Bandit internal error running: start_process_with_partial_path on file ./analyse.py at line 13: module 'ast' has no attribute 'Num'Traceback (most recent call last):
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/tester.py", line 51, in run_tests
    result = test(context, test._config)
  File "/opt/venv/lib/python3.14/site-packages/bandit/plugins/injection_shell.py", line 678, in start_process_with_partial_path
    if config and len(context.call_args):
                      ^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/context.py", line 51, in call_args
    args.append(self._get_literal_value(arg))
                ~~~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/context.py", line 181, in _get_literal_value
    if isinstance(literal, ast.Num):
                           ^^^^^^^
AttributeError: module 'ast' has no attribute 'Num'

[manager]	ERROR	Exception occurred when executing tests against ./analyse.py.
[manager]	ERROR	Run "bandit --debug ./analyse.py" to see the full traceback.
[tester]	ERROR	Bandit internal error running: start_process_with_partial_path on file ./download.py at line 7: module 'ast' has no attribute 'Num'Traceback (most recent call last):
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/tester.py", line 51, in run_tests
    result = test(context, test._config)
  File "/opt/venv/lib/python3.14/site-packages/bandit/plugins/injection_shell.py", line 678, in start_process_with_partial_path
    if config and len(context.call_args):
                      ^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/context.py", line 51, in call_args
    args.append(self._get_literal_value(arg))
                ~~~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "/opt/venv/lib/python3.14/site-packages/bandit/core/context.py", line 181, in _get_literal_value
    if isinstance(literal, ast.Num):
                           ^^^^^^^
AttributeError: module 'ast' has no attribute 'Num'

[manager]	ERROR	Exception occurred when executing tests against ./download.py.
[manager]	ERROR	Run "bandit --debug ./download.py" to see the full traceback.
Run started:2026-11-13 15:36:29.126031

Test results:
	No issues identified.

Code scanned:
	Total lines of code: 453
	Total lines skipped (#nosec): 0
	Total potential issues skipped due to specifically being disabled (e.g., #nosec BXXX): 0

Run metrics:
	Total issues (by severity):
		Undefined: 0
		Low: 0
		Medium: 0
		High: 0
	Total issues (by confidence):
		Undefined: 0
		Low: 0
		Medium: 0
		High: 0
Files skipped (2):
	./analyse.py (exception while scanning file)
	./download.py (exception while scanning file)
```

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
2026-11-13T15:36:34Z	INFO	[vulndb] Need to update DB
2026-11-13T15:36:34Z	INFO	[vulndb] Downloading vulnerability DB...
2026-11-13T15:36:34Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
18.77 MiB / 133.77 MiB [-------->___________________________________________________] 14.03% ? p/s ?41.03 MiB / 133.77 MiB [------------------>_________________________________________] 30.67% ? p/s ?60.09 MiB / 133.77 MiB [-------------------------->_________________________________] 44.92% ? p/s ?81.52 MiB / 133.77 MiB [---------------------------->_________________] 60.94% 104.57 MiB p/s ETA 0s104.73 MiB / 133.77 MiB [----------------------------------->_________] 78.29% 104.57 MiB p/s ETA 0s129.81 MiB / 133.77 MiB [------------------------------------------->_] 97.04% 104.57 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 103.45 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 103.45 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 103.45 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 96.77 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 96.77 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 96.77 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 90.53 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 90.53 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 90.53 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 84.69 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 84.69 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 84.69 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 79.22 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 79.22 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 79.22 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 74.11 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 74.11 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 74.11 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 69.33 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 69.33 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 69.33 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 64.86 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-----------------------------------------------] 100.00% 24.22 MiB p/s 5.7s2026-11-13T15:36:40Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-11-13T15:36:40Z	INFO	[vuln] Vulnerability scanning is enabled
2026-11-13T15:36:40Z	INFO	Suppressing dependencies for development and testing. To display them, try the '--include-dev-deps' flag.
2026-11-13T15:36:40Z	INFO	Number of language-specific files	num=1
2026-11-13T15:36:40Z	INFO	[npm] Detecting vulnerabilities...

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

[90m3:36PM[0m [32mINF[0m [1m90 commits scanned.[0m
[90m3:36PM[0m [32mINF[0m [1mscanned ~241126 bytes (241.13 KB) in 256ms[0m
[90m3:36PM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

