# Transmission Line Parameter Calculator (R, L, C)
> **EE 315 &bull; Power Systems Course Project &bull; Group 4**

A generalized computation tool for calculating the total **Resistance ($R$)**, **Inductance ($L$)**, and **Capacitance ($C$)** of overhead transmission lines based on Power Systems concepts (EE 315 / Module-2).

This repository provides two complete implementations:
1. 🌐 **Interactive Web Portal** (Vanilla HTML5, CSS3, & JavaScript with responsive UI)
2. 💻 **MATLAB Simulation Script** (`TL_Parameters_Calculator.m`)

🔗 **Live Web Application:** [https://namanshetty25.github.io/power-systems-transmission-line-calculator/](https://namanshetty25.github.io/power-systems-transmission-line-calculator/)

---

## ⚡ Features & Supported Configurations

### 1. Conductor Stranding & Bundling
- **Single Strand Conductors:** Standard single solid conductors.
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

## 📂 Repository Structure

```
.
├── index.html                  # Web application UI
├── styles.css                  # Modern dark-mode glassmorphic styling
├── script.js                   # Client-side parameter calculation engine
├── TL_Parameters_Calculator.m  # Interactive MATLAB command-line simulation
├── .github/workflows/deploy.yml# GitHub Actions automated Pages deployment
└── README.md                   # Project documentation
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

### Option B: MATLAB Simulation
1. Open MATLAB.
2. Open and run `TL_Parameters_Calculator.m`.
3. Follow the interactive prompts to enter conductor dimensions, line geometry, resistivity, and line length.