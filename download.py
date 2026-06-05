import json
import shutil
import zipfile
import urllib.request
from pathlib import Path

URLS_FILE = Path(__file__).parent / "urls.json"
DOWNLOAD_DIR = Path(__file__).parent / "downloads"


def safe_extract(zip_path: Path, dest_dir: Path) -> None:
    """Extrait le zip sans écraser les fichiers existants."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            target = dest_dir / member.filename
            if target.exists():
                print(f"  [skip] {member.filename} existe déjà")
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            zf.extract(member, dest_dir)
            print(f"  [ok]   {member.filename}")


def download(url: str, dest: Path) -> bool:
    """Télécharge url vers dest. Retourne False si déjà présent."""
    if dest.exists():
        print(f"[skip] {dest.name} déjà téléchargé")
        return False
    print(f"[dl]   {dest.name} ...", end=" ", flush=True)
    urllib.request.urlretrieve(url, dest)
    print("ok")
    return True


def main() -> None:
    DOWNLOAD_DIR.mkdir(exist_ok=True)

    with open(URLS_FILE, encoding="utf-8") as f:
        data = json.load(f)

    for jeu, entrees in data.items():
        jeu_dir = DOWNLOAD_DIR / jeu
        jeu_dir.mkdir(exist_ok=True)
        print(f"\n=== {jeu} ===")

        for entree in entrees:
            zip_path = jeu_dir / entree["fichier"]
            extract_dir = jeu_dir / zip_path.stem

            if extract_dir.exists():
                print(f"[rm]   {extract_dir.relative_to(DOWNLOAD_DIR.parent)}")
                shutil.rmtree(extract_dir)

            download(entree["url"], zip_path)

            extract_dir.mkdir(exist_ok=True)
            print(f"  Extraction dans {extract_dir.relative_to(DOWNLOAD_DIR.parent)} ...")
            safe_extract(zip_path, extract_dir)

            zip_path.unlink()
            print(f"  [rm]   {zip_path.name}")


if __name__ == "__main__":
    main()
