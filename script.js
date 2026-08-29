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

    function toggleVisibility(el, show) {
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
        // Conductor Config
        const isMultiple = document.querySelector('input[name="strand-type"]:checked').value === 'multiple';
        toggleVisibility(bundleTypeGroup, isMultiple);
        
        if (isMultiple) {
            const bType = bundleTypeSelect.value;
            if (bType !== 'acsr') {
                toggleVisibility(bundleSpacingGroup, true);
                document.getElementById('bundle-spacing').required = true;
            } else {
                toggleVisibility(bundleSpacingGroup, false);
                document.getElementById('bundle-spacing').required = false;
            }
        } else {
            toggleVisibility(bundleSpacingGroup, false);
            document.getElementById('bundle-spacing').required = false;
        }

        // System Config
        const isThreePhase = document.querySelector('input[name="system-type"]:checked').value === 'three-phase';
        
        toggleVisibility(singlePhaseInputs, !isThreePhase);
        toggleVisibility(threePhaseInputs, isThreePhase);

        if (isThreePhase) {
            document.getElementById('distance-d').required = false;
            
            document.getElementById('d12').required = true;
            document.getElementById('d23').required = true;
            document.getElementById('d31').required = true;

            const isDouble = document.querySelector('input[name="circuit-type"]:checked').value === 'double-circuit';
            toggleVisibility(doubleCircuitInputs, isDouble);
            
            if (isDouble) {
                ['d1', 'd2', 'd3', 'd4'].forEach(id => document.getElementById(id).required = true);
            } else {
                ['d1', 'd2', 'd3', 'd4'].forEach(id => document.getElementById(id).required = false);
            }
        } else {
            document.getElementById('distance-d').required = true;
            ['d12', 'd23', 'd31', 'd1', 'd2', 'd3', 'd4'].forEach(id => document.getElementById(id).required = false);
        }
    }

    strandTypeRadios.forEach(r => r.addEventListener('change', updateUI));
    bundleTypeSelect.addEventListener('change', updateUI);
    systemTypeRadios.forEach(r => r.addEventListener('change', updateUI));
    circuitTypeRadios.forEach(r => r.addEventListener('change', updateUI));

    updateUI(); // Init

    // Calculation Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Constants
        const EPSILON_0 = 8.854e-12; // F/m

        // Inputs
        const r = parseFloat(document.getElementById('radius').value); 
        
        const isMultiple = document.querySelector('input[name="strand-type"]:checked').value === 'multiple';
        const bType = bundleTypeSelect.value;
        const d = parseFloat(document.getElementById('bundle-spacing').value) || 0;

        const isThreePhase = document.querySelector('input[name="system-type"]:checked').value === 'three-phase';
        const isDouble = isThreePhase && document.querySelector('input[name="circuit-type"]:checked').value === 'double-circuit';

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
        let R_total = (rho * L_len) / A;
        
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
        document.getElementById('res-gmd').textContent = GMD.toFixed(6);
        document.getElementById('res-gmrl').textContent = GMRL.toFixed(6);
        document.getElementById('res-gmrc').textContent = GMRC.toFixed(6);

        // Update Final Results
        document.getElementById('res-total').innerHTML = `${formatScientific(R_total)} &Omega;`;
        document.getElementById('ind-total').textContent = `${formatScientific(L_total)} H`;
        document.getElementById('cap-total').textContent = `${formatScientific(C_total)} F`;
        
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
        
        // Scroll to results slightly
        setTimeout(() => {
            resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
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
    
    // Check if KaTeX already loaded or poll briefly
    if (window.renderMathInElement) {
        initMath();
    } else {
        window.addEventListener('load', initMath);
    }
});
