# Transmission Line Parameter Calculator (R, L, C)
> **EE 315 &bull; Power Systems Course Project &bull; Group 4**

A generalized computation tool for calculating the total **Resistance ($R$)**, **Inductance ($L$)**, and **Capacitance ($C$)** of overhead transmission lines based on Power Systems concepts (EE 315 / Module-2).

This repository provides two complete implementations:
1. 🌐 **Interactive Web Portal** (Vanilla HTML5, CSS3 with KaTeX & JavaScript)
2. 💻 **MATLAB Simulation Script** (`TL_Parameters_Calculator.m`)

🔗 **Live Web Application:** [https://namanshetty25.github.io/power-systems-transmission-line-calculator/](https://namanshetty25.github.io/power-systems-transmission-line-calculator/)

---

## 🧪 Verification & Benchmark Test Cases

The calculator has been validated against lecture slide problems from Module-2:

### 1. DC Resistance of Aluminium Conductor
- **Module Reference:** `05_Aug_Conductor configuration and Resistance.pdf`, Slide 14
- **Input Parameters:**
  - Single Strand Conductor
  - Radius $r = 0.00564\text{ m}$ (derived from area $A = 100\text{ mm}^2 = 100 \times 10^{-6}\text{ m}^2$ via $r = \sqrt{A/\pi}$)
  - Resistivity $\rho = 2.8 \times 10^{-8}\ \Omega\cdot\text{m}$
  - Line Length $l = 10000\text{ m}$ ($10\text{ km}$)
- **Expected Output:**
  - **Total Resistance ($R$):** $\mathbf{2.8000\ \Omega}$

### 2. Inductance of 7-Strand Single-Phase Line
- **Module Reference:** `11_Aug_Inductance calculation of 3-phase circuits.pdf`, Slide 12
- **Input Parameters:**
  - Multiple Strands: `6/1 ACSR` (7-strand equivalent, $\text{GMR}_L = 2.177 \cdot r$)
  - Radius of each strand $r = 0.0168\text{ m}$
  - Single Phase system with distance $D = 1.0\text{ m}$
  - Line Length $l = 1000\text{ m}$ ($1\text{ km}$)
- **Expected Output:**
  - **Total Inductance ($L$):** $\mathbf{6.6200 \times 10^{-4}\text{ H}}$ ($0.662\text{ mH/km}$)

### 3. Capacitance of 3-Phase Bundled Conductor
- **Module Reference:** `12_Aug_Capacitance calculation of single-phase & 3-phase circuits.pdf`, Slide 13
- **Input Parameters:**
  - Multiple Strands: `2-bundle` ($\text{GMR}_C = \sqrt{r \cdot d}$)
  - Strand radius $r = 0.012\text{ m}$
  - Bundle spacing $d = 0.4\text{ m}$
  - Three-Phase Single Circuit ($D_{12} = 10\text{ m}, D_{23} = 10\text{ m}, D_{31} = 20\text{ m}$)
  - Line Length $l = 1000\text{ m}$ ($1\text{ km}$)
- **Expected Output:**
  - **Total Capacitance ($C$):** $\mathbf{1.0700 \times 10^{-8}\text{ F}}$ ($0.01071\ \mu\text{F/km}$)

*(Note: In the live web portal, you can click any of the **Lecture Test Presets** buttons at the top to instantly load and compute these benchmark cases.)*

---

## ⚡ Features & Supported Configurations

### 1. Conductor Stranding & Bundling
- **Single Strand Conductors:** Standard single solid conductors ($GMR_L = 0.7788 \cdot r$, $GMR_C = r$).
- **Multiple Strands / Bundles:**
  - **2-Bundle:** $GMR_L = \sqrt{r' \cdot d}$, $GMR_C = \sqrt{r \cdot d}$
  - **3-Bundle:** $GMR_L = (r' \cdot d^2)^{1/3}$, $GMR_C = (r \cdot d^2)^{1/3}$
  - **4-Bundle:** $GMR_L = 1.09 \cdot (r' \cdot d^3)^{1/4}$, $GMR_C = 1.09 \cdot (r \cdot d^3)^{1/4}$
  - **6/1 ACSR (7-Strand):** $GMR_L = 2.177 \cdot r$, $GMR_C = 2.177 \cdot r$, with effective conducting area scaled by Aluminium strands ($A = 6 \pi r^2$).

### 2. System Configurations
- **Single Phase Lines:** Computes line-to-line parameters using conductor spacing $D$.
- **Three Phase Lines:**
  - **Single Circuit:** Symmetrical or unsymmetrically spaced transposed lines using $D_{12}, D_{23}, D_{31}$ ($GMD = \sqrt[3]{D_{12} D_{23} D_{31}}$).
  - **Double Circuit (Transposed):** Computes mutual $GMD$ and parallel phase $GMR$ using inter-phase and cross-arm distances ($d_1, d_2, d_3, d_4$).

### 3. Electrical Parameter Output
- **Total Series Resistance ($R$):** $R = \frac{\rho \cdot l}{A}$
- **Total Inductance ($L$):** $L = 2 \times 10^{-7} \cdot \ln\left(\frac{GMD}{GMR_L}\right) \cdot l$
- **Total Capacitance ($C$):** $C = \frac{2 \pi \epsilon_0}{\ln\left(\frac{GMD}{GMR_C}\right)} \cdot l$
- Displays intermediate variables ($GMD$, $GMR_L$, $GMR_C$) for quick hand-calculation verification.

---

## 📊 Interactive Real-Time Visual Plots

The application includes two real-time visualizers available in both the **Interactive Web Portal**, **MATLAB Simulation**, and the **Python Matplotlib Visualizer**:

1. **Plot 1: Conductor Cross-Section & Stranding Architecture**
   - Dynamic cross-section rendering for Single Solid Strand, 2-Bundle, 3-Bundle ($\Delta$), 4-Bundle (Square), and 6/1 ACSR (7-Strand with central steel core and 6 outer aluminium strands).
   - Real-time dimension markings for strand radius $r$ and subconductor spacing $d$.
   - Live calculations for conducting cross-sectional area $A$, effective radius $r'$, and inductive/capacitive GMR ($\text{GMR}_L$, $\text{GMR}_C$).

2. **Plot 2: Circuit & Tower Spatial Geometry Layout**
   - **Single-Phase Lines:** Conductor nodes $a$ and $b$ spaced horizontally at distance $D$ with ground plane reference.
   - **Three-Phase Single Circuit:** Flat horizontal and triangular arrangements with inter-phase distances $D_{12}, D_{23}, D_{31}$ and phase color-coding ($A, B, C$).
   - **Three-Phase Double Circuit:** Symmetrical tower cross-arms ($d_1, d_2, d_3$), vertical separation ($d_4$), tower centerline, and transposed parallel circuits ($a, b, c$ and $a', b', c'$).

---

## 📂 Repository Structure

```
.
├── index.html                  # Web application UI with dual real-time vector visualizers
├── styles.css                  # Straight-edged engineering cream theme & diagram grid
├── script.js                   # Client-side parameter calculation engine & dynamic SVG plots
├── plot_transmission_line.py   # Standalone Python Matplotlib visualization script
├── TL_Parameters_Calculator.m  # Interactive MATLAB CLI simulation with figure plots
├── .github/workflows/deploy.yml# GitHub Actions automated Pages deployment
└── README.md                   # Project documentation & test cases
```

---

## 🚀 How to Run

### Option A: Web Application Portal
1. Open the [Live Web App](https://namanshetty25.github.io/power-systems-transmission-line-calculator/) in any browser, or:
2. Clone the repository and open `index.html` directly in your local browser:
   ```bash
   git clone https://github.com/namanshetty25/power-systems-transmission-line-calculator.git
   cd power-systems-transmission-line-calculator
   start index.html
   ```

### Option B: Python Matplotlib Visualizer
Generate publication-quality figures for lab reports:
```bash
python plot_transmission_line.py
```

### Option C: MATLAB Simulation & Plots
1. Open MATLAB.
2. Open and run `TL_Parameters_Calculator.m`.
3. Follow the interactive prompts to enter conductor dimensions, line geometry, resistivity, and line length. MATLAB will display the numerical results and pop up the dual-plot visualization window.