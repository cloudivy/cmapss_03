# NASA CMAPSS Turbofan Engine Specification

**Source:** Saxena et al. 2008 / NASA TM-2008-215546

**Type:** equipment_specification

---

## Turbofan Engine Specification — NASA CMAPSS Dataset

### Engine Architecture
The C-MAPSS (Commercial Modular Aero-Propulsion System Simulation) turbofan
represents a high-bypass commercial aircraft engine with the following modules:
- Fan (F)
- Low-Pressure Compressor (LPC)
- High-Pressure Compressor (HPC)
- Combustor (CC)
- High-Pressure Turbine (HPT)
- Low-Pressure Turbine (LPT)

### Operational Settings (3 variables)
| Setting    | Range             | Description                    |
|------------|-------------------|--------------------------------|
| setting_1  | -0.0087 to 0.0087 | Flight altitude indicator      |
| setting_2  | -0.0003 to 0.0003 | Mach number variation          |
| setting_3  | 60 / 80 / 100     | Throttle resolver angle (TRA)  |

### Operating Conditions (CMAPSS Subsets)
| Subset | Conditions | Fault Modes  | Train Engines |
|--------|-----------|--------------|---------------|
| FD001  | 1         | HPC Degr.    | 100           |
| FD002  | 6         | HPC Degr.    | 260           |
| FD003  | 1         | HPC+Fan Degr | 100           |
| FD004  | 6         | HPC+Fan Degr | 248           |

### Sensor Suite (21 sensors, 14 diagnostically relevant)
| Sensor | Description                        | Unit     | Diagnostic |
|--------|------------------------------------|----------|------------|
| s1     | Fan inlet temperature              | °R       | No         |
| s2     | LPC outlet temperature             | °R       | Yes        |
| s3     | HPC outlet temperature             | °R       | Yes        |
| s4     | LPT outlet temperature             | °R       | Yes        |
| s5     | Fan inlet pressure                 | psia     | No         |
| s6     | Bypass-duct pressure               | psia     | No         |
| s7     | HPC outlet pressure                | psia     | Yes        |
| s8     | Physical fan speed                 | rpm      | Yes        |
| s9     | Physical core speed                | rpm      | Yes        |
| s10    | Engine pressure ratio              | –        | No         |
| s11    | HPC outlet static pressure         | psia     | Yes        |
| s12    | Ratio of fuel flow to Ps30         | pps/psia | Yes        |
| s13    | Corrected fan speed                | rpm      | Yes        |
| s14    | Corrected core speed               | rpm      | Yes        |
| s15    | Bypass ratio                       | –        | Yes        |
| s16    | Burner fuel-air ratio              | –        | No         |
| s17    | Bleed enthalpy                     | –        | Yes        |
| s18    | Required fan speed                 | rpm      | No         |
| s19    | Required fan conversion speed      | rpm      | No         |
| s20    | HP turbines cool air flow          | lbm/s    | Yes        |
| s21    | LP turbines cool air flow          | lbm/s    | Yes        |

Source: Saxena A., Goebel K., Simon D., Eklund N. (2008).
Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation.
Proceedings of the International Conference on Prognostics and Health Management.
NASA Technical Memorandum TM-2008-215546.