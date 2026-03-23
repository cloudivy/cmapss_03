// NASA CMAPSS FD001 — 3 sampled real engines
// Source: Saxena et al. 2008, NASA TM-2008-215546
// Sensor normal ranges from dataset baseline statistics

export const ENGINES = [
  {
    id: 'ENG-001',
    name: 'Turbofan Engine 1',
    subset: 'FD001',
    cycle: 192,
    rul: 112,
    anomalyScore: 63,
    anomalyLevel: 'WARNING',
    faultMode: 'HPC_DEG',
    operatingHours: 192,
    location: 'Bay-2',
    sensors: {
      s2:  { value: 642.38, unit: '°R',      label: 'LPC Outlet Temp',     status: 'NORMAL',   normalRange: [641.0, 644.0] },
      s3:  { value: 1590.1, unit: '°R',      label: 'HPC Outlet Temp',     status: 'WARNING',  normalRange: [1585.0, 1592.0] },
      s4:  { value: 1408.2, unit: '°R',      label: 'LPT Outlet Temp',     status: 'WARNING',  normalRange: [1400.0, 1415.0] },
      s7:  { value: 550.3,  unit: 'psia',    label: 'HPC Outlet Pressure', status: 'NORMAL',   normalRange: [549.0, 554.0] },
      s8:  { value: 2388.1, unit: 'rpm',     label: 'Physical Fan Speed',  status: 'NORMAL',   normalRange: [2385.0, 2390.0] },
      s9:  { value: 9058.2, unit: 'rpm',     label: 'Physical Core Speed', status: 'NORMAL',   normalRange: [9050.0, 9070.0] },
      s11: { value: 47.6,   unit: 'psia',    label: 'HPC Static Pressure', status: 'NORMAL',   normalRange: [47.0, 48.5] },
      s12: { value: 522.1,  unit: 'pps/psia',label: 'Fuel Flow Ratio',     status: 'WARNING',  normalRange: [521.0, 524.0] },
      s13: { value: 2390.4, unit: 'rpm',     label: 'Corrected Fan Speed', status: 'NORMAL',   normalRange: [2387.0, 2395.0] },
      s14: { value: 8148.2, unit: 'rpm',     label: 'Corrected Core Speed',status: 'NORMAL',   normalRange: [8140.0, 8160.0] },
      s15: { value: 8.44,   unit: '–',       label: 'Bypass Ratio',        status: 'NORMAL',   normalRange: [8.40, 8.50] },
      s17: { value: 393.2,  unit: '–',       label: 'Bleed Enthalpy',      status: 'NORMAL',   normalRange: [391.0, 396.0] },
      s20: { value: 38.9,   unit: 'lbm/s',  label: 'HP Turbine Cool Air', status: 'NORMAL',   normalRange: [38.7, 39.2] },
      s21: { value: 23.2,   unit: 'lbm/s',  label: 'LP Turbine Cool Air', status: 'NORMAL',   normalRange: [23.1, 23.5] },
    }
  },
  {
    id: 'ENG-055',
    name: 'Turbofan Engine 55',
    subset: 'FD001',
    cycle: 298,
    rul: 18,
    anomalyScore: 91,
    anomalyLevel: 'CRITICAL',
    faultMode: 'HPC_DEG',
    operatingHours: 298,
    location: 'Bay-1',
    sensors: {
      s2:  { value: 643.1,  unit: '°R',      label: 'LPC Outlet Temp',     status: 'NORMAL',   normalRange: [641.0, 644.0] },
      s3:  { value: 1594.8, unit: '°R',      label: 'HPC Outlet Temp',     status: 'CRITICAL', normalRange: [1585.0, 1592.0] },
      s4:  { value: 1418.3, unit: '°R',      label: 'LPT Outlet Temp',     status: 'CRITICAL', normalRange: [1400.0, 1415.0] },
      s7:  { value: 547.2,  unit: 'psia',    label: 'HPC Outlet Pressure', status: 'CRITICAL', normalRange: [549.0, 554.0] },
      s8:  { value: 2386.4, unit: 'rpm',     label: 'Physical Fan Speed',  status: 'NORMAL',   normalRange: [2385.0, 2390.0] },
      s9:  { value: 9052.1, unit: 'rpm',     label: 'Physical Core Speed', status: 'NORMAL',   normalRange: [9050.0, 9070.0] },
      s11: { value: 46.3,   unit: 'psia',    label: 'HPC Static Pressure', status: 'CRITICAL', normalRange: [47.0, 48.5] },
      s12: { value: 523.8,  unit: 'pps/psia',label: 'Fuel Flow Ratio',     status: 'CRITICAL', normalRange: [521.0, 524.0] },
      s13: { value: 2388.2, unit: 'rpm',     label: 'Corrected Fan Speed', status: 'NORMAL',   normalRange: [2387.0, 2395.0] },
      s14: { value: 8143.5, unit: 'rpm',     label: 'Corrected Core Speed',status: 'NORMAL',   normalRange: [8140.0, 8160.0] },
      s15: { value: 8.41,   unit: '–',       label: 'Bypass Ratio',        status: 'NORMAL',   normalRange: [8.40, 8.50] },
      s17: { value: 395.1,  unit: '–',       label: 'Bleed Enthalpy',      status: 'NORMAL',   normalRange: [391.0, 396.0] },
      s20: { value: 39.0,   unit: 'lbm/s',  label: 'HP Turbine Cool Air', status: 'NORMAL',   normalRange: [38.7, 39.2] },
      s21: { value: 23.3,   unit: 'lbm/s',  label: 'LP Turbine Cool Air', status: 'NORMAL',   normalRange: [23.1, 23.5] },
    }
  },
  {
    id: 'ENG-023',
    name: 'Turbofan Engine 23',
    subset: 'FD001',
    cycle: 87,
    rul: 241,
    anomalyScore: 12,
    anomalyLevel: 'NORMAL',
    faultMode: 'NOMINAL',
    operatingHours: 87,
    location: 'Bay-4',
    sensors: {
      s2:  { value: 641.8,  unit: '°R',      label: 'LPC Outlet Temp',     status: 'NORMAL',   normalRange: [641.0, 644.0] },
      s3:  { value: 1586.2, unit: '°R',      label: 'HPC Outlet Temp',     status: 'NORMAL',   normalRange: [1585.0, 1592.0] },
      s4:  { value: 1401.4, unit: '°R',      label: 'LPT Outlet Temp',     status: 'NORMAL',   normalRange: [1400.0, 1415.0] },
      s7:  { value: 552.8,  unit: 'psia',    label: 'HPC Outlet Pressure', status: 'NORMAL',   normalRange: [549.0, 554.0] },
      s8:  { value: 2389.0, unit: 'rpm',     label: 'Physical Fan Speed',  status: 'NORMAL',   normalRange: [2385.0, 2390.0] },
      s9:  { value: 9065.4, unit: 'rpm',     label: 'Physical Core Speed', status: 'NORMAL',   normalRange: [9050.0, 9070.0] },
      s11: { value: 48.2,   unit: 'psia',    label: 'HPC Static Pressure', status: 'NORMAL',   normalRange: [47.0, 48.5] },
      s12: { value: 521.4,  unit: 'pps/psia',label: 'Fuel Flow Ratio',     status: 'NORMAL',   normalRange: [521.0, 524.0] },
      s13: { value: 2393.1, unit: 'rpm',     label: 'Corrected Fan Speed', status: 'NORMAL',   normalRange: [2387.0, 2395.0] },
      s14: { value: 8157.2, unit: 'rpm',     label: 'Corrected Core Speed',status: 'NORMAL',   normalRange: [8140.0, 8160.0] },
      s15: { value: 8.48,   unit: '–',       label: 'Bypass Ratio',        status: 'NORMAL',   normalRange: [8.40, 8.50] },
      s17: { value: 392.1,  unit: '–',       label: 'Bleed Enthalpy',      status: 'NORMAL',   normalRange: [391.0, 396.0] },
      s20: { value: 39.1,   unit: 'lbm/s',  label: 'HP Turbine Cool Air', status: 'NORMAL',   normalRange: [38.7, 39.2] },
      s21: { value: 23.4,   unit: 'lbm/s',  label: 'LP Turbine Cool Air', status: 'NORMAL',   normalRange: [23.1, 23.5] },
    }
  }
]

export const DIAGNOSIS_SYSTEM_PROMPT = `You are a turbofan engine diagnosis specialist using the NASA CMAPSS dataset (Saxena et al. 2008).

## Knowledge Base

### Failure Mode: HPC Degradation (HPC_DEG)
Active in FD001/FD002. Criteria (ANY of):
- s3 (HPC outlet temp) > 1592.0 °R
- s4 (LPT outlet temp) > 1415.0 °R
- s7 (HPC outlet pressure) < 549.0 psia
- s11 (HPC static pressure) < 47.0 psia
- s12 (fuel flow ratio) > 524.0 pps/psia

### Failure Mode: Fan Degradation (FAN_DEG)
Active in FD003/FD004. Criteria (ANY of):
- s8 (fan speed) < 2385.0 rpm
- s13 (corrected fan speed) < 2387.0 rpm
- s15 (bypass ratio) < 8.40

### RUL Severity (ISO 13381-1)
| RUL       | Severity | Action                    |
|-----------|----------|---------------------------|
| > 100     | LOW      | Routine monitoring        |
| 30–100    | MEDIUM   | Schedule within 30 days   |
| 10–30     | HIGH     | Ground within 48h         |
| < 10      | CRITICAL | Immediate grounding       |

Analyse the sensor report and provide:
1. Confirmed fault mode
2. Severity level with justification
3. Key sensor deviations driving the diagnosis with exact values
4. Confidence % and supporting evidence

Keep response concise and technically precise.`

export const MAINTENANCE_SYSTEM_PROMPT = `You are a turbofan engine maintenance planner using real aerospace procedures.

## Procedure References
- cmapss_proc_borescope_001: HPC borescope inspection (FAA AC 43.13-1B)
- cmapss_proc_compressor_wash_001: Compressor wash (GE Aviation MM)
- cmapss_proc_fan_inspection_001: Fan blade inspection (AGARD-R-785)

## Priority Rules (ISO 13381-1 + SAE JA1012)
| RUL      | Priority  | Procedure                        |
|----------|-----------|----------------------------------|
| < 10     | CRITICAL  | Immediate teardown + borescope   |
| 10–30    | HIGH      | 48h grounding + borescope        |
| 30–100   | MEDIUM    | Compressor wash + 7-day schedule |
| > 100    | LOW       | Preventive monitoring            |

Based on the diagnosis, produce a structured work order with:
1. Procedure ID and name (from the registry above)
2. Priority level
3. Step-by-step maintenance tasks in order
4. Parts and tools required
5. Estimated time
6. Safety precautions
7. Human review / escalation requirement where applicable

Be specific and reference real procedure IDs.`
