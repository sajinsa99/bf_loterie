# Checks Report — bf_loterie — 2026-06-14 11:14:32

## Summary

| Check | Status |
|---|---|
| shellcheck  web/install.sh | ✅ PASS |
| jsonlint  urls.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| hadolint  tmp/Dockerfile | ❌ FAIL |
| markdownlint-cli2  tmp/README.md | ✅ PASS |
| eslint  (no eslint.config.js found — create one to enable) | ⏭ SKIP |
| yamllint  (no *.yaml / *.yml files found) | ⏭ SKIP |
| semgrep  analyse.py + download.py + JS sources | ❌ FAIL |
| checkov  tmp/Dockerfile | ✅ PASS |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 7 · FAIL: 2 · SKIP: 3 |

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

### `hadolint  tmp/Dockerfile`

**Status:** ❌ FAIL (exit 1)

```
hadolint: tmp/Dockerfile: withBinaryFile: does not exist (No such file or directory)
HasCallStack backtrace:
  collectBacktraces, called at libraries/ghc-internal/src/GHC/Internal/Exception.hs:169:13 in ghc-internal:GHC.Internal.Exception
  toExceptionWithBacktrace, called at libraries/ghc-internal/src/GHC/Internal/IO.hs:260:11 in ghc-internal:GHC.Internal.IO
  throwIO, called at libraries/ghc-internal/src/GHC/Internal/IO/Exception.hs:315:19 in ghc-internal:GHC.Internal.IO.Exception
  ioException, called at libraries/ghc-internal/src/GHC/Internal/IO/Exception.hs:319:20 in ghc-internal:GHC.Internal.IO.Exception
```

---

## Markdown

### `markdownlint-cli2  tmp/README.md`

**Status:** ✅ PASS

```
markdownlint-cli2 v0.17.2 (markdownlint v0.37.4)
Finding: tmp/README.md
Linting: 0 file(s)
Summary: 0 error(s)
```

---

## JavaScript

### `eslint  (no eslint.config.js found — create one to enable)`

**Status:** ⏭ SKIP

---

## YAML

### `yamllint  (no *.yaml / *.yml files found)`

**Status:** ⏭ SKIP

---

## Static Analysis

### `semgrep  analyse.py + download.py + JS sources`

**Status:** ❌ FAIL (exit 1)

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
 • Findings: 2 (2 blocking)
 • Rules run: 442
 • Targets scanned: 4
 • Parsed lines: ~100.0%
 • No ignore information available
Ran 442 rules on 4 files: 2 findings.
                   
                   
┌─────────────────┐
│ 2 Code Findings │
└─────────────────┘
               
    download.py
    ❯❱ python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected
          ❰❰ Blocking ❱❱
          Detected a dynamic value being used with urllib. urllib supports 'file://' schemes, so a dynamic    
          value controlled by a malicious actor may allow them to read arbitrary files. Audit uses of urllib  
          calls to ensure user data cannot control the URLs, or consider using the 'requests' library instead.
          Details: https://sg.run/dKZZ                                                                        
                                                                                                              
           30┆ urllib.request.urlretrieve(url, dest)
                 
    web/server.js
     ❱ javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
          ❰❰ Blocking ❱❱
          A CSRF middleware was not detected in your express application. Ensure you are either using one such
          as `csurf` or `csrf` (see rule references) and/or you are properly doing CSRF validation in your    
          routes with a token or cookies.                                                                     
          Details: https://sg.run/BxzR                                                                        
                                                                                                              
           11┆ const app = express();
```

---

## IaC Policy

### `checkov  tmp/Dockerfile`

**Status:** ✅ PASS

```
2026-06-14 09:14:25,751 [MainThread  ] [ERROR]  Failed to invoke function /opt/venv/lib/python3.12/site-packages/checkov/common/runners/runner_registry._parallel_run with (<checkov.dockerfile.runner.Runner object at 0x7f84b96f9b20>, None, None, ['tmp/Dockerfile'], <checkov.runner_filter.RunnerFilter object at 0x7f84b985e600>, True, None)
Traceback (most recent call last):
  File "/opt/venv/lib/python3.12/site-packages/checkov/common/parallelizer/parallel_runner.py", line 72, in func_wrapper
    result = original_func(*item)
             ^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/common/runners/runner_registry.py", line 836, in _parallel_run
    report = runner.run(
             ^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/dockerfile/runner.py", line 110, in run
    self.definitions, self.definitions_raw = get_files_definitions(files_list, filepath_fn)
                                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/dockerfile/utils.py", line 54, in get_files_definitions
    result = parse(file)
             ^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/dockerfile/parser.py", line 19, in parse
    with open(filename) as dockerfile:
         ^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'tmp/Dockerfile'
2026-06-14 09:14:25,761 [MainThread  ] [ERROR]  Failed to invoke function /opt/venv/lib/python3.12/site-packages/checkov/secrets/runner._safe_scan with ('tmp/Dockerfile', '')
Traceback (most recent call last):
  File "/opt/venv/lib/python3.12/site-packages/checkov/common/parallelizer/parallel_runner.py", line 72, in func_wrapper
    result = original_func(*item)
             ^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/secrets/runner.py", line 424, in _safe_scan
    file_size = os.path.getsize(full_file_path)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen genericpath>", line 62, in getsize
FileNotFoundError: [Errno 2] No such file or directory: 'tmp/Dockerfile'
2026-06-14 09:14:25,764 [MainThread  ] [ERROR]  Failed to invoke function /opt/venv/lib/python3.12/site-packages/checkov/common/runners/runner_registry._parallel_run with (<checkov.secrets.runner.Runner object at 0x7f84b99d5c70>, None, None, ['tmp/Dockerfile'], <checkov.runner_filter.RunnerFilter object at 0x7f84b985e600>, True, None)
Traceback (most recent call last):
  File "/opt/venv/lib/python3.12/site-packages/checkov/common/parallelizer/parallel_runner.py", line 72, in func_wrapper
    result = original_func(*item)
             ^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/common/runners/runner_registry.py", line 836, in _parallel_run
    report = runner.run(
             ^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/checkov/secrets/runner.py", line 271, in run
    self._scan_files(files_to_scan, secrets, self.pbar)
  File "/opt/venv/lib/python3.12/site-packages/checkov/secrets/runner.py", line 415, in _scan_files
    for filename, secrets_results in results:
        ^^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: cannot unpack non-iterable NoneType object
```

---

## Dependency CVEs

### `trivy  HIGH/CRITICAL CVEs`

**Status:** ✅ PASS

```
2026-06-14T09:14:26Z	INFO	[vulndb] Need to update DB
2026-06-14T09:14:26Z	INFO	[vulndb] Downloading vulnerability DB...
2026-06-14T09:14:26Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
32.42 MiB / 96.06 MiB [-------------------->________________________________________] 33.75% ? p/s ?77.25 MiB / 96.06 MiB [------------------------------------------------->___________] 80.42% ? p/s ?96.06 MiB / 96.06 MiB [----------------------------------------------------------->] 100.00% ? p/s ?96.06 MiB / 96.06 MiB [--------------------------------------------->] 100.00% 105.86 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [--------------------------------------------->] 100.00% 105.86 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [--------------------------------------------->] 100.00% 105.86 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 99.03 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 99.03 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 99.03 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 92.64 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 92.64 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 92.64 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 86.66 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 86.66 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 86.66 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 81.07 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 81.07 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [---------------------------------------------->] 100.00% 81.07 MiB p/s ETA 0s96.06 MiB / 96.06 MiB [-------------------------------------------------] 100.00% 27.62 MiB p/s 3.7s2026-06-14T09:14:30Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-06-14T09:14:30Z	INFO	[vuln] Vulnerability scanning is enabled
2026-06-14T09:14:30Z	INFO	Number of language-specific files	num=0
2026-06-14T09:14:30Z	WARN	[report] Supported files for scanner(s) not found.	scanners=[vuln]

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

[90m9:14AM[0m [31mERR[0m [1m[git] fatal: detected dubious ownership in repository at '/work'[0m
[90m9:14AM[0m [31mERR[0m [1m[git] To add an exception for this directory, call:[0m
[90m9:14AM[0m [31mERR[0m [1m[git] [0m
[90m9:14AM[0m [31mERR[0m [1m[git] 	git config --global --add safe.directory /work[0m
[90m9:14AM[0m [31mERR[0m [36merror=[0m[31m[1m"stderr is not empty"[0m[0m
[90m9:14AM[0m [32mINF[0m [1m0 commits scanned.[0m
[90m9:14AM[0m [32mINF[0m [1mscanned ~0 bytes (0) in 219ms[0m
[90m9:14AM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

