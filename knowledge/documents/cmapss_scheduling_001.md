# Engine Health Monitoring — Maintenance Priority Rules

**Source:** ISO 13381-1 / SAE JA1012 / Saxena et al. 2008

**Type:** maintenance_schedule

---

## Maintenance Priority Rules — NASA CMAPSS Turbofan Engines

### Priority Framework (ISO 13381-1 + SAE JA1012 RCM)

#### CRITICAL — Immediate Grounding Required
Trigger: RUL < 10 cycles OR anomaly_score >= 90
- Engine must not fly
- Begin teardown inspection within 2 hours
- Applicable faults: HPC_DEG + FAN_DEG co-occurrence at end-of-life

#### HIGH — Ground Within 48 Hours
Trigger: RUL 10–30 cycles OR anomaly_score 70–89
- Remove from revenue service at next maintenance opportunity
- Borescope inspection required before next flight
- Applicable faults: HPC_DEG confirmed (s3 > 1592°R OR s7 < 549 psia)

#### MEDIUM — Schedule Within 7 Days
Trigger: RUL 30–100 cycles OR anomaly_score 40–69
- Continue flying with increased monitoring frequency
- Schedule shop visit within 7 days
- Applicable faults: Single sensor out of range, moderate degradation

#### LOW — Monitor and Schedule
Trigger: RUL 100–200 cycles OR anomaly_score 20–39
- Increase sensor sampling frequency
- Schedule compressor wash or preventive inspection
- Applicable faults: Early degradation trend detected

#### NOMINAL — Routine Monitoring
Trigger: RUL > 200 cycles AND anomaly_score < 20
- Standard health monitoring interval
- No immediate action required
- Continue data collection

### Decision Matrix
| Fault Mode | RUL < 30 | RUL 30–100 | RUL > 100 |
|------------|----------|------------|-----------|
| HPC_DEG    | CRITICAL | HIGH       | MEDIUM    |
| FAN_DEG    | CRITICAL | HIGH       | MEDIUM    |
| HPC+FAN    | CRITICAL | CRITICAL   | HIGH      |
| NOMINAL    | LOW      | NOMINAL    | NOMINAL   |

### Reliability-Centred Maintenance (RCM) Basis
Per SAE JA1012, maintenance tasks are justified by one of:
1. Failure consequences (safety vs. operational vs. economic)
2. Failure mode probability (high/medium/low frequency)
3. Task effectiveness (restores function vs. monitors condition)

Source: ISO 13381-1:2015 Section 7 — Maintenance Decision Support.
SAE JA1012:2002 — A Guide to the Reliability-Centred Maintenance Standard.
Saxena A. et al. (2008). NASA TM-2008-215546 Section 4.