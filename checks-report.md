# Checks Report — bf_loterie — 2026-11-13 16:34:09

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
| pylint  analyse.py  download.py | ❌ FAIL |
| bandit  analyse.py  download.py | ✅ PASS |
| semgrep  analyse.py + download.py + JS sources | ✅ PASS |
| checkov  (tmp/Dockerfile not found) | ⏭ SKIP |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 10 · FAIL: 1 · SKIP: 5 |

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

**Status:** ❌ FAIL (exit 28)

```
************* Module analyse
analyse.py:96:0: C0301: Line too long (108/100) (line-too-long)
analyse.py:190:0: C0301: Line too long (110/100) (line-too-long)
analyse.py:199:0: C0301: Line too long (111/100) (line-too-long)
analyse.py:269:0: C0301: Line too long (104/100) (line-too-long)
analyse.py:323:0: C0301: Line too long (110/100) (line-too-long)
analyse.py:409:0: C0301: Line too long (103/100) (line-too-long)
analyse.py:436:0: C0301: Line too long (115/100) (line-too-long)
analyse.py:437:0: C0301: Line too long (129/100) (line-too-long)
analyse.py:438:0: C0301: Line too long (101/100) (line-too-long)
analyse.py:439:0: C0301: Line too long (107/100) (line-too-long)
analyse.py:440:0: C0301: Line too long (156/100) (line-too-long)
analyse.py:441:0: C0301: Line too long (116/100) (line-too-long)
analyse.py:442:0: C0301: Line too long (117/100) (line-too-long)
analyse.py:443:0: C0301: Line too long (123/100) (line-too-long)
analyse.py:445:0: C0301: Line too long (139/100) (line-too-long)
analyse.py:448:0: C0325: Unnecessary parens after 'not' keyword (superfluous-parens)
analyse.py:477:0: C0301: Line too long (146/100) (line-too-long)
analyse.py:496:0: C0301: Line too long (133/100) (line-too-long)
analyse.py:1:0: C0114: Missing module docstring (missing-module-docstring)
analyse.py:21:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:27:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:43:0: R0914: Too many local variables (17/15) (too-many-locals)
analyse.py:81:11: W0718: Catching too general exception Exception (broad-exception-caught)
analyse.py:215:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:247:11: W0718: Catching too general exception Exception (broad-exception-caught)
analyse.py:262:11: W0718: Catching too general exception Exception (broad-exception-caught)
analyse.py:268:0: C0115: Missing class docstring (missing-class-docstring)
analyse.py:271:4: R0913: Too many arguments (7/5) (too-many-arguments)
analyse.py:271:4: R0917: Too many positional arguments (7/5) (too-many-positional-arguments)
analyse.py:268:0: R0903: Too few public methods (0/2) (too-few-public-methods)
analyse.py:290:0: R0914: Too many local variables (16/15) (too-many-locals)
analyse.py:336:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:354:0: R0913: Too many arguments (7/5) (too-many-arguments)
analyse.py:354:0: R0917: Too many positional arguments (7/5) (too-many-positional-arguments)
analyse.py:394:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:394:0: R0913: Too many arguments (7/5) (too-many-arguments)
analyse.py:394:0: R0917: Too many positional arguments (7/5) (too-many-positional-arguments)
analyse.py:429:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:434:0: C0116: Missing function or method docstring (missing-function-docstring)
analyse.py:457:17: W1510: 'subprocess.run' used without explicitly defining the value for 'check'. (subprocess-run-check)
************* Module download
download.py:30:0: C0301: Line too long (138/100) (line-too-long)
download.py:1:0: C0114: Missing module docstring (missing-module-docstring)
download.py:35:0: C0116: Missing function or method docstring (missing-function-docstring)

-----------------------------------
Your code has been rated at 8.82/10
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
Run started:2026-11-13 15:33:55.914531

Test results:
	No issues identified.

Code scanned:
	Total lines of code: 452
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
2026-11-13T15:34:01Z	INFO	[vulndb] Need to update DB
2026-11-13T15:34:01Z	INFO	[vulndb] Downloading vulnerability DB...
2026-11-13T15:34:01Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
14.99 MiB / 133.77 MiB [------>_____________________________________________________] 11.20% ? p/s ?35.68 MiB / 133.77 MiB [---------------->___________________________________________] 26.67% ? p/s ?57.70 MiB / 133.77 MiB [------------------------->__________________________________] 43.14% ? p/s ?81.66 MiB / 133.77 MiB [---------------------------->_________________] 61.05% 111.20 MiB p/s ETA 0s107.93 MiB / 133.77 MiB [------------------------------------>________] 80.68% 111.20 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 111.20 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 109.62 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 109.62 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 109.62 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 102.55 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 102.55 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 102.55 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 95.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 95.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 95.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 89.75 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 89.75 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 89.75 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 83.96 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 83.96 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 83.96 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 78.54 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 78.54 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 78.54 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 73.47 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 73.47 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 73.47 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-------------------------------------------->] 100.00% 68.73 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-----------------------------------------------] 100.00% 24.52 MiB p/s 5.7s2026-11-13T15:34:07Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-11-13T15:34:07Z	INFO	[vuln] Vulnerability scanning is enabled
2026-11-13T15:34:07Z	INFO	Suppressing dependencies for development and testing. To display them, try the '--include-dev-deps' flag.
2026-11-13T15:34:07Z	INFO	Number of language-specific files	num=1
2026-11-13T15:34:07Z	INFO	[npm] Detecting vulnerabilities...

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

[90m3:34PM[0m [32mINF[0m [1m88 commits scanned.[0m
[90m3:34PM[0m [32mINF[0m [1mscanned ~230055 bytes (230.05 KB) in 252ms[0m
[90m3:34PM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

