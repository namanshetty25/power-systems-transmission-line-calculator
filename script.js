document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    
    // Elements for conditional rendering
    const strandTypeRadios = document.getElementsByName('strand-type');
    const bundleTypeGroup = document.getElementById('bundle-type-group');
    const bundleTypeSelect = document.getElementById('bundle-type');
    const bundleSpacingGroup = document.getElementById('bundle-spacing-group');
    
    const systemTypeRadios = document.getElementsByName('system-type');
    const singlePhaseInputs = document.getElementById('single-phase-inputs');
    const threePhaseInputs = document.getElementById('three-phase-inputs');
    const circuitTypeRadios = document.getElementsByName('circuit-type');
    const doubleCircuitInputs = document.getElementById('double-circuit-inputs');

    const resultsPanel = document.getElementById('results');
    const caseCards = document.querySelectorAll('.case-card');

    function toggleVisibility(el, show) {
        if (!el) return;
        if (show) {
            el.classList.remove('hidden-dynamic');
            el.classList.add('visible-dynamic');
        } else {
            el.classList.remove('visible-dynamic');
            el.classList.add('hidden-dynamic');
        }
    }

    // UI Logic
    function updateUI() {
        const isMultiple = document.querySelector('input[name="strand-type"]:checked')?.value === 'multiple';
        toggleVisibility(bundleTypeGroup, isMultiple);
        
        if (isMultiple) {
            const bType = bundleTypeSelect.value;
            if (bType !== 'acsr') {
                toggleVisibility(bundleSpacingGroup, true);
                const spacingInput = document.getElementById('bundle-spacing');
                if (spacingInput) spacingInput.required = true;
            } else {
                toggleVisibility(bundleSpacingGroup, false);
                const spacingInput = document.getElementById('bundle-spacing');
                if (spacingInput) spacingInput.required = false;
            }
        } else {
            toggleVisibility(bundleSpacingGroup, false);
            const spacingInput = document.getElementById('bundle-spacing');
            if (spacingInput) spacingInput.required = false;
        }

        // System Config
        const isThreePhase = document.querySelector('input[name="system-type"]:checked')?.value === 'three-phase';
        
        toggleVisibility(singlePhaseInputs, !isThreePhase);
        toggleVisibility(threePhaseInputs, isThreePhase);

        const distD = document.getElementById('distance-d');
        const d12 = document.getElementById('d12');
        const d23 = document.getElementById('d23');
        const d31 = document.getElementById('d31');

        if (isThreePhase) {
            if (distD) distD.required = false;
            if (d12) d12.required = true;
            if (d23) d23.required = true;
            if (d31) d31.required = true;

            const isDouble = document.querySelector('input[name="circuit-type"]:checked')?.value === 'double-circuit';
            toggleVisibility(doubleCircuitInputs, isDouble);
            
            ['d1', 'd2', 'd3', 'd4'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = isDouble;
            });
        } else {
            if (distD) distD.required = true;
            if (d12) d12.required = false;
            if (d23) d23.required = false;
            if (d31) d31.required = false;
            ['d1', 'd2', 'd3', 'd4'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = false;
            });
        }

        // Redraw both plots
        renderAllPlots();
    }

    // =========================================================================
    // PLOT 1: Conductor Cross Section Visualizer
    // =========================================================================
    function renderConductorPlot() {
        const container = document.getElementById('conductor-diagram');
        if (!container) return;

        const isMultiple = document.querySelector('input[name="strand-type"]:checked')?.value === 'multiple';
        const bType = bundleTypeSelect ? bundleTypeSelect.value : '2-bundle';
        const rVal = parseFloat(document.getElementById('radius')?.value) || 0.012;
        const dVal = parseFloat(document.getElementById('bundle-spacing')?.value) || 0.4;

        const specBadge = document.getElementById('conductor-spec-badge');
        const statArea = document.getElementById('v-stat-area');
        const statGmrl = document.getElementById('v-stat-gmrl');
        const statGmrc = document.getElementById('v-stat-gmrc');

        let r_prime = 0.7788 * rVal;
        let gmrl = 0, gmrc = 0, area = 0, badgeText = '';

        if (!isMultiple) {
            gmrl = r_prime;
            gmrc = rVal;
            area = Math.PI * rVal * rVal;
            badgeText = 'Single Solid Strand';
        } else {
            if (bType === '2-bundle') {
                gmrl = Math.sqrt(r_prime * dVal);
                gmrc = Math.sqrt(rVal * dVal);
                area = 2 * Math.PI * rVal * rVal;
                badgeText = '2-Bundle Line';
            } else if (bType === '3-bundle') {
                gmrl = Math.pow(r_prime * Math.pow(dVal, 2), 1/3);
                gmrc = Math.pow(rVal * Math.pow(dVal, 2), 1/3);
                area = 3 * Math.PI * rVal * rVal;
                badgeText = '3-Bundle Triangle';
            } else if (bType === '4-bundle') {
                gmrl = 1.09 * Math.pow(r_prime * Math.pow(dVal, 3), 1/4);
                gmrc = 1.09 * Math.pow(rVal * Math.pow(dVal, 3), 1/4);
                area = 4 * Math.PI * rVal * rVal;
                badgeText = '4-Bundle Square';
            } else if (bType === 'acsr') {
                gmrl = 2.177 * rVal;
                gmrc = 2.177 * rVal;
                area = 6 * Math.PI * rVal * rVal;
                badgeText = '6/1 ACSR (7-Strand)';
            }
        }

        if (specBadge) specBadge.textContent = badgeText;
        if (statArea) statArea.textContent = `${(area * 1e4).toFixed(3)} cm²`;
        if (statGmrl) statGmrl.textContent = `${(gmrl * 1000).toFixed(2)} mm`;
        if (statGmrc) statGmrc.textContent = `${(gmrc * 1000).toFixed(2)} mm`;

        // SVG Drawing
        let svg = `<svg width="300" height="210" viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="alGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#60a5fa" />
                    <stop offset="100%" stop-color="#2563eb" />
                </linearGradient>
                <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#64748b" />
                    <stop offset="100%" stop-color="#334155" />
                </linearGradient>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#c2410c" />
                </marker>
                <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#16a34a" />
                </marker>
            </defs>`;

        const rFormatted = (rVal * 1000).toFixed(1) + ' mm';
        const dFormatted = dVal + ' m';

        if (!isMultiple) {
            // Single Solid Strand
            const cx = 150, cy = 105, R = 52;
            svg += `
                <!-- Single Strand Circle -->
                <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2.5" />
                <!-- Center Point -->
                <circle cx="${cx}" cy="${cy}" r="3" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
                <line x1="${cx - 8}" y1="${cy}" x2="${cx + 8}" y2="${cy}" stroke="#ffffff" stroke-width="1.5" />
                <line x1="${cx}" y1="${cy - 8}" x2="${cx}" y2="${cy + 8}" stroke="#ffffff" stroke-width="1.5" />
                
                <!-- Radius Arrow -->
                <line x1="${cx}" y1="${cy}" x2="${cx + R - 2}" y2="${cy}" stroke="#c2410c" stroke-width="2" marker-end="url(#arrowRed)" />
                <rect x="${cx + 12}" y="${cy - 20}" width="70" height="18" rx="3" fill="#ffffff" fill-opacity="0.9" stroke="#fed7aa" stroke-width="1" />
                <text x="${cx + 47}" y="${cy - 8}" fill="#c2410c" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">r = ${rFormatted}</text>
                
                <text x="150" y="185" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">Solid Conductor Cross-Section</text>
            `;
        } else if (bType === 'acsr') {
            // 6/1 ACSR 7-strand
            const cx = 150, cy = 98, strandR = 19;
            // Central steel strand
            svg += `<circle cx="${cx}" cy="${cy}" r="${strandR}" fill="url(#steelGrad)" stroke="#0f172a" stroke-width="1.5" />`;
            svg += `<text x="${cx}" y="${cy}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">Steel</text>`;

            // 6 Outer Aluminum Strands
            const ringR = strandR * 2;
            for (let i = 0; i < 6; i++) {
                const angle = i * (Math.PI / 3);
                const sx = cx + ringR * Math.cos(angle);
                const sy = cy + ringR * Math.sin(angle);
                svg += `<circle cx="${sx}" cy="${sy}" r="${strandR}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="1.5" />`;
                svg += `<circle cx="${sx}" cy="${sy}" r="1.5" fill="#ffffff" />`;
            }

            // Strand Radius dimension
            svg += `
                <line x1="${cx}" y1="${cy - strandR * 3 - 2}" x2="${cx}" y2="${cy - strandR - 2}" stroke="#c2410c" stroke-width="1.5" marker-start="url(#arrowRed)" marker-end="url(#arrowRed)" />
                <text x="150" y="188" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">7-Strand ACSR: 1 Central Steel + 6 Outer Al (r = ${rFormatted})</text>
            `;
        } else if (bType === '2-bundle') {
            // 2-Bundle
            const y = 92, x1 = 90, x2 = 210, R = 22;
            svg += `
                <!-- Dashed Connecting Line -->
                <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                
                <!-- 2 Subconductors -->
                <circle cx="${x1}" cy="${y}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${x2}" cy="${y}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <text x="${x1}" y="${y}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" text-anchor="middle" dominant-baseline="central">1</text>
                <text x="${x2}" y="${y}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" text-anchor="middle" dominant-baseline="central">2</text>
                
                <!-- Spacing Dimension -->
                <line x1="${x1 + 4}" y1="${y + 40}" x2="${x2 - 4}" y2="${y + 40}" stroke="#c2410c" stroke-width="1.8" marker-start="url(#arrowRed)" marker-end="url(#arrowRed)" />
                <line x1="${x1}" y1="${y + R + 2}" x2="${x1}" y2="${y + 48}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="${x2}" y1="${y + R + 2}" x2="${x2}" y2="${y + 48}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2" />
                <text x="150" y="${y + 35}" fill="#c2410c" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">d = ${dFormatted}</text>
                
                <text x="150" y="188" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">2-Bundle (r = ${rFormatted})</text>
            `;
        } else if (bType === '3-bundle') {
            // 3-Bundle Equilateral Triangle
            const topX = 150, topY = 55, leftX = 95, leftY = 145, rightX = 205, rightY = 145, R = 18;
            svg += `
                <!-- Dashed Triangle -->
                <polygon points="${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}" fill="none" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                
                <!-- Subconductors -->
                <circle cx="${topX}" cy="${topY}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${leftX}" cy="${leftY}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${rightX}" cy="${rightY}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <text x="${topX}" y="${topY}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">1</text>
                <text x="${leftX}" y="${leftY}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">2</text>
                <text x="${rightX}" y="${rightY}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">3</text>
                
                <!-- Spacing Dimension -->
                <line x1="${leftX + 4}" y1="${leftY + 30}" x2="${rightX - 4}" y2="${rightY + 30}" stroke="#c2410c" stroke-width="1.8" marker-start="url(#arrowRed)" marker-end="url(#arrowRed)" />
                <text x="150" y="${leftY + 25}" fill="#c2410c" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">d = ${dFormatted}</text>
                
                <text x="150" y="195" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">3-Bundle Equilateral Triangle (r = ${rFormatted})</text>
            `;
        } else if (bType === '4-bundle') {
            // 4-Bundle Square
            const x1 = 100, x2 = 200, y1 = 55, y2 = 145, R = 17;
            svg += `
                <!-- Dashed Square -->
                <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="none" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                
                <!-- 4 Subconductors -->
                <circle cx="${x1}" cy="${y1}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${x2}" cy="${y1}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${x2}" cy="${y2}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="${x1}" cy="${y2}" r="${R}" fill="url(#alGrad)" stroke="#1d4ed8" stroke-width="2" />
                
                <text x="${x1}" y="${y1}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">1</text>
                <text x="${x2}" y="${y1}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">2</text>
                <text x="${x2}" y="${y2}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">3</text>
                <text x="${x1}" y="${y2}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central">4</text>
                
                <!-- Bottom Dimension -->
                <line x1="${x1 + 4}" y1="${y2 + 28}" x2="${x2 - 4}" y2="${y2 + 28}" stroke="#c2410c" stroke-width="1.8" marker-start="url(#arrowRed)" marker-end="url(#arrowRed)" />
                <text x="150" y="${y2 + 23}" fill="#c2410c" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">d = ${dFormatted}</text>
                
                <text x="150" y="195" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">4-Bundle Square (r = ${rFormatted})</text>
            `;
        }

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    // =========================================================================
    // PLOT 2: Circuit & Tower Geometry Visualizer
    // =========================================================================
    function renderCircuitPlot() {
        const container = document.getElementById('circuit-diagram');
        if (!container) return;

        const isThreePhase = document.querySelector('input[name="system-type"]:checked')?.value === 'three-phase';
        const isDouble = isThreePhase && document.querySelector('input[name="circuit-type"]:checked')?.value === 'double-circuit';

        const specBadge = document.getElementById('circuit-spec-badge');
        const statSystem = document.getElementById('v-stat-system');
        const statSpacing = document.getElementById('v-stat-spacing');
        const statGmd = document.getElementById('v-stat-gmd');

        let svg = `<svg width="300" height="210" viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#16a34a" />
                </marker>
                <marker id="arrowDark" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#475569" />
                </marker>
            </defs>`;

        // SVG Node Generator Helper
        const drawPhaseNode = (cx, cy, label, color="#2563eb", r=14) => `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#0f172a" stroke-width="1.8" />
            <text x="${cx}" y="${cy}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="${r > 12 ? '11' : '10'}" text-anchor="middle" dominant-baseline="central">${label}</text>
        `;

        if (!isThreePhase) {
            // Single Phase Line
            const dVal = parseFloat(document.getElementById('distance-d')?.value) || 1.0;
            if (specBadge) specBadge.textContent = 'Single Phase (2-Conductor)';
            if (statSystem) statSystem.textContent = '1-Phase';
            if (statSpacing) statSpacing.textContent = `D = ${dVal} m`;
            if (statGmd) statGmd.textContent = `${dVal.toFixed(2)} m`;

            const y = 95, x1 = 80, x2 = 220;
            svg += `
                <!-- Distance Dashed Line -->
                <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                
                <!-- Phase Conductors a and b -->
                ${drawPhaseNode(x1, y, "a", "#2563eb", 16)}
                ${drawPhaseNode(x2, y, "b", "#ea580c", 16)}
                
                <text x="${x1}" y="${y - 25}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" text-anchor="middle">Phase A</text>
                <text x="${x2}" y="${y - 25}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" text-anchor="middle">Phase B</text>
                
                <!-- Dimension Arrow -->
                <line x1="${x1 + 4}" y1="${y + 35}" x2="${x2 - 4}" y2="${y + 35}" stroke="#16a34a" stroke-width="1.8" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)" />
                <rect x="115" y="${y + 24}" width="70" height="20" rx="3" fill="#ffffff" fill-opacity="0.95" stroke="#bbf7d0" stroke-width="1" />
                <text x="150" y="${y + 38}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">D = ${dVal} m</text>
                
                <!-- Ground reference line -->
                <line x1="50" y1="180" x2="250" y2="180" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" />
                <text x="150" y="195" fill="#8c827a" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" text-anchor="middle">Ground Plane Reference</text>
            `;
        } else if (!isDouble) {
            // Three Phase Single Circuit
            const d12 = parseFloat(document.getElementById('d12')?.value) || 10;
            const d23 = parseFloat(document.getElementById('d23')?.value) || 10;
            const d31 = parseFloat(document.getElementById('d31')?.value) || 20;
            const gmd = Math.pow(d12 * d23 * d31, 1/3);

            const isFlat = Math.abs((d12 + d23) - d31) < 1e-2;
            if (specBadge) specBadge.textContent = isFlat ? '3-Phase Flat Single' : '3-Phase Triangular';
            if (statSystem) statSystem.textContent = '3-Phase (1-Ckt)';
            if (statSpacing) statSpacing.textContent = `${d12} / ${d23} / ${d31} m`;
            if (statGmd) statGmd.textContent = `${gmd.toFixed(2)} m`;

            if (isFlat) {
                // Flat horizontal arrangement
                const y = 95, x1 = 55, x2 = 150, x3 = 245;
                svg += `
                    <!-- Connecting line -->
                    <line x1="${x1}" y1="${y}" x2="${x3}" y2="${y}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                    
                    ${drawPhaseNode(x1, y, "a", "#dc2626", 14)}
                    ${drawPhaseNode(x2, y, "b", "#d97706", 14)}
                    ${drawPhaseNode(x3, y, "c", "#2563eb", 14)}
                    
                    <!-- D12 and D23 dimensions below -->
                    <line x1="${x1 + 2}" y1="${y + 30}" x2="${x2 - 2}" y2="${y + 30}" stroke="#16a34a" stroke-width="1.5" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)" />
                    <text x="${(x1 + x2)/2}" y="${y + 44}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">D₁₂=${d12}m</text>
                    
                    <line x1="${x2 + 2}" y1="${y + 30}" x2="${x3 - 2}" y2="${y + 30}" stroke="#16a34a" stroke-width="1.5" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)" />
                    <text x="${(x2 + x3)/2}" y="${y + 44}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">D₂₃=${d23}m</text>
                    
                    <!-- D31 Top Bracket -->
                    <line x1="${x1 + 2}" y1="${y - 30}" x2="${x3 - 2}" y2="${y - 30}" stroke="#16a34a" stroke-width="1.5" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)" />
                    <text x="150" y="${y - 35}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">D₃₁ = ${d31} m</text>
                    
                    <text x="150" y="195" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">Flat Horizontal Transposed (GMD = ${gmd.toFixed(2)} m)</text>
                `;
            } else {
                // Triangular arrangement
                const topX = 150, topY = 45, leftX = 75, leftY = 150, rightX = 225, rightY = 150;
                svg += `
                    <!-- Triangular dashed lines -->
                    <polygon points="${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}" fill="none" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
                    
                    <!-- Side dimension labels -->
                    <text x="${(topX + leftX)/2 - 16}" y="${(topY + leftY)/2}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">D₁₂=${d12}m</text>
                    <text x="${(topX + rightX)/2 + 16}" y="${(topY + rightY)/2}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="end">D₃₁=${d31}m</text>
                    <text x="150" y="${leftY + 22}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">D₂₃ = ${d23} m</text>
                    
                    ${drawPhaseNode(topX, topY, "a", "#dc2626", 14)}
                    ${drawPhaseNode(leftX, leftY, "b", "#d97706", 14)}
                    ${drawPhaseNode(rightX, rightY, "c", "#2563eb", 14)}
                    
                    <text x="150" y="195" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" text-anchor="middle">Triangular Spacing (GMD = ${gmd.toFixed(2)} m)</text>
                `;
            }
        } else {
            // Three Phase Double Circuit
            const d1 = parseFloat(document.getElementById('d1')?.value) || 4;
            const d2 = parseFloat(document.getElementById('d2')?.value) || 5;
            const d3 = parseFloat(document.getElementById('d3')?.value) || 4;
            const d4 = parseFloat(document.getElementById('d4')?.value) || 6;

            const D12 = parseFloat(document.getElementById('d12')?.value) || 6;
            const D23 = parseFloat(document.getElementById('d23')?.value) || 6;
            const D31 = parseFloat(document.getElementById('d31')?.value) || 12;

            let GMDA = Math.pow(D12 * d1 * d2 * d3, 1/4);
            let GMDB = Math.pow(D23 * d2 * d3 * d4, 1/4);
            let GMDC = Math.pow(D31 * d1 * d3 * d4, 1/4);
            let gmd = Math.pow(GMDA * GMDB * GMDC, 1/3);

            if (specBadge) specBadge.textContent = '3-Phase Double Circuit';
            if (statSystem) statSystem.textContent = '3-Phase (2-Ckt)';
            if (statSpacing) statSpacing.textContent = `d₁=${d1}, d₂=${d2}, d₃=${d3}`;
            if (statGmd) statGmd.textContent = `${gmd.toFixed(2)} m`;

            const yTop = 45, yMid = 98, yBot = 152;
            const xlTop = 85, xrTop = 215;
            const xlMid = 70, xrMid = 230;
            const xlBot = 85, xrBot = 215;

            svg += `
                <!-- Tower Centerline -->
                <line x1="150" y1="20" x2="150" y2="185" stroke="#64748b" stroke-dasharray="4,3" stroke-width="1.5" />
                <text x="150" y="16" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" text-anchor="middle">TOWER CENTERLINE</text>
                
                <!-- Crossarms -->
                <line x1="${xlTop}" y1="${yTop}" x2="${xrTop}" y2="${yTop}" stroke="#94a3b8" stroke-width="2" />
                <line x1="${xlMid}" y1="${yMid}" x2="${xrMid}" y2="${yMid}" stroke="#94a3b8" stroke-width="2" />
                <line x1="${xlBot}" y1="${yBot}" x2="${xrBot}" y2="${yBot}" stroke="#94a3b8" stroke-width="2" />
                
                <!-- Crossarm spacing labels -->
                <text x="150" y="${yTop - 6}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" text-anchor="middle">d₁ = ${d1}m</text>
                <text x="150" y="${yMid - 6}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" text-anchor="middle">d₂ = ${d2}m</text>
                <text x="150" y="${yBot - 6}" fill="#16a34a" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" text-anchor="middle">d₃ = ${d3}m</text>
                
                <!-- Circuit 1 (Left: Blue) -->
                ${drawPhaseNode(xlTop, yTop, "a", "#2563eb", 12)}
                ${drawPhaseNode(xlMid, yMid, "b", "#2563eb", 12)}
                ${drawPhaseNode(xlBot, yBot, "c", "#2563eb", 12)}
                
                <!-- Circuit 2 (Right: Orange) -->
                ${drawPhaseNode(xrTop, yTop, "a'", "#ea580c", 12)}
                ${drawPhaseNode(xrMid, yMid, "b'", "#ea580c", 12)}
                ${drawPhaseNode(xrBot, yBot, "c'", "#ea580c", 12)}
                
                <text x="150" y="198" fill="#57534e" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" text-anchor="middle">Double Circuit Tower (d₄ = ${d4}m, GMD = ${gmd.toFixed(2)}m)</text>
            `;
        }

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    function renderAllPlots() {
        renderConductorPlot();
        renderCircuitPlot();
    }

    function selectCase(cardId) {
        caseCards.forEach(c => c.classList.remove('active-case'));
        const activeCard = document.getElementById(cardId);
        if (activeCard) activeCard.classList.add('active-case');

        // Automatically trigger calculation and reveal results
        form.requestSubmit();
    }

    // Attach event listeners for real-time plot redraws
    strandTypeRadios.forEach(r => r.addEventListener('change', updateUI));
    if (bundleTypeSelect) bundleTypeSelect.addEventListener('change', updateUI);
    systemTypeRadios.forEach(r => r.addEventListener('change', updateUI));
    circuitTypeRadios.forEach(r => r.addEventListener('change', updateUI));

    const realTimeInputIds = ['radius', 'bundle-spacing', 'distance-d', 'd12', 'd23', 'd31', 'd1', 'd2', 'd3', 'd4'];
    realTimeInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', renderAllPlots);
        }
    });

    // Preset Handlers with Auto-Calculation
    document.getElementById('preset-1')?.addEventListener('click', () => {
        // Case 1: DC Resistance (05_Aug Slide 20)
        const strandSingle = document.querySelector('input[name="strand-type"][value="single"]');
        if (strandSingle) strandSingle.checked = true;
        document.getElementById('radius').value = 0.00564;
        const sysSingle = document.querySelector('input[name="system-type"][value="single-phase"]');
        if (sysSingle) sysSingle.checked = true;
        document.getElementById('distance-d').value = 1;
        document.getElementById('resistivity').value = '2.8e-8';
        document.getElementById('length').value = 10000;
        updateUI();
        selectCase('preset-1');
    });

    document.getElementById('preset-2')?.addEventListener('click', () => {
        // Case 2: Inductance 7-Strand (11_Aug Slide 11)
        const strandMultiple = document.querySelector('input[name="strand-type"][value="multiple"]');
        if (strandMultiple) strandMultiple.checked = true;
        if (bundleTypeSelect) bundleTypeSelect.value = 'acsr';
        document.getElementById('radius').value = 0.0168;
        const sysSingle = document.querySelector('input[name="system-type"][value="single-phase"]');
        if (sysSingle) sysSingle.checked = true;
        document.getElementById('distance-d').value = 1;
        document.getElementById('resistivity').value = '2.8e-8';
        document.getElementById('length').value = 1000;
        updateUI();
        selectCase('preset-2');
    });

    document.getElementById('preset-3')?.addEventListener('click', () => {
        // Case 3: 3-Phase Bundled Capacitance (12_Aug Slide 21)
        const strandMultiple = document.querySelector('input[name="strand-type"][value="multiple"]');
        if (strandMultiple) strandMultiple.checked = true;
        if (bundleTypeSelect) bundleTypeSelect.value = '2-bundle';
        document.getElementById('radius').value = 0.012;
        document.getElementById('bundle-spacing').value = 0.4;
        const sysThree = document.querySelector('input[name="system-type"][value="three-phase"]');
        if (sysThree) sysThree.checked = true;
        const cktSingle = document.querySelector('input[name="circuit-type"][value="single-circuit"]');
        if (cktSingle) cktSingle.checked = true;
        document.getElementById('d12').value = 10;
        document.getElementById('d23').value = 10;
        document.getElementById('d31').value = 20;
        document.getElementById('resistivity').value = '2.8e-8';
        document.getElementById('length').value = 1000;
        updateUI();
        selectCase('preset-3');
    });

    updateUI(); // Init

    // Calculation Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Constants
        const EPSILON_0 = 8.854e-12; // F/m

        // Inputs
        const r = parseFloat(document.getElementById('radius').value); 
        
        const isMultiple = document.querySelector('input[name="strand-type"]:checked')?.value === 'multiple';
        const bType = bundleTypeSelect ? bundleTypeSelect.value : '2-bundle';
        const d = parseFloat(document.getElementById('bundle-spacing')?.value) || 0;

        const isThreePhase = document.querySelector('input[name="system-type"]:checked')?.value === 'three-phase';
        const isDouble = isThreePhase && document.querySelector('input[name="circuit-type"]:checked')?.value === 'double-circuit';

        const rho = parseFloat(document.getElementById('resistivity').value);
        const L_len = parseFloat(document.getElementById('length').value); 

        // --- 1. CONDUCTOR CONFIGURATION ---
        let GMRL, GMRC, Area;
        let r_prime = 0.7788 * r; 
        let area_multiplier = 1;
        
        if (!isMultiple) {
            GMRL = r_prime;
            GMRC = r;
            area_multiplier = 1;
        } else {
            if (bType === '2-bundle') {
                GMRL = Math.sqrt(r_prime * d);
                GMRC = Math.sqrt(r * d);
                area_multiplier = 2;
            } else if (bType === '3-bundle') {
                GMRL = Math.pow(r_prime * Math.pow(d, 2), 1/3);
                GMRC = Math.pow(r * Math.pow(d, 2), 1/3);
                area_multiplier = 3;
            } else if (bType === '4-bundle') {
                GMRL = 1.09 * Math.pow(r_prime * Math.pow(d, 3), 1/4);
                GMRC = 1.09 * Math.pow(r * Math.pow(d, 3), 1/4);
                area_multiplier = 4;
            } else if (bType === 'acsr') {
                GMRL = 2.177 * r;
                GMRC = 2.177 * r;
                area_multiplier = 6;
            }
        }
        
        let A = area_multiplier * (Math.PI * r * r);

        // --- 2. SYSTEM TYPE & GMD/GMR CALCULATION ---
        let GMD;
        
        if (!isThreePhase) {
            const D = parseFloat(document.getElementById('distance-d').value);
            GMD = D;
        } else {
            const D12 = parseFloat(document.getElementById('d12').value);
            const D23 = parseFloat(document.getElementById('d23').value);
            const D31 = parseFloat(document.getElementById('d31').value);

            if (!isDouble) {
                GMD = Math.pow(D12 * D23 * D31, 1/3);
            } else {
                const d1 = parseFloat(document.getElementById('d1').value);
                const d2 = parseFloat(document.getElementById('d2').value);
                const d3 = parseFloat(document.getElementById('d3').value);
                const d4 = parseFloat(document.getElementById('d4').value);
                
                let GMDA = Math.pow(D12 * d1 * d2 * d3, 1/4);
                let GMDB = Math.pow(D23 * d2 * d3 * d4, 1/4);
                let GMDC = Math.pow(D31 * d1 * d3 * d4, 1/4);
                GMD = Math.pow(GMDA * GMDB * GMDC, 1/3);
                
                // Update Phase GMR considering parallel conductors
                GMRL = Math.pow(GMRL * d1 * d2 * d3, 1/4);
                GMRC = Math.pow(GMRC * d1 * d2 * d3, 1/4);
            }
        }

        // --- 4. FINAL R, L, C CALCULATIONS ---
        let R_per_m = rho / A;
        let R_total = R_per_m * L_len;
        
        let L_per_m = 2e-7 * Math.log(GMD / GMRL);
        let L_total = L_per_m * L_len;

        let C_per_m = (2 * Math.PI * EPSILON_0) / Math.log(GMD / GMRC);
        let C_total = C_per_m * L_len;

        // Output formatting
        function formatScientific(num) {
            if (num === 0) return "0";
            return num.toExponential(6); 
        }

        // Update Intermediate results
        document.getElementById('res-gmd').textContent = GMD.toFixed(5);
        document.getElementById('res-gmrl').textContent = GMRL.toFixed(5);
        document.getElementById('res-gmrc').textContent = GMRC.toFixed(5);

        // Update Final Results with per-meter primary units
        document.getElementById('res-total').innerHTML = `${formatScientific(R_per_m)} &Omega;/m`;
        document.getElementById('ind-total').textContent = `${formatScientific(L_per_m)} H/m`;
        document.getElementById('cap-total').textContent = `${formatScientific(C_per_m)} F/m`;
        
        // Re-render visualizer plots with updated state
        renderAllPlots();

        // Show results with smooth transition
        toggleVisibility(resultsPanel, true);
        
        // Re-render any dynamically rendered KaTeX formulas if available
        if (window.renderMathInElement) {
            window.renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        }
        
        // Smooth scroll directly to results
        setTimeout(() => {
            resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    });

    // Initial KaTeX render on page load
    const initMath = () => {
        if (window.renderMathInElement) {
            window.renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        }
    };
    
    if (window.renderMathInElement) {
        initMath();
    } else {
        window.addEventListener('load', initMath);
    }
});
