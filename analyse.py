import subprocess
import sys
import csv
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


def weighted_sample(counter: Counter, k: int) -> list[int]:
    """Tirage pondéré sans remise basé sur les fréquences."""
    population = list(counter.keys())
    weights = [counter[n] for n in population]
    selected = []
    for _ in range(k):
        total = sum(weights)
        r = random.uniform(0, total)
        cumsum = 0
        for i, w in enumerate(weights):
            cumsum += w
            if cumsum >= r:
                selected.append(population[i])
                population.pop(i)
                weights.pop(i)
                break
    return sorted(selected)


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


def suggest_draw(num_counter: Counter, special_counter: Counter, game_format: str) -> None:
    if not num_counter:
        return

    print(f"\n  Tirage suggéré (pondéré par fréquence historique):")

    if game_format == "5boules+chance":
        boules = weighted_sample(num_counter, 5)
        chance = weighted_sample(special_counter, 1) if special_counter else [random.randint(1, 10)]
        print(f"  Boules  : {' - '.join(f'{n:02d}' for n in boules)}")
        print(f"  Chance  : {chance[0]:02d}")

    else:  # 5boules+2etoiles ou 5boules
        boules = weighted_sample(num_counter, 5)
        print(f"  Boules  : {' - '.join(f'{n:02d}' for n in boules)}")
        if special_counter:
            etoiles = weighted_sample(special_counter, 2)
            print(f"  Étoiles : {' - '.join(f'{n:02d}' for n in etoiles)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyse des tirages FDJ")
    parser.add_argument("--top", type=int, default=TOP_N, help=f"Nombre de résultats à afficher (défaut: {TOP_N})")
    args = parser.parse_args()

    print("Lancement du téléchargement...")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "download.py")],
        capture_output=False,
    )
    if result.returncode != 0:
        print("[!] download.py a échoué, abandon.")
        sys.exit(1)

    for jeu in ("loto", "euromillions"):
        print(f"\n{'='*50}")
        print(f"  {jeu.upper()}")
        print(f"{'='*50}")
        num_counter, special_counter, game_format = analyse_jeu(jeu, args.top)
        suggest_draw(num_counter, special_counter, game_format)


if __name__ == "__main__":
    main()
