import contextlib
import io
import subprocess
import sys
import csv
import json
import math
import heapq
import random
import argparse
from collections import Counter
from pathlib import Path

DOWNLOADS_DIR = Path(__file__).parent / "downloads"
TOP_N = 10
JEUX = ("loto", "euromillions")


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


def parse_csv(path: Path) -> tuple[list[tuple], list[int]]:
    combos, specials = [], []
    try:
        with open(path, encoding="latin-1") as f:
            reader = csv.DictReader(f, delimiter=";")
            headers = reader.fieldnames or []
            cols = detect_ball_columns(headers)
            spec_cols = detect_special_columns(headers)
            for row in reader:
                try:
                    nums = []
                    for c in cols:
                        raw = row.get(c, "").strip()
                        if not raw.lstrip("-").isdigit():
                            break
                        val = int(raw)
                        if val <= 0:
                            break
                        nums.append(val)
                    if len(nums) != len(cols):
                        continue
                    nums_tuple = tuple(sorted(nums))
                    if len(set(nums_tuple)) != len(nums_tuple):
                        continue  # duplicate ball numbers in source row
                    combos.append(nums_tuple)
                    for sc in spec_cols:
                        raw = row.get(sc, "").strip()
                        if raw.lstrip("-").isdigit():
                            v = int(raw)
                            if v > 0:
                                specials.append(v)
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        print(f"  [warn] {path.name}: {e}")
    return combos, specials


def csv_game_format(path: Path) -> str:
    try:
        with open(path, encoding="latin-1") as f:
            headers = f.readline().strip().split(";")
        if "etoile_1" in headers:
            return "5boules+2etoiles"
        if "numero_chance" in headers:
            return "5boules+chance"
    except Exception:
        pass
    return "5boules"


def weighted_sample(counter: Counter, k: int, power: float = 1.0) -> list[int]:
    """Tirage pondéré sans remise (Efraimidis–Spirakis, O(n log k))."""
    available = [(n, c) for n, c in counter.items() if (c ** power if power != 1.0 else c) > 0]
    if len(available) < k:
        raise ValueError(f"weighted_sample: requested {k} items but only {len(available)} eligible entries")
    heap: list[tuple[float, int]] = []
    for n, c in available:
        w = c ** power if power != 1.0 else c
        # clé = log(U)/w (équivalent monotone à U^(1/w), stable numériquement)
        # 1.0 - random.random() ∈ (0.0, 1.0] → log toujours défini (évite log(0))
        key = math.log(1.0 - random.random()) / w
        if len(heap) < k:
            heapq.heappush(heap, (key, n))
        elif key > heap[0][0]:
            heapq.heapreplace(heap, (key, n))
    return sorted(n for _, n in heap)


def print_table(title: str, items: list, col1: str, col1_width: int) -> None:
    print(f"\n  {title}")
    print(f"  {'Rang':<5} {col1:<{col1_width}} {'Occurrences':>10}")
    print(f"  {'-'*5} {'-'*col1_width} {'-'*10}")
    for i, (val, count) in enumerate(items, 1):
        print(f"  {i:<5} {val:<{col1_width}} {count:>10}")


def analyse_jeu(jeu: str, top_n: int) -> tuple[Counter, Counter, str]:
    jeu_dir = DOWNLOADS_DIR / jeu
    if not jeu_dir.exists():
        print(f"[!] Dossier introuvable: {jeu_dir}")
        return Counter(), Counter(), ""
    combo_counter: Counter = Counter()
    num_counter: Counter = Counter()
    special_counter: Counter = Counter()
    game_format = ""

    csv_files = sorted(jeu_dir.glob("**/*.csv"))
    if not csv_files:
        print(f"[!] Aucun CSV trouvé dans {jeu_dir}")
        return Counter(), Counter(), ""

    for csv_path in csv_files:
        combos, specials = parse_csv(csv_path)
        combo_counter.update(combos)
        for combo in combos:
            num_counter.update(combo)
        special_counter.update(specials)
        fmt = csv_game_format(csv_path)
        if game_format and fmt and fmt != game_format:
            print(f"  [warn] format incohérent dans {csv_path.name}: {fmt} != {game_format}")
        if fmt:
            game_format = fmt
        print(f"  {csv_path.relative_to(DOWNLOADS_DIR)}: {len(combos)} tirages")

    total = sum(combo_counter.values())
    print(f"\n  {total} tirages au total")

    top_nums = [(f"{n:02d}", count) for n, count in num_counter.most_common(top_n)]
    print_table(f"Top {top_n} numéros les plus sortis:", top_nums, "Numéro", 10)

    return num_counter, special_counter, game_format


def suggest_draw_data(num_counter: Counter, special_counter: Counter, game_format: str, power: float = 1.0, seed: int | None = None) -> dict:
    """Return structured draw suggestions (used by --json and web server)."""
    if not num_counter:
        return {}

    deterministic_seed = seed if seed is not None else sum(n * c for n, c in num_counter.items())
    results = {}

    for label, s in (("fixed", deterministic_seed), ("random", None)):
        random.seed(s)
        try:
            boules = weighted_sample(num_counter, 5, power)
        except ValueError as e:
            print(f"  [warn] {label}: {e}", file=sys.stderr)
            continue
        if game_format == "5boules+chance":
            try:
                chance = weighted_sample(special_counter, 1, power) if special_counter else [random.randint(1, 10)]
            except ValueError as e:
                print(f"  [warn] {label} chance: {e}", file=sys.stderr)
                continue
            results[label] = {"boules": boules, "chance": chance[0]}
        else:
            entry: dict = {"boules": boules}
            if special_counter:
                try:
                    entry["etoiles"] = weighted_sample(special_counter, 2, power)
                except ValueError as e:
                    print(f"  [warn] {label} etoiles: {e}", file=sys.stderr)
            results[label] = entry

    return results


def suggest_draw(num_counter: Counter, special_counter: Counter, game_format: str, power: float = 1.0, seed: int | None = None) -> None:
    if not num_counter:
        return

    print(f"\n  Tirages suggérés (pondérés par fréquence historique):")
    draws = suggest_draw_data(num_counter, special_counter, game_format, power, seed)

    labels = {"fixed": "Fixe     ", "random": "Aléatoire"}
    for key, label in labels.items():
        d = draws.get(key, {})
        boules = d.get("boules", [])
        line = f"  {label} — Boules : {' - '.join(f'{n:02d}' for n in boules)}"
        if "chance" in d:
            line += f"  Chance : {d['chance']:02d}"
        elif "etoiles" in d:
            line += f"  Étoiles : {' - '.join(f'{n:02d}' for n in d['etoiles'])}"
        print(line)


def has_data(jeu: str) -> bool:
    jeu_dir = DOWNLOADS_DIR / jeu
    return jeu_dir.exists() and any(jeu_dir.glob("**/*.csv"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyse des tirages FDJ")
    parser.add_argument("--top", type=int, default=TOP_N, help=f"Nombre de résultats à afficher (défaut: {TOP_N})")
    parser.add_argument("--power", type=float, default=1.0, help="Exposant de pondération (1.0=linéaire, 2.0=fort, défaut: 1.0)")
    parser.add_argument("--refresh", action="store_true", help="Relance download.py avant l'analyse")
    parser.add_argument("--json", action="store_true", help="Sortie JSON structurée (pour le serveur web)")
    parser.add_argument("--draw-only", action="store_true", help="Sortie JSON des tirages uniquement (sans top_nums/top_specials)")
    parser.add_argument("--seed", type=int, default=None, help="Graine pour le tirage aléatoire (reproductibilité)")
    parser.add_argument("--jeu", choices=list(JEUX) + ["tous"], default="tous", help="Jeu à analyser (défaut: tous)")
    args = parser.parse_args()

    jeux_selectionnes = list(JEUX) if args.jeu == "tous" else [args.jeu]

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
    json_mode = args.json or args.draw_only

    for jeu in jeux_selectionnes:
        if json_mode:
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                num_counter, special_counter, game_format = analyse_jeu(jeu, args.top)
            if not num_counter:
                output[jeu] = {"error": "no data"}
                continue
            draws = suggest_draw_data(num_counter, special_counter, game_format, args.power, args.seed)
            if args.draw_only:
                output[jeu] = {
                    "game_format": game_format,
                    "draws": draws,
                }
            else:
                output[jeu] = {
                    "top_nums": [(n, c) for n, c in num_counter.most_common(args.top)],
                    "top_specials": [(n, c) for n, c in special_counter.most_common(args.top)],
                    "game_format": game_format,
                    "draws": draws,
                }
        else:
            print(f"\n{'='*50}")
            print(f"  {jeu.upper()}")
            print(f"{'='*50}")
            num_counter, special_counter, game_format = analyse_jeu(jeu, args.top)
            if not num_counter:
                print(f"  [!] Aucune donnée disponible pour {jeu}")
                continue
            suggest_draw(num_counter, special_counter, game_format, args.power, args.seed)

    if json_mode:
        print(json.dumps(output, ensure_ascii=False))


if __name__ == "__main__":
    main()
