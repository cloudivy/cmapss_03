# Fan Blade Inspection Procedure

**Source:** FAA AC 43.13-1B / AGARD-R-785

**Type:** maintenance_procedure

---

## Maintenance Procedure: Fan Blade Inspection
Procedure ID: cmapss_proc_fan_inspection_001

### Trigger Conditions (FAN_DEG indicators)
- s8 (fan speed) < 2385 rpm sustained over 5 cycles
- s13 (corrected fan speed) < 2387 rpm
- s15 (bypass ratio) < 8.40
- Anomaly score > 40 on FD003/FD004 engines

### Procedure Steps
1. Visual inspection of all fan blades (external, no removal)
   - FOD damage: nicks, dents, cracks
   - Leading edge erosion
   - Tip curl or bending
2. Dimensional check: blade chord length at 25%, 50%, 75% span
   - Max erosion: 5% chord loss from nominal
3. Vibration signature check
   - Fan imbalance indicator: vibration > 4.0 mil pp at fan frequency
4. Tip clearance measurement
   - Fan tip clearance: acceptable < 0.060 inches
5. Blade retention check (fan blade retaining pins)
6. Fan case liner inspection (abradable coating wear)

### Removal Criteria
| Defect | Limit | Action |
|--------|-------|--------|
| Leading edge nick | > 0.020" deep | Replace blade |
| Chord erosion | > 5% loss | Replace blade |
| Any crack | Any size | Immediate removal |
| Tip clearance | > 0.075" | Remove from service |

### Expected Time
- Inspection only: 2–3 hours
- Blade replacement (single): 6–8 hours additional

Source: FAA Advisory Circular AC 43.13-1B, Chapter 14.
AGARD Report 785 — Recommended Practices for Monitoring Gas Turbine Life.