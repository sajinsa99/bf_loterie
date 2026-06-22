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


def detect_ball_columns(headers: list[str]) -> list[str]:
    return ["boule_1", "boule_2", "boule_3", "boule_4", "boule_5"]


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
                    nums = tuple(sorted(int(row[c]) for c in cols if row.get(c, "").strip().lstrip("-").isdigit()))
                    if len(nums) == len(cols):
                        combos.append(nums)
                        for sc in spec_cols:
                            val = row.get(sc, "").strip().lstrip("-")
                            if val.isdigit():
                                specials.append(int(val))
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
    heap: list[tuple[float, int]] = []
    for n, c in counter.items():
        w = c ** power if power != 1.0 else c
        if w <= 0:
            continue
        # clé = log(U)/w (équivalent monotone à U^(1/w), stable numériquement)
        key = math.log(random.random()) / w
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
        game_format = csv_game_format(csv_path)
        print(f"  {csv_path.relative_to(DOWNLOADS_DIR)}: {len(combos)} tirages")

    total = sum(combo_counter.values())
    print(f"\n  {total} tirages au total")

    top_combos = [
        (" - ".join(f"{n:02d}" for n in combo), count)
        for combo, count in combo_counter.most_common(top_n)
    ]
    print_table(f"Top {top_n} combinaisons les plus sorties:", top_combos, "Combinaison", 35)

    top_nums = [(f"{n:02d}", count) for n, count in num_counter.most_common(top_n)]
    print_table(f"Top {top_n} numéros les plus sortis:", top_nums, "Numéro", 10)

    return num_counter, special_counter, game_format


def suggest_draw_data(num_counter: Counter, special_counter: Counter, game_format: str, power: float = 1.0) -> dict:
    """Return structured draw suggestions (used by --json and web server)."""
    if not num_counter:
        return {}

    seed = sum(n * c for n, c in num_counter.items())
    results = {}

    for label, s in (("fixed", seed), ("random", None)):
        random.seed(s)
        boules = weighted_sample(num_counter, 5, power)
        if game_format == "5boules+chance":
            chance = weighted_sample(special_counter, 1, power) if special_counter else [random.randint(1, 10)]
            results[label] = {"boules": boules, "chance": chance[0]}
        else:
            entry: dict = {"boules": boules}
            if special_counter:
                entry["etoiles"] = weighted_sample(special_counter, 2, power)
            results[label] = entry

    return results


def suggest_draw(num_counter: Counter, special_counter: Counter, game_format: str, power: float = 1.0) -> None:
    if not num_counter:
        return

    print(f"\n  Tirages suggérés (pondérés par fréquence historique):")
    draws = suggest_draw_data(num_counter, special_counter, game_format, power)

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


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyse des tirages FDJ")
    parser.add_argument("--top", type=int, default=TOP_N, help=f"Nombre de résultats à afficher (défaut: {TOP_N})")
    parser.add_argument("--power", type=float, default=1.0, help="Exposant de pondération (1.0=linéaire, 2.0=fort, défaut: 1.0)")
    parser.add_argument("--refresh", action="store_true", help="Relance download.py avant l'analyse")
    parser.add_argument("--json", action="store_true", help="Sortie JSON structurée (pour le serveur web)")
    parser.add_argument("--draw-only", action="store_true", help="Ne recalcule que les tirages (implique --json)")
    args = parser.parse_args()

    if args.refresh or not DOWNLOADS_DIR.exists():
        print("Lancement du téléchargement...", file=sys.stderr)
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent / "download.py")],
            capture_output=False,
        )
        if result.returncode != 0:
            print("[!] download.py a échoué, abandon.", file=sys.stderr)
            sys.exit(1)

    output = {}
    for jeu in ("loto", "euromillions"):
        if args.json or args.draw_only:
            import io, contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                num_counter, special_counter, game_format = analyse_jeu(jeu, args.top)
            draws = suggest_draw_data(num_counter, special_counter, game_format, args.power)
            top_nums = [(n, c) for n, c in num_counter.most_common(args.top)]
            top_specials = [(n, c) for n, c in special_counter.most_common(args.top)]
            output[jeu] = {
                "top_nums": top_nums,
                "top_specials": top_specials,
                "game_format": game_format,
                "draws": draws,
            }
        else:
            print(f"\n{'='*50}")
            print(f"  {jeu.upper()}")
            print(f"{'='*50}")
            num_counter, special_counter, game_format = analyse_jeu(jeu, args.top)
            suggest_draw(num_counter, special_counter, game_format, args.power)

    if args.json or args.draw_only:
        print(json.dumps(output, ensure_ascii=False))


if __name__ == "__main__":
    main()
