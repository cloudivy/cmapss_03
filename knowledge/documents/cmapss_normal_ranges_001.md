# Turbofan Engine Normal Sensor Operating Ranges

**Source:** Saxena et al. 2008 — baseline cycle statistics

**Type:** operating_specification

---

## Normal Operating Ranges — NASA CMAPSS Turbofan Engine

Derived from healthy baseline cycles (early flight cycles before degradation onset).
Values represent mean ± 2σ across all CMAPSS FD001 training engines.

### Diagnostic Sensor Normal Ranges (FD001 — Sea Level, 1 condition)

| Sensor | Description              | Normal Min | Normal Max | Unit     |
|--------|--------------------------|------------|------------|----------|
| s2     | LPC outlet temperature   | 641.00     | 644.00     | °R       |
| s3     | HPC outlet temperature   | 1585.00    | 1592.00    | °R       |
| s4     | LPT outlet temperature   | 1400.00    | 1415.00    | °R       |
| s7     | HPC outlet pressure      | 549.00     | 554.00     | psia     |
| s8     | Physical fan speed       | 2385.00    | 2390.00    | rpm      |
| s9     | Physical core speed      | 9050.00    | 9070.00    | rpm      |
| s11    | HPC static pressure      | 47.00      | 48.50      | psia     |
| s12    | Fuel flow ratio          | 521.00     | 524.00     | pps/psia |
| s13    | Corrected fan speed      | 2387.00    | 2395.00    | rpm      |
| s14    | Corrected core speed     | 8140.00    | 8160.00    | rpm      |
| s15    | Bypass ratio             | 8.40       | 8.50       | –        |
| s17    | Bleed enthalpy           | 391.00     | 396.00     | –        |
| s20    | HP turbine cool air flow | 38.70      | 39.20      | lbm/s   |
| s21    | LP turbine cool air flow | 23.10      | 23.50      | lbm/s   |

### Degradation Direction (per Saxena et al. 2008)
| Sensor | Trend at Failure | Physical Meaning                        |
|--------|------------------|-----------------------------------------|
| s3     | Increases        | HPC running hotter = compressor fouling |
| s4     | Increases        | Turbine inlet temp rising = HPT wear    |
| s7     | Decreases        | Compressor pressure ratio dropping      |
| s11    | Decreases        | Static pressure loss = blade erosion    |
| s8     | Decreases        | Fan slowing = bearing/blade wear        |
| s12    | Increases        | More fuel needed for same thrust        |
| s17    | Increases        | Increased bleed = compressor instability|

### Warning Thresholds (50% beyond normal range)
A sensor reading 50% beyond its normal range boundary triggers WARNING status.
A sensor reading 150% beyond its normal range boundary triggers CRITICAL status.

Source: Saxena A. et al. (2008). NASA TM-2008-215546.
Based on C-MAPSS simulation at General Electric Aviation.