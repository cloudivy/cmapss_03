"""
NASA CMAPSS Dataset Downloader & Setup
======================================
Downloads CMAPSSData.zip from NASA Open Data Portal (no login required)
and sets up the data directory for the MAS framework.

Usage:
    python data/setup_cmapss.py

Output:
    data/raw/          ← original .txt files from NASA
    data/processed/    ← cleaned CSVs with column names
"""

import os
import sys
import zipfile
import urllib.request
import pandas as pd

# ── Config ──────────────────────────────────────────────────────────────────
NASA_URL = (
    "https://data.nasa.gov/api/views/ff5v-kuh6/files/"
    "a9b1603b-ee69-4604-8b40-a2c1f459ef88?download=true&filename=CMAPSSData.zip"
)
BACKUP_URL = (
    "https://ti.arc.nasa.gov/c/6/"  # requires NASA account — fallback only
)

RAW_DIR       = os.path.join(os.path.dirname(__file__), "raw")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "processed")
ZIP_PATH      = os.path.join(RAW_DIR, "CMAPSSData.zip")

# 26 column names per NASA readme
COLUMN_NAMES = (
    ["unit", "cycle"]
    + [f"setting_{i}" for i in range(1, 4)]       # 3 operational settings
    + [f"s{i}" for i in range(1, 22)]              # 21 sensor measurements
)

# Human-readable sensor labels (from Saxena et al. 2008)
SENSOR_LABELS = {
    "s1":  "Fan inlet temperature (°R)",
    "s2":  "LPC outlet temperature (°R)",
    "s3":  "HPC outlet temperature (°R)",
    "s4":  "LPT outlet temperature (°R)",
    "s5":  "Fan inlet pressure (psia)",
    "s6":  "Bypass-duct pressure (psia)",
    "s7":  "HPC outlet pressure (psia)",
    "s8":  "Physical fan speed (rpm)",
    "s9":  "Physical core speed (rpm)",
    "s10": "Engine pressure ratio (–)",
    "s11": "HPC outlet static pressure (psia)",
    "s12": "Fuel flow ratio (pps/psia)",
    "s13": "Corrected fan speed (rpm)",
    "s14": "Corrected core speed (rpm)",
    "s15": "Bypass ratio (–)",
    "s16": "Burner fuel-air ratio (–)",
    "s17": "Bleed enthalpy (–)",
    "s18": "Required fan speed (rpm)",
    "s19": "Required fan conversion speed (rpm)",
    "s20": "High-pressure turbines cool air flow (lbm/s)",
    "s21": "Low-pressure turbines cool air flow (lbm/s)",
}

# Sensors that show meaningful degradation signal (from literature)
DIAGNOSTIC_SENSORS = ["s2", "s3", "s4", "s7", "s8", "s9", "s11", "s12",
                       "s13", "s14", "s15", "s17", "s20", "s21"]

SUBSETS = ["FD001", "FD002", "FD003", "FD004"]


# ── Helpers ─────────────────────────────────────────────────────────────────
def reporthook(block_num, block_size, total_size):
    downloaded = block_num * block_size
    if total_size > 0:
        pct = min(downloaded * 100 / total_size, 100)
        bar = "█" * int(pct / 2) + "░" * (50 - int(pct / 2))
        sys.stdout.write(f"\r  [{bar}] {pct:5.1f}%  ({downloaded/1e6:.1f} MB)")
        sys.stdout.flush()


def download_zip():
    os.makedirs(RAW_DIR, exist_ok=True)

    # If folder or txt files already present, skip download entirely
    folder_path = os.path.join(RAW_DIR, "CMAPSSData")
    if os.path.exists(folder_path) or os.path.exists(os.path.join(RAW_DIR, "train_FD001.txt")):
        print("✅  Data folder already present — skipping download")
        return

    # Check common locations where user may have placed the ZIP file
    candidate_paths = [
        ZIP_PATH,
        os.path.expanduser("~/Downloads/CMAPSSData.zip"),
        os.path.expanduser("~/Desktop/CMAPSSData.zip"),
        os.path.join(os.path.dirname(__file__), "CMAPSSData.zip"),
        os.path.join(os.path.dirname(__file__), "..", "CMAPSSData.zip"),
    ]
    for path in candidate_paths:
        if os.path.exists(path):
            if path != ZIP_PATH:
                import shutil
                print(f"✅  Found ZIP at: {path}")
                print(f"    Copying to:   {ZIP_PATH}")
                shutil.copy2(path, ZIP_PATH)
            else:
                print(f"✅  ZIP already exists: {ZIP_PATH}")
            return

    print("⬇️   Downloading CMAPSSData.zip from NASA Open Data Portal …")
    print(f"    URL: {NASA_URL}\n")
    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
        urllib.request.install_opener(opener)
        urllib.request.urlretrieve(NASA_URL, ZIP_PATH, reporthook)
        print(f"\n✅  Downloaded → {ZIP_PATH}")
    except Exception as e:
        print(f"\n❌  Download failed: {e}")
        print("\nManual download options:")
        print("  1. NASA Open Data Portal (no login):")
        print("     https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data")
        print("  2. Kaggle (free account):")
        print("     https://www.kaggle.com/datasets/behrad3d/nasa-cmaps")
        print(f"\n  Place CMAPSSData.zip in: {RAW_DIR}")
        sys.exit(1)


def extract_zip():
    # Check if txt files are already present (extracted folder placed manually)
    folder_path = os.path.join(RAW_DIR, "CMAPSSData")
    train_direct = os.path.join(RAW_DIR, "train_FD001.txt")
    train_in_folder = os.path.join(folder_path, "train_FD001.txt")

    if os.path.exists(train_direct):
        print("\n✅  Raw .txt files already present in raw/")
        return

    if os.path.exists(train_in_folder):
        print(f"\n📂  Found CMAPSSData folder — moving files to {RAW_DIR} …")
        import shutil
        for fname in os.listdir(folder_path):
            src = os.path.join(folder_path, fname)
            dst = os.path.join(RAW_DIR, fname)
            shutil.copy2(src, dst)
            print(f"    ✅  {fname}")
        return

    if not os.path.exists(ZIP_PATH):
        print(f"\n❌  No ZIP or data folder found in {RAW_DIR}")
        print("    Please place CMAPSSData.zip or the CMAPSSData folder inside:")
        print(f"    {RAW_DIR}")
        sys.exit(1)

    print("\n📦  Extracting ZIP …")
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        members = zf.namelist()
        print(f"    Files inside ZIP: {members}")
        zf.extractall(RAW_DIR)
    print(f"✅  Extracted to {RAW_DIR}")


def load_txt(path):
    """Load a CMAPSS space-separated .txt file into a DataFrame."""
    df = pd.read_csv(path, sep=r"\s+", header=None, names=COLUMN_NAMES)
    # Drop two trailing NaN columns that some files have
    df = df.dropna(axis=1, how="all")
    return df


def compute_rul(df):
    """Add RUL (Remaining Useful Life) column to training data."""
    max_cycle = df.groupby("unit")["cycle"].max().rename("max_cycle")
    df = df.merge(max_cycle, on="unit")
    df["rul"] = df["max_cycle"] - df["cycle"]
    df.drop(columns=["max_cycle"], inplace=True)
    return df


def add_anomaly_score(df):
    """
    Simple degradation-based anomaly score 0–100.
    Uses normalised RUL: score = 100 * (1 - RUL / max_RUL_for_unit)
    Only valid for training data that has RUL column.
    """
    if "rul" not in df.columns:
        df["anomaly_score"] = 0
        return df
    max_rul = df.groupby("unit")["rul"].max()
    df["anomaly_score"] = df.apply(
        lambda r: round(100 * (1 - r["rul"] / max_rul[r["unit"]])), axis=1
    )
    return df


def process_subset(subset):
    print(f"\n  Processing {subset} …")
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    # ── Training data ──
    train_path = os.path.join(RAW_DIR, f"train_{subset}.txt")
    if not os.path.exists(train_path):
        print(f"    ⚠️  {train_path} not found — skipping")
        return

    train_df = load_txt(train_path)
    train_df = compute_rul(train_df)
    train_df = add_anomaly_score(train_df)
    train_out = os.path.join(PROCESSED_DIR, f"train_{subset}.csv")
    train_df.to_csv(train_out, index=False)
    print(f"    ✅  train: {len(train_df):,} rows × {len(train_df.columns)} cols → {train_out}")

    # ── Test data ──
    test_path = os.path.join(RAW_DIR, f"test_{subset}.txt")
    rul_path  = os.path.join(RAW_DIR, f"RUL_{subset}.txt")

    if os.path.exists(test_path):
        test_df = load_txt(test_path)

        # Attach ground-truth RUL if available
        if os.path.exists(rul_path):
            rul_df = pd.read_csv(rul_path, sep=r"\s+", header=None, names=["true_rul"])
            # RUL file has one row per engine (last cycle only)
            max_cycles = test_df.groupby("unit")["cycle"].max().reset_index()
            max_cycles["true_rul"] = rul_df["true_rul"].values
            test_df = test_df.merge(max_cycles[["unit", "true_rul"]], on="unit", how="left")

        test_out = os.path.join(PROCESSED_DIR, f"test_{subset}.csv")
        test_df.to_csv(test_out, index=False)
        print(f"    ✅  test:  {len(test_df):,} rows × {len(test_df.columns)} cols → {test_out}")


def print_summary():
    print("\n" + "═" * 60)
    print("  NASA CMAPSS — Dataset Summary")
    print("═" * 60)
    print(f"  {'Subset':<8} {'Engines':<10} {'Cycles':<12} {'Fault Modes'}")
    print(f"  {'──────':<8} {'───────':<10} {'──────':<12} {'───────────'}")

    meta = {
        "FD001": (100,  "HPC Degradation",              "1 condition"),
        "FD002": (260,  "HPC Degradation",              "6 conditions"),
        "FD003": (100,  "HPC + Fan Degradation",        "1 condition"),
        "FD004": (248,  "HPC + Fan Degradation",        "6 conditions"),
    }

    for subset, (engines, fault, cond) in meta.items():
        path = os.path.join(PROCESSED_DIR, f"train_{subset}.csv")
        if os.path.exists(path):
            df = pd.read_csv(path)
            cycles = len(df)
            print(f"  {subset:<8} {engines:<10} {cycles:<12,} {fault}  ({cond})")

    print("\n  Key sensors for fault detection:")
    for s in DIAGNOSTIC_SENSORS[:7]:
        print(f"    {s:<5} → {SENSOR_LABELS[s]}")
    print(f"    … and {len(DIAGNOSTIC_SENSORS)-7} more")

    print("\n  Processed files:")
    for f in sorted(os.listdir(PROCESSED_DIR)):
        size = os.path.getsize(os.path.join(PROCESSED_DIR, f))
        print(f"    {f:<30} {size/1e6:.1f} MB")

    print("\n  Framework integration:")
    print("    python simulate.py --dataset cmapss --subset FD001")
    print("    python simulate.py --dataset cmapss --subset FD001 --dry-run")
    print("═" * 60)


# ── Main ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("╔══════════════════════════════════════════════════════════╗")
    print("║       NASA CMAPSS Dataset Setup for MAS Framework       ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    download_zip()
    extract_zip()

    print("\n🔄  Processing all 4 subsets …")
    for subset in SUBSETS:
        process_subset(subset)

    print_summary()
    print("\n✅  Setup complete! Run: python simulate.py --dataset cmapss --subset FD001")
