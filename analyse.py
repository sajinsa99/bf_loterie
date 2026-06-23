import subprocess
import sys
import csv
import json
import math
import heapq
import random
import argparse
from collections import Counter
from itertools import combinations
from pathlib import Path

DOWNLOADS_DIR = Path(__file__).parent / "downloads"
TOP_N = 10
JEUX = ("loto", "euromillions")
_CACHE_FILE = ".cache.json"


# ── CSV helpers ────────────────────────────────────────────────────────────────

def detect_ball_columns(headers: list[str]) -> list[str]:
    candidates = [f"boule_{i}" for i in range(1, 6)]
    found = [c for c in candidates if c in headers]
    return found if found else candidates


def detect_special_columns(headers: list[str]) -> list[str]:
    if "etoile_1" in headers:
        return ["etoile_1", "etoile_2"]
    if "numero_chance" in headers:
        return ["numero_chance"]
    return []


def _detect_format(headers: list[str]) -> str:
    if "etoile_1" in headers:
        return "5boules+2etoiles"
    if "numero_chance" in headers:
        return "5boules+chance"
    return "5boules"


def parse_csv(path: Path) -> tuple[list[tuple], list[int], str]:
    """Parse one CSV — opens it once, returns (combos, specials, game_format)."""
    combos: list[tuple] = []
    specials: list[int] = []
    game_format = ""
    try:
        with open(path, encoding="latin-1") as f:
            reader = csv.DictReader(f, delimiter=";")
            headers = reader.fieldnames or []
            cols = detect_ball_columns(headers)
            spec_cols = detect_special_columns(headers)
            game_format = _detect_format(headers)
            for row in reader:
                try:
                    nums = []
                    for c in cols:
                        try:
                            val = int(row.get(c, "").strip())
                        except ValueError:
                            break
                        if val <= 0:
                            break
                        nums.append(val)
                    if len(nums) != len(cols):
                        continue
                    nums_tuple = tuple(sorted(nums))
                    if len(set(nums_tuple)) != len(nums_tuple):
                        continue
                    combos.append(nums_tuple)
                    for sc in spec_cols:
                        try:
                            v = int(row.get(sc, "").strip())
                            if v > 0:
                                specials.append(v)
                        except ValueError:
                            pass
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        print(f"  [warn] {path.name}: {e}", file=sys.stderr)
    return combos, specials, game_format


# ── Sampling ───────────────────────────────────────────────────────────────────

def weighted_sample(counter: Counter, k: int, power: float = 1.0) -> list[int]:
    """Tirage pondéré sans remise (Efraimidis–Spirakis, O(n log k))."""
    available: list[tuple[int, float]] = [
        (n, c ** power if power != 1.0 else float(c))
        for n, c in counter.items()
        if (c ** power if power != 1.0 else c) > 0
    ]
    if len(available) < k:
        raise ValueError(f"weighted_sample: demande {k} éléments mais seulement {len(available)} éligibles")
    heap: list[tuple[float, int]] = []
    for n, w in available:
        # clé = log(U)/w : équivalent monotone à U^(1/w), stable numériquement
        # 1.0 - random.random() ∈ (0.0, 1.0] → log toujours défini
        key = math.log(1.0 - random.random()) / w
        if len(heap) < k:
            heapq.heappush(heap, (key, n))
        elif key > heap[0][0]:
            heapq.heapreplace(heap, (key, n))
    return sorted(n for _, n in heap)


def _make_draw(num_counter: Counter, special_counter: Counter, game_format: str, power: float) -> dict | None:
    """Draw one set of numbers using current RNG state. Returns None on error."""
    try:
        boules = weighted_sample(num_counter, 5, power)
    except ValueError as e:
        print(f"  [warn] {e}", file=sys.stderr)
        return None
    if game_format == "5boules+chance":
        try:
            chance = weighted_sample(special_counter, 1, power) if special_counter else [random.randint(1, 10)]
        except ValueError as e:
            print(f"  [warn] chance: {e}", file=sys.stderr)
            return None
        return {"boules": boules, "chance": chance[0]}
    entry: dict = {"boules": boules}
    if special_counter:
        try:
            entry["etoiles"] = weighted_sample(special_counter, 2, power)
        except ValueError as e:
            print(f"  [warn] etoiles: {e}", file=sys.stderr)
    return entry


# ── Display ────────────────────────────────────────────────────────────────────

def print_table(title: str, items: list, col1: str, col1_width: int) -> None:
    print(f"\n  {title}")
    print(f"  {'Rang':<5} {col1:<{col1_width}} {'Occurrences':>10}")
    print(f"  {'-'*5} {'-'*col1_width} {'-'*10}")
    for i, (val, count) in enumerate(items, 1):
        print(f"  {i:<5} {val:<{col1_width}} {count:>10}")


# ── Disk cache ─────────────────────────────────────────────────────────────────

def _cache_path(jeu: str) -> Path:
    return DOWNLOADS_DIR / jeu / _CACHE_FILE


def _csv_mtime_key(jeu: str) -> float:
    mtimes = [p.stat().st_mtime for p in (DOWNLOADS_DIR / jeu).glob("**/*.csv")]
    return max(mtimes) if mtimes else 0.0


def _load_cache(jeu: str) -> tuple[Counter, Counter, str] | None:
    cp = _cache_path(jeu)
    if not cp.exists():
        return None
    try:
        data = json.loads(cp.read_text(encoding="utf-8"))
        if data.get("mtime_key") != _csv_mtime_key(jeu):
            return None
        return (
            Counter({int(k): v for k, v in data["num_counter"].items()}),
            Counter({int(k): v for k, v in data["special_counter"].items()}),
            data["game_format"],
        )
    except Exception:
        return None


def _save_cache(jeu: str, num_counter: Counter, special_counter: Counter, game_format: str) -> None:
    try:
        _cache_path(jeu).write_text(
            json.dumps({
                "mtime_key": _csv_mtime_key(jeu),
                "num_counter": dict(num_counter),
                "special_counter": dict(special_counter),
                "game_format": game_format,
            }, ensure_ascii=False),
            encoding="utf-8",
        )
    except Exception:
        pass


# ── Data model ─────────────────────────────────────────────────────────────────

class JeuData:
    __slots__ = ("num_counter", "special_counter", "pair_counter", "game_format", "total", "file_stats")

    def __init__(
        self,
        num_counter: Counter,
        special_counter: Counter,
        pair_counter: Counter,
        game_format: str,
        total: int,
        file_stats: list[tuple[str, int]],
    ) -> None:
        self.num_counter = num_counter
        self.special_counter = special_counter
        self.pair_counter = pair_counter
        self.game_format = game_format
        self.total = total
        self.file_stats = file_stats  # [(relative_path, draw_count), ...]


# ── Loading ────────────────────────────────────────────────────────────────────

def load_jeu(jeu: str, fast: bool = False) -> JeuData | None:
    """
    Parse all CSVs for a game. With fast=True, tries the disk cache first —
    skips CSV re-parse and pair computation when cached data is fresh.
    """
    if fast:
        cached = _load_cache(jeu)
        if cached:
            num_counter, special_counter, game_format = cached
            return JeuData(num_counter, special_counter, Counter(), game_format,
                           sum(num_counter.values()) // 5, [])

    jeu_dir = DOWNLOADS_DIR / jeu
    if not jeu_dir.exists():
        return None
    csv_files = sorted(jeu_dir.glob("**/*.csv"))
    if not csv_files:
        return None

    num_counter: Counter = Counter()
    special_counter: Counter = Counter()
    pair_counter: Counter = Counter()
    game_format = ""
    file_stats: list[tuple[str, int]] = []
    total = 0

    for csv_path in csv_files:
        combos, specials, fmt = parse_csv(csv_path)
        for combo in combos:
            num_counter.update(combo)
            pair_counter.update(combinations(combo, 2))
        special_counter.update(specials)
        if game_format and fmt and fmt != game_format:
            print(f"  [warn] format incohérent dans {csv_path.name}: {fmt} != {game_format}", file=sys.stderr)
        if fmt:
            game_format = fmt
        total += len(combos)
        file_stats.append((str(csv_path.relative_to(DOWNLOADS_DIR)), len(combos)))

    if not num_counter:
        return None

    _save_cache(jeu, num_counter, special_counter, game_format)
    return JeuData(num_counter, special_counter, pair_counter, game_format, total, file_stats)


def print_jeu(data: JeuData, top_n: int) -> None:
    for rel_path, count in data.file_stats:
        print(f"  {rel_path}: {count} tirages")
    print(f"\n  {data.total} tirages au total")

    top_nums = [(f"{n:02d}", c) for n, c in data.num_counter.most_common(top_n)]
    print_table(f"Top {top_n} numéros les plus sortis:", top_nums, "Numéro", 10)

    if data.pair_counter:
        top_pairs = [
            (f"{a:02d} - {b:02d}", c)
            for (a, b), c in data.pair_counter.most_common(top_n)
        ]
        print_table(f"Top {top_n} paires les plus sorties:", top_pairs, "Paire", 10)


# ── Draw suggestions ───────────────────────────────────────────────────────────

def suggest_draw_data(
    num_counter: Counter,
    special_counter: Counter,
    game_format: str,
    power: float = 1.0,
    seed: int | None = None,
    count: int = 1,
) -> dict:
    """Return structured draw suggestions (used by --json and web server)."""
    if not num_counter:
        return {}

    deterministic_seed = seed if seed is not None else sum(n * c for n, c in num_counter.items())
    results: dict = {}

    random.seed(deterministic_seed)
    fixed = _make_draw(num_counter, special_counter, game_format, power)
    if fixed:
        results["fixed"] = fixed

    random.seed(None)
    randoms = [d for _ in range(count) if (d := _make_draw(num_counter, special_counter, game_format, power)) is not None]
    if randoms:
        results["random"] = randoms[0]  # backward-compatible single entry
        if count > 1:
            results["randoms"] = randoms

    return results


def suggest_draw(
    num_counter: Counter,
    special_counter: Counter,
    game_format: str,
    power: float = 1.0,
    seed: int | None = None,
    count: int = 1,
) -> None:
    if not num_counter:
        return

    print(f"\n  Tirages suggérés (pondérés par fréquence historique):")
    draws = suggest_draw_data(num_counter, special_counter, game_format, power, seed, count)

    def fmt_draw(label: str, d: dict) -> None:
        boules = d.get("boules", [])
        line = f"  {label} — Boules : {' - '.join(f'{n:02d}' for n in boules)}"
        if "chance" in d:
            line += f"  Chance : {d['chance']:02d}"
        elif "etoiles" in d:
            line += f"  Étoiles : {' - '.join(f'{n:02d}' for n in d['etoiles'])}"
        print(line)

    if "fixed" in draws:
        fmt_draw("Fixe     ", draws["fixed"])
    randoms_list = draws.get("randoms", [draws["random"]] if "random" in draws else [])
    for i, d in enumerate(randoms_list, 1):
        fmt_draw(f"Aléatoire {i}" if count > 1 else "Aléatoire", d)


# ── CLI ────────────────────────────────────────────────────────────────────────

def has_data(jeu: str) -> bool:
    jeu_dir = DOWNLOADS_DIR / jeu
    return jeu_dir.exists() and any(jeu_dir.glob("**/*.csv"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyse des tirages FDJ")
    parser.add_argument("--top", type=int, default=TOP_N, help=f"Nombre de résultats à afficher (défaut: {TOP_N})")
    parser.add_argument("--power", type=float, default=1.0, help="Exposant de pondération (1.0=linéaire, 2.0=fort, défaut: 1.0)")
    parser.add_argument("--refresh", action="store_true", help="Relance download.py avant l'analyse")
    parser.add_argument("--json", action="store_true", help="Sortie JSON structurée (pour le serveur web)")
    parser.add_argument("--draw-only", action="store_true", help="Sortie JSON des tirages uniquement (sans top_nums/top_specials), utilise le cache disque")
    parser.add_argument("--seed", type=int, default=None, help="Graine pour le tirage aléatoire (reproductibilité)")
    parser.add_argument("--jeu", choices=list(JEUX) + ["tous"], default="tous", help="Jeu à analyser (défaut: tous)")
    parser.add_argument("--count", type=int, default=1, help="Nombre de tirages aléatoires à générer (défaut: 1, max: 50)")
    args = parser.parse_args()

    if not (1 <= args.count <= 50):
        parser.error("--count doit être entre 1 et 50")

    jeux_selectionnes = list(JEUX) if args.jeu == "tous" else [args.jeu]
    json_mode = args.json or args.draw_only

    needs_download = args.refresh or not all(has_data(j) for j in jeux_selectionnes)
    if needs_download:
        print("Lancement du téléchargement...", file=sys.stderr)
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent / "download.py")],
            capture_output=False,
        )
        if result.returncode != 0:
            print("[!] download.py a échoué, abandon.", file=sys.stderr)
            sys.exit(1)

    output = {}

    for jeu in jeux_selectionnes:
        data = load_jeu(jeu, fast=args.draw_only)
        if data is None:
            if json_mode:
                output[jeu] = {"error": "no data"}
            else:
                print(f"  [!] Aucune donnée disponible pour {jeu}")
            continue

        if json_mode:
            draws = suggest_draw_data(data.num_counter, data.special_counter, data.game_format, args.power, args.seed, args.count)
            if args.draw_only:
                output[jeu] = {"game_format": data.game_format, "draws": draws}
            else:
                output[jeu] = {
                    "top_nums": list(data.num_counter.most_common(args.top)),
                    "top_specials": list(data.special_counter.most_common(args.top)),
                    "top_pairs": [
                        [a, b, c]
                        for (a, b), c in data.pair_counter.most_common(args.top)
                    ],
                    "game_format": data.game_format,
                    "draws": draws,
                }
        else:
            print(f"\n{'='*50}")
            print(f"  {jeu.upper()}")
            print(f"{'='*50}")
            print_jeu(data, args.top)
            suggest_draw(data.num_counter, data.special_counter, data.game_format, args.power, args.seed, args.count)

    if json_mode:
        print(json.dumps(output, ensure_ascii=False))


if __name__ == "__main__":
    main()
