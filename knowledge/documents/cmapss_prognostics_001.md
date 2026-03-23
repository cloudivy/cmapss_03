# RUL Prognostics Framework — ISO 13381-1 Guidelines

**Source:** ISO 13381-1:2015 + Saxena et al. 2008

**Type:** maintenance_procedure

---

## Remaining Useful Life (RUL) Prognostics Framework

### Definition (ISO 13381-1:2015)
Remaining Useful Life (RUL) is the length of time a component is likely
to operate before it requires repair or replacement.

For CMAPSS dataset:
- 1 RUL unit = 1 engine operating cycle ≈ 1 flight cycle
- RUL = 0 means engine has reached end-of-life (failure threshold)
- Training data includes full run-to-failure trajectories
- Test data requires RUL prediction from partial trajectories

### RUL-Based Maintenance Priority (per ISO 13381-1)

| RUL (cycles) | Priority  | Action                               |
|-------------|-----------|--------------------------------------|
| > 100       | LOW       | Routine monitoring, no action needed |
| 50–100      | MEDIUM    | Schedule maintenance within 30 days  |
| 30–50       | HIGH      | Schedule maintenance within 7 days   |
| 10–30       | URGENT    | Ground within 48 hours               |
| < 10        | CRITICAL  | Immediate grounding required         |
| 0           | FAILURE   | Engine has reached end-of-life       |

### Anomaly Score Mapping
The anomaly score (0–100) maps to RUL as follows:
  anomaly_score = max(0, min(100, round(100 * (1 - RUL / max_RUL_for_unit))))

This ensures:
- New engine (max RUL) → score = 0
- End of life (RUL = 0) → score = 100
- Linear degradation in between

### Prognostic Horizon (from Saxena et al. 2008)
The prognostic horizon is the earliest point at which a prognostic algorithm
can reliably predict RUL within acceptable error bounds (±13 cycles for CMAPSS).

### Evaluation Metric
The standard evaluation metric for CMAPSS is the PHM Score function:
  s = sum(exp(-d/13) - 1) for d < 0 (early prediction, less penalty)
  s = sum(exp(d/10) - 1)  for d > 0 (late prediction, more penalty)

where d = predicted_RUL - true_RUL

Source: ISO 13381-1:2015 — Condition monitoring and diagnostics of machines —
Prognostics — Part 1: General guidelines.
Saxena A. et al. (2008). Metrics for Evaluating Performance of Prognostic Techniques.
Proceedings of the International Conference on Prognostics and Health Management.