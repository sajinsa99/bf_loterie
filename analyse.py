import subprocess
import sys
import csv
from collections import Counter
from pathlib import Path

DOWNLOADS_DIR = Path(__file__).parent / "downloads"
TOP_N = 10


def detect_ball_columns(headers: list[str]) -> list[str]:
    """Retourne les colonnes des boules principales selon le format du CSV."""
    if "boule_6" in headers:
        return ["boule_1", "boule_2", "boule_3", "boule_4", "boule_5", "boule_6"]
    if "etoile_1" in headers:
        return ["boule_1", "boule_2", "boule_3", "boule_4", "boule_5"]
    return ["boule_1", "boule_2", "boule_3", "boule_4", "boule_5"]


def parse_csv(path: Path) -> list[tuple]:
    combos = []
    try:
        with open(path, encoding="latin-1") as f:
            reader = csv.DictReader(f, delimiter=";")
            headers = reader.fieldnames or []
            cols = detect_ball_columns(headers)
            for row in reader:
                try:
                    nums = tuple(sorted(int(row[c]) for c in cols if row.get(c, "").strip().lstrip("-").isdigit()))
                    if len(nums) == len(cols):
                        combos.append(nums)
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        print(f"  [warn] {path.name}: {e}")
    return combos


def print_table(title: str, items: list, col1: str, col1_width: int) -> None:
    print(f"\n  {title}")
    print(f"  {'Rang':<5} {col1:<{col1_width}} {'Occurrences':>10}")
    print(f"  {'-'*5} {'-'*col1_width} {'-'*10}")
    for i, (val, count) in enumerate(items, 1):
        print(f"  {i:<5} {val:<{col1_width}} {count:>10}")


def analyse_jeu(jeu: str) -> None:
    jeu_dir = DOWNLOADS_DIR / jeu
    if not jeu_dir.exists():
        print(f"[!] Dossier introuvable: {jeu_dir}")
        return

    combo_counter: Counter = Counter()
    num_counter: Counter = Counter()
    csv_files = sorted(jeu_dir.glob("**/*.csv"))
    if not csv_files:
        print(f"[!] Aucun CSV trouvé dans {jeu_dir}")
        return

    for csv_path in csv_files:
        combos = parse_csv(csv_path)
        combo_counter.update(combos)
        for combo in combos:
            num_counter.update(combo)
        print(f"  {csv_path.relative_to(DOWNLOADS_DIR)}: {len(combos)} tirages")

    total = sum(combo_counter.values())
    print(f"\n  {total} tirages au total")

    top_combos = [
        (" - ".join(f"{n:02d}" for n in combo), count)
        for combo, count in combo_counter.most_common(TOP_N)
    ]
    print_table(f"Top {TOP_N} combinaisons les plus sorties:", top_combos, "Combinaison", 35)

    top_nums = [(f"{n:02d}", count) for n, count in num_counter.most_common(TOP_N)]
    print_table(f"Top {TOP_N} numéros les plus sortis:", top_nums, "Numéro", 10)


def main() -> None:
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
        analyse_jeu(jeu)


if __name__ == "__main__":
    main()
