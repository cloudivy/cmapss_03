"""
NASA CMAPSS → MAS Framework Data Loader
========================================
Converts CMAPSS processed CSVs into the same equipment/sensor
format the existing MAS agents already understand.

Each CMAPSS engine unit becomes one "equipment" object with:
  - equipment_id  : e.g. "ENG-001"
  - sensors       : mapped to the 14 diagnostic sensors
  - anomaly_score : 0–100 based on RUL degradation
  - anomaly_level : NORMAL / WARNING / CRITICAL
  - true_rul      : ground truth remaining useful life (cycles)

Failure mode taxonomy (from Saxena et al. 2008 + literature):
  HPC_DEG  — HPC outlet temperature/pressure degradation
             (FD001, FD002, FD003, FD004)
  FAN_DEG  — Fan speed / bypass-ratio degradation
             (FD003, FD004 only)
"""

import os
import pandas as pd
import numpy as np
from typing import Optional

# ── Paths ───────────────────────────────────────────────────────────────────
_BASE = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(_BASE, "processed")

# ── Sensor Definitions ──────────────────────────────────────────────────────
# 14 diagnostic sensors (constant sensors s1,s5,s6,s10,s16,s18,s19 excluded)
DIAGNOSTIC_SENSORS = ["s2", "s3", "s4", "s7", "s8", "s9",
                       "s11", "s12", "s13", "s14", "s15", "s17", "s20", "s21"]

SENSOR_META = {
    "s2":  {"label": "LPC Outlet Temp",       "unit": "°R",    "normal_range": (641.0,  644.0)},
    "s3":  {"label": "HPC Outlet Temp",        "unit": "°R",    "normal_range": (1585.0, 1592.0)},
    "s4":  {"label": "LPT Outlet Temp",        "unit": "°R",    "normal_range": (1400.0, 1415.0)},
    "s7":  {"label": "HPC Outlet Pressure",    "unit": "psia",  "normal_range": (549.0,  554.0)},
    "s8":  {"label": "Physical Fan Speed",     "unit": "rpm",   "normal_range": (2385.0, 2390.0)},
    "s9":  {"label": "Physical Core Speed",    "unit": "rpm",   "normal_range": (9050.0, 9070.0)},
    "s11": {"label": "HPC Static Pressure",    "unit": "psia",  "normal_range": (47.0,   48.5)},
    "s12": {"label": "Fuel Flow Ratio",        "unit": "pps/psia", "normal_range": (521.0, 524.0)},
    "s13": {"label": "Corrected Fan Speed",    "unit": "rpm",   "normal_range": (2387.0, 2395.0)},
    "s14": {"label": "Corrected Core Speed",   "unit": "rpm",   "normal_range": (8140.0, 8160.0)},
    "s15": {"label": "Bypass Ratio",           "unit": "–",     "normal_range": (8.40,   8.50)},
    "s17": {"label": "Bleed Enthalpy",         "unit": "–",     "normal_range": (391.0,  396.0)},
    "s20": {"label": "HP Turbine Cool Air",    "unit": "lbm/s", "normal_range": (38.7,   39.2)},
    "s21": {"label": "LP Turbine Cool Air",    "unit": "lbm/s", "normal_range": (23.1,   23.5)},
}

# Sensors driving HPC degradation vs Fan degradation
HPC_SENSORS = ["s3", "s4", "s7", "s11", "s12"]
FAN_SENSORS  = ["s2", "s8", "s13", "s15"]

# RUL thresholds → anomaly level
RUL_CRITICAL = 30    # < 30 cycles remaining → CRITICAL
RUL_WARNING  = 100   # < 100 cycles remaining → WARNING


# ── Core Loader ─────────────────────────────────────────────────────────────
def load_subset(subset: str = "FD001", split: str = "train") -> pd.DataFrame:
    """
    Load a processed CMAPSS subset.

    Args:
        subset: "FD001" | "FD002" | "FD003" | "FD004"
        split:  "train" | "test"

    Returns:
        DataFrame with all 26 cols + rul + anomaly_score (train only)
    """
    path = os.path.join(PROCESSED_DIR, f"{split}_{subset}.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Processed data not found: {path}\n"
            f"Run first: python data/setup_cmapss.py"
        )
    return pd.read_csv(path)


def get_latest_cycle(df: pd.DataFrame) -> pd.DataFrame:
    """Return only the last observed cycle per engine unit."""
    return df.sort_values("cycle").groupby("unit").last().reset_index()


def sensor_status(sensor: str, value: float) -> str:
    """Return NORMAL / WARNING / CRITICAL based on normal_range bounds."""
    lo, hi = SENSOR_META[sensor]["normal_range"]
    margin = (hi - lo) * 0.5   # 50% beyond range = WARNING band
    if lo - margin <= value <= hi + margin:
        return "NORMAL"
    elif lo - margin * 2 <= value <= hi + margin * 2:
        return "WARNING"
    else:
        return "CRITICAL"


def rul_to_anomaly(rul: float) -> tuple[int, str]:
    """Convert RUL (cycles) to (score 0-100, anomaly_level string)."""
    if rul <= RUL_CRITICAL:
        score = min(100, int(100 - rul))
        return score, "CRITICAL"
    elif rul <= RUL_WARNING:
        score = int(50 + (RUL_WARNING - rul) / (RUL_WARNING - RUL_CRITICAL) * 50)
        return score, "WARNING"
    else:
        score = max(0, int(50 * (1 - (rul - RUL_WARNING) / 500)))
        return score, "NORMAL"


def infer_fault_mode(row: pd.Series, subset: str) -> str:
    """
    Infer active fault mode(s) from sensor deviations.
    FD001/FD002 → HPC degradation only
    FD003/FD004 → HPC + Fan degradation
    """
    faults = []

    # HPC degradation: rising s3, s4; falling s7, s11
    hpc_deviation = (
        (row["s3"] > SENSOR_META["s3"]["normal_range"][1]) or
        (row["s4"] > SENSOR_META["s4"]["normal_range"][1]) or
        (row["s7"] < SENSOR_META["s7"]["normal_range"][0]) or
        (row["s11"] < SENSOR_META["s11"]["normal_range"][0])
    )
    if hpc_deviation:
        faults.append("HPC_DEG")

    # Fan degradation (FD003/FD004 only)
    if subset in ("FD003", "FD004"):
        fan_deviation = (
            (row["s8"] < SENSOR_META["s8"]["normal_range"][0]) or
            (row["s13"] < SENSOR_META["s13"]["normal_range"][0]) or
            (row["s15"] < SENSOR_META["s15"]["normal_range"][0])
        )
        if fan_deviation:
            faults.append("FAN_DEG")

    return "+".join(faults) if faults else "NOMINAL"


# ── Equipment Builder ────────────────────────────────────────────────────────
def build_equipment_list(
    subset:    str = "FD001",
    split:     str = "train",
    n:         int = 3,
    seed:      Optional[int] = 42,
    min_rul:   Optional[int] = None,
    max_rul:   Optional[int] = None,
) -> list[dict]:
    """
    Build a list of equipment dicts compatible with the MAS agent format.

    Args:
        subset:  CMAPSS subset (FD001–FD004)
        split:   "train" | "test"
        n:       number of engines to return (default 3, like CNC framework)
        seed:    random seed for engine selection
        min_rul: only select engines with RUL >= min_rul
        max_rul: only select engines with RUL <= max_rul

    Returns:
        List of equipment dicts (same schema as existing MAS framework)
    """
    df = load_subset(subset, split)
    latest = get_latest_cycle(df)

    # Filter by RUL if requested
    if "rul" in latest.columns:
        if min_rul is not None:
            latest = latest[latest["rul"] >= min_rul]
        if max_rul is not None:
            latest = latest[latest["rul"] <= max_rul]

    # Sample n engines
    rng = np.random.default_rng(seed)
    sample = latest.sample(n=min(n, len(latest)), random_state=int(rng.integers(0, 9999)))

    equipment_list = []
    for _, row in sample.iterrows():
        unit_id = int(row["unit"])
        eq_id   = f"ENG-{unit_id:03d}"

        rul = float(row["rul"]) if "rul" in row else None
        true_rul = float(row.get("true_rul", rul or 0))
        anomaly_score, anomaly_level = rul_to_anomaly(true_rul if true_rul else 0)
        fault_mode = infer_fault_mode(row, subset)

        # Build sensor readings in MAS schema
        sensors = {}
        for s in DIAGNOSTIC_SENSORS:
            val    = float(row[s])
            meta   = SENSOR_META[s]
            status = sensor_status(s, val)
            sensors[s] = {
                "value":        round(val, 4),
                "unit":         meta["unit"],
                "label":        meta["label"],
                "status":       status,
                "normal_range": meta["normal_range"],
            }

        equipment_list.append({
            "equipment_id":   eq_id,
            "name":           f"Turbofan Engine {unit_id}",
            "type":           "turbofan_engine",
            "dataset":        f"NASA CMAPSS {subset}",
            "operating_hours": int(row["cycle"]) * 1,   # 1 cycle ≈ 1 flight hour
            "product_type":   subset,                   # FD001 / FD002 / etc.
            "location":       f"Bay-{(unit_id % 5) + 1}",
            "sensors":        sensors,
            "anomaly_score":  anomaly_score,
            "anomaly_level":  anomaly_level,
            "rul_cycles":     round(true_rul) if true_rul is not None else "unknown",
            "fault_mode":     fault_mode,
            "cycle":          int(row["cycle"]),
            "op_setting_1":   round(float(row["setting_1"]), 4),
            "op_setting_2":   round(float(row["setting_2"]), 4),
            "op_setting_3":   round(float(row["setting_3"]), 4),
        })

    return equipment_list


# ── Quick preview ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Loading NASA CMAPSS FD001 — sampling 3 engines …\n")
    try:
        engines = build_equipment_list(subset="FD001", n=3, seed=42)
        for eq in engines:
            rul   = eq["rul_cycles"]
            score = eq["anomaly_score"]
            level = eq["anomaly_level"]
            fault = eq["fault_mode"]
            print(f"  {eq['equipment_id']}  cycle={eq['cycle']:>4}  "
                  f"RUL={rul:>4} cycles  score={score:>3}/100  "
                  f"[{level:<8}]  fault={fault}")
            for s in ["s3", "s4", "s7", "s8"]:
                sv = eq["sensors"][s]
                print(f"    {sv['label']:<28} {sv['value']:>9.3f} {sv['unit']:<8} [{sv['status']}]")
            print()
    except FileNotFoundError as e:
        print(f"❌  {e}")
