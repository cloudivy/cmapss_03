# HPC Degradation Fault Pattern — CMAPSS FD001/FD002

**Source:** Saxena et al. 2008 / ISO 13379-1

**Type:** fault_pattern

---

## Fault Pattern: HPC Degradation (HPC_DEG)

### Definition (Saxena et al. 2008)
High-Pressure Compressor (HPC) degradation is the primary failure mode in
CMAPSS FD001 and FD002. It simulates compressor fouling, blade erosion,
and tip clearance increases over engine lifecycle.

### Diagnostic Criteria
HPC_DEG is confirmed when ANY of the following conditions hold:

| Condition | Sensor | Threshold        | Physical Cause              |
|-----------|--------|------------------|-----------------------------|
| HPC-1     | s3     | > 1592.0 °R      | Compressor outlet overheating |
| HPC-2     | s4     | > 1415.0 °R      | Turbine inlet temperature rise |
| HPC-3     | s7     | < 549.0 psia     | Compressor pressure ratio loss |
| HPC-4     | s11    | < 47.0 psia      | Static pressure loss at HPC outlet |
| HPC-5     | s12    | > 524.0 pps/psia | Increased fuel consumption |

### Severity Classification (based on RUL)
| RUL (cycles remaining) | Severity | Action Required |
|------------------------|----------|-----------------|
| > 100 cycles           | LOW      | Schedule inspection within 30 days |
| 30–100 cycles          | MEDIUM   | Inspection within 7 days |
| 10–30 cycles           | HIGH     | Ground within 48h, borescope inspection |
| < 10 cycles            | CRITICAL | Immediate grounding, engine teardown |

### Progression Pattern (from run-to-failure data)
- Gradual onset: typically begins at 60–70% of engine life
- Rate of change: ~0.3°R/cycle increase in s3 during degradation phase
- s7 typically drops 0.5–1.5 psia over final 50 cycles
- HPC efficiency loss: 1–3% total at time of failure

### Maintenance Procedure Reference
- Procedure: cmapss_proc_borescope_001 (HPC borescope inspection)
- Procedure: cmapss_proc_compressor_wash_001 (compressor wash)
- Standard: SAE AIR1872 — Guide to Limitation of Exposure of Aircraft Gas
  Turbine Engines to Ingestion of Birds, Ice, and Other Foreign Objects

Source: Saxena A., Goebel K., Simon D., Eklund N. (2008).
NASA TM-2008-215546, Section 3.2 — Fault Modes.