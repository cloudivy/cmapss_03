# CMAPSS Run-to-Failure Statistics

**Source:** Saxena et al. 2008 — Training dataset statistics

**Type:** historical_record

---

## Historical Run-to-Failure Records — NASA CMAPSS

### FD001 Fleet Statistics (100 engines, 1 operating condition)
- Total cycles recorded: 20,631
- Mean engine life: 206 cycles (σ = 46 cycles)
- Shortest engine life: 128 cycles
- Longest engine life: 362 cycles
- All failures: HPC degradation fault mode

### FD002 Fleet Statistics (260 engines, 6 operating conditions)
- Total cycles recorded: 53,759
- Mean engine life: 207 cycles (σ = 54 cycles)
- All failures: HPC degradation fault mode

### FD003 Fleet Statistics (100 engines, 1 operating condition)
- Total cycles recorded: 24,720
- Mean engine life: 247 cycles (σ = 57 cycles)
- Failures: HPC degradation (60%) + Fan degradation (40%)

### FD004 Fleet Statistics (248 engines, 6 operating conditions)
- Total cycles recorded: 61,249
- Mean engine life: 247 cycles (σ = 68 cycles)
- Failures: HPC degradation + Fan degradation (mixed)

### Degradation Signature (FD001 — typical engine)
| Phase        | Cycles (approx)  | Key Indicators                    |
|-------------|-----------------|-----------------------------------|
| Healthy      | 0–60% of life   | All sensors nominal               |
| Early Wear   | 60–80% of life  | s3 rising +0.5°R, s7 falling      |
| Degradation  | 80–95% of life  | s3 > 1590°R, s7 < 550 psia        |
| End of Life  | 95–100% of life | s3 > 1592°R, s11 < 47 psia        |

### Known Baseline Cases for Drift Validation
| Engine (FD001) | Life (cycles) | True RUL at test cutoff |
|----------------|---------------|------------------------|
| Engine 1        | 192           | 112 cycles             |
| Engine 2        | 287           | 98 cycles              |
| Engine 3        | 179           | 69 cycles              |

Source: Saxena A., Goebel K., Simon D., Eklund N. (2008).
Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation.
International Conference on Prognostics and Health Management, pp. 1-9.
NASA Technical Memorandum TM-2008-215546.
Available: https://ntrs.nasa.gov/citations/20090029214