"""
CMAPSS → MAS Framework Adapter
================================
Injects NASA CMAPSS engine data into the existing sensor_tools module
so the existing agents (SensorMonitor, Diagnosis, Maintenance) work
unchanged with real NASA data.

Usage (called by simulate.py when --dataset cmapss is used):
    from tools.cmapss_adapter import inject_cmapss_data
    inject_cmapss_data(subset="FD001", n=3, seed=42)
    # After this, get_equipment_list() and get_sensor_readings() return CMAPSS data
"""

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from data.cmapss_loader import (
    build_equipment_list,
    DIAGNOSTIC_SENSORS,
    SENSOR_META,
    rul_to_anomaly,
)
import tools.sensor_tools as _st

# ── Internal state ──────────────────────────────────────────────────────────
_CMAPSS_EQUIPMENT: list[dict] = []
_CMAPSS_ACTIVE = False


def inject_cmapss_data(subset: str = "FD001", n: int = 3, seed: int = 42):
    """
    Load n engines from CMAPSS and patch sensor_tools so all existing
    agents transparently receive real NASA engine data.
    """
    global _CMAPSS_EQUIPMENT, _CMAPSS_ACTIVE

    _CMAPSS_EQUIPMENT = build_equipment_list(subset=subset, n=n, seed=seed)
    _CMAPSS_ACTIVE = True

    # ── Patch EQUIPMENT_REGISTRY ──────────────────────────────────────────
    _st.EQUIPMENT_REGISTRY.clear()
    for eq in _CMAPSS_EQUIPMENT:
        eid = eq["equipment_id"]
        _st.EQUIPMENT_REGISTRY[eid] = {
            "name":            eq["name"],
            "type":            eq["type"],
            "product_type":    eq["product_type"],
            "location":        eq["location"],
            "install_date":    "2010-01-01",
            "operating_hours": eq["operating_hours"],
            "active_fault":    eq["fault_mode"] if eq["fault_mode"] != "NOMINAL" else None,
            # CMAPSS-specific extras
            "rul_cycles":      eq["rul_cycles"],
            "cycle":           eq["cycle"],
            "dataset":         eq["dataset"],
        }

    # ── Patch get_equipment_list ──────────────────────────────────────────
    def _get_equipment_list():
        return [
            {
                "equipment_id": eq["equipment_id"],
                "name":         eq["name"],
                "type":         eq["type"],
                "location":     eq["location"],
            }
            for eq in _CMAPSS_EQUIPMENT
        ]
    _st.get_equipment_list = _get_equipment_list

    # ── Patch get_sensor_readings ─────────────────────────────────────────
    def _get_sensor_readings(equipment_id: str) -> dict:
        eq = next((e for e in _CMAPSS_EQUIPMENT if e["equipment_id"] == equipment_id), None)
        if eq is None:
            return {"error": f"Unknown equipment: {equipment_id}"}

        rul  = float(eq["rul_cycles"]) if eq["rul_cycles"] != "unknown" else 0.0
        score, level = rul_to_anomaly(rul)

        return {
            "equipment_id":   equipment_id,
            "name":           eq["name"],
            "timestamp":      "2024-01-01T00:00:00Z",
            "anomaly_score":  score,
            "anomaly_level":  level,
            "sensors":        eq["sensors"],
            # CMAPSS extras — agents can use these in prompts
            "rul_cycles":     eq["rul_cycles"],
            "fault_mode":     eq["fault_mode"],
            "cycle":          eq["cycle"],
            "dataset":        eq["dataset"],
        }
    _st.get_sensor_readings = _get_sensor_readings

    # ── Patch calculate_anomaly_score ─────────────────────────────────────
    def _calculate_anomaly_score(equipment_id: str) -> dict:
        eq = next((e for e in _CMAPSS_EQUIPMENT if e["equipment_id"] == equipment_id), None)
        if eq is None:
            return {"score": 0, "level": "NORMAL"}
        rul   = float(eq["rul_cycles"]) if eq["rul_cycles"] != "unknown" else 0.0
        score, level = rul_to_anomaly(rul)
        return {"score": score, "level": level, "rul_cycles": rul}
    _st.calculate_anomaly_score = _calculate_anomaly_score

    return _CMAPSS_EQUIPMENT


def get_cmapss_equipment() -> list[dict]:
    return _CMAPSS_EQUIPMENT


def is_cmapss_active() -> bool:
    return _CMAPSS_ACTIVE
