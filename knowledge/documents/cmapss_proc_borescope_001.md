# HPC Borescope Inspection Procedure

**Source:** SAE AIR1872 / FAA AC 43.13-1B

**Type:** maintenance_procedure

---

## Maintenance Procedure: HPC Borescope Inspection
Procedure ID: cmapss_proc_borescope_001

### Trigger Conditions
Initiate when ANY of:
- s3 (HPC outlet temp) > 1592 °R AND RUL < 50 cycles
- s7 (HPC outlet pressure) < 549 psia AND RUL < 50 cycles
- Anomaly score > 50/100

### Procedure Steps
1. Engine cool-down period (minimum 2 hours after shutdown)
2. Access borescope ports at HPC stages 1, 5, 9
3. Inspect compressor blades for:
   - Tip erosion (>10% chord loss = remove from service)
   - Leading edge damage or nicks
   - Cracks (any crack = immediate rejection)
   - Coating wear / thermal distress
4. Measure tip clearance at each stage
   - Acceptable: < 0.035 inches
   - Marginal:   0.035–0.050 inches (increase monitoring)
   - Reject:     > 0.050 inches (immediate removal)
5. Document findings with borescope photos
6. Restore all access covers and safety-wire

### Parts Required
- Borescope (flexible, 6mm diameter minimum)
- Tip clearance gauge set
- Inspection mirror set
- Camera with borescope adapter

### Estimated Time
- Technician: 4–6 hours
- Required certification: A&P license + engine type rating

### Standards Reference
- FAA AC 43.13-1B Chapter 14 — Turbine Engine Inspection
- SAE AIR1872 — Gas Turbine Engine Foreign Object Ingestion

Source: FAA Advisory Circular AC 43.13-1B (2001).
SAE International AIR1872 Revision A (2017).