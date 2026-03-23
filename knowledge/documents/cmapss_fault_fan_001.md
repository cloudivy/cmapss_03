# Fan Degradation Fault Pattern — CMAPSS FD003/FD004

**Source:** Saxena et al. 2008 / AGARD-R-785

**Type:** fault_pattern

---

## Fault Pattern: Fan Degradation (FAN_DEG)

### Definition
Fan degradation simulates rotor blade erosion, foreign object damage (FOD),
and tip clearance increase in the engine fan stage. Active in FD003 and FD004
alongside HPC degradation.

### Diagnostic Criteria
FAN_DEG is confirmed when ANY of the following conditions hold:

| Condition | Sensor | Threshold        | Physical Cause              |
|-----------|--------|------------------|-----------------------------|
| FAN-1     | s8     | < 2385.0 rpm     | Fan rotor speed loss        |
| FAN-2     | s13    | < 2387.0 rpm     | Corrected fan speed drop    |
| FAN-3     | s15    | < 8.40           | Bypass ratio decrease       |
| FAN-4     | s2     | > 644.0 °R       | LPC inlet temperature rise  |

### Severity Classification
| RUL (cycles remaining) | Severity | Action Required |
|------------------------|----------|-----------------|
| > 100 cycles           | LOW      | Vibration monitoring increase |
| 30–100 cycles          | MEDIUM   | Fan blade inspection within 5 days |
| 10–30 cycles           | HIGH     | Ground within 24h, fan inspection |
| < 10 cycles            | CRITICAL | Immediate grounding |

### Distinction from HPC Degradation
- FAN_DEG primarily affects s2, s8, s13, s15 (fan-side sensors)
- HPC_DEG primarily affects s3, s4, s7, s11 (compressor-side sensors)
- Co-occurrence (FAN_DEG + HPC_DEG) is modelled in FD003/FD004

### Maintenance Procedure Reference
- Procedure: cmapss_proc_fan_inspection_001 (fan blade borescope)
- Procedure: cmapss_proc_fan_balance_001 (fan balance check)
- Standard: AGARD-R-785 — Engine Health Monitoring

Source: Saxena A. et al. (2008). NASA TM-2008-215546, Section 3.3.
AGARD-R-785 — Recommended Practices for Monitoring Gas Turbine Engine Life.