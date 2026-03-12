// State
const state = {
    currentDomain: 'physics',
    canvas: null,
    ctx: null,
    chart: null,
    animationFrameId: null,
    params: {}
};

// DOM Elements
const elements = {
    domainNav: document.getElementById('domain-nav'),
    title: document.getElementById('current-domain-title'),
    formula: document.getElementById('formula-display'),
    stageContainer: document.getElementById('stage-container'),
    controlsContainer: document.getElementById('controls-container')
};

// Domain Definitions
const domains = {
    physics: {
        id: 'physics',
        icon: '🚀',
        title: 'Physics',
        subtitle: 'Projectile Motion',
        formula: 'y = x·tan(θ) - (g·x²) / (2·v²·cos²(θ))',
        color: '#ef4444',
        type: 'canvas',
        params: [
            { id: 'velocity', label: 'Initial V (v)', min: 10, max: 150, val: 60, unit: 'm/s' },
            { id: 'angle', label: 'Angle (θ)', min: 1, max: 89, val: 45, unit: '°' },
            { id: 'gravity', label: 'Gravity (g)', min: 1, max: 25, val: 9.8, step: 0.1, unit: 'm/s²' }
        ],
        draw(ctx, width, height, params) {
            ctx.clearRect(0, 0, width, height);

            // Ground Line
            const groundY = height - 40;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(width, groundY);
            ctx.stroke();

            // Parabola Calculation
            const v = parseFloat(params.velocity.val);
            const theta = parseFloat(params.angle.val) * Math.PI / 180;
            const g = parseFloat(params.gravity.val);

            // Adjust scale based on max expected distance to fit screen roughly
            const maxDist = (v * v * Math.sin(2 * theta)) / g;
            const canvasScale = Math.min((width - 40) / maxDist, (height - 60) / ((v * v * Math.sin(theta) * Math.sin(theta)) / (2 * g) * 1.5));

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            let started = false;
            let lastX = 0, lastY = groundY;

            // Simple fast loop
            for (let t = 0; t <= 30; t += 0.05) {
                const x = v * Math.cos(theta) * t;
                const y = v * Math.sin(theta) * t - 0.5 * g * t * t;

                const px = 20 + x * canvasScale;
                const py = groundY - (y * canvasScale);

                if (py > groundY && started) {
                    // Interpolate exact ground hit
                    ctx.lineTo(px, groundY);
                    lastX = px; lastY = groundY;
                    break;
                }

                if (!started) {
                    ctx.moveTo(px, py);
                    started = true;
                } else {
                    ctx.lineTo(px, py);
                }
                lastX = px; lastY = py;
            }

            // Draw path with Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw Projectile
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    engineering: {
        id: 'engineering',
        icon: '⚙️',
        title: 'Engineering',
        subtitle: 'Harmonic Oscillator',
        formula: 'x(t) = A·cos(ωt)',
        color: '#f59e0b',
        type: 'canvas',
        params: [
            { id: 'mass', label: 'Mass (m)', min: 0.1, max: 10, val: 2, step: 0.1, unit: 'kg' },
            { id: 'springConstant', label: 'Spring Constant (k)', min: 1, max: 50, val: 15, unit: 'N/m' },
            { id: 'amplitude', label: 'Amplitude (A)', min: 1, max: 5, val: 2, unit: 'm' }
        ],
        draw(ctx, width, height, params) {
            ctx.clearRect(0, 0, width, height);
            // Time-based animation
            const t = performance.now() / 1000;
            const m = parseFloat(params.mass.val);
            const k = parseFloat(params.springConstant.val);
            const A = parseFloat(params.amplitude.val);

            const omega = Math.sqrt(k / m);

            const centerX = width / 2;
            const refY = height / 2;
            const scale = 30; // pixels per meter

            // Calculate displacement
            const displacement = A * Math.cos(omega * t);
            const blockY = refY + displacement * scale;

            // Ceiling
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(centerX - 100, 0, 200, 20);

            // Draw spring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, 20);

            const coils = 12;
            const span = blockY - 20; // from ceiling to block
            for (let i = 1; i <= coils; i++) {
                const x = centerX + ((i % 2 === 0) ? 20 : -20);
                const y = 20 + (i / coils) * span;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(centerX, blockY);
            ctx.stroke();

            // Draw Block
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;

            // Size mass proportionally
            const blockW = 60 + m * 5;
            const blockH = 40 + m * 5;
            ctx.fillRect(centerX - blockW / 2, blockY, blockW, blockH);
            ctx.shadowBlur = 0;

            // Draw text on block
            ctx.fillStyle = '#fff';
            ctx.font = '16px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${m.toFixed(1)}kg`, centerX, blockY + blockH / 2);
        }
    },
    medical: {
        id: 'medical',
        icon: '💊',
        title: 'Medical',
        subtitle: 'Pharmacokinetics',
        formula: 'C(t) = (D / Vd) · e^(-kt)',
        color: '#10b981',
        type: 'chart',
        params: [
            { id: 'dose', label: 'Dose (D)', min: 100, max: 1000, val: 500, step: 10, unit: 'mg' },
            { id: 'vd', label: 'Volume Dist. (Vd)', min: 5, max: 100, val: 50, unit: 'L' },
            { id: 'elimRate', label: 'Elim. Rate (k)', min: 0.01, max: 0.5, val: 0.1, step: 0.01, unit: 'hr⁻¹' }
        ],
        getChartConfig(params) {
            const labels = [];
            const data = [];
            const D = parseFloat(params.dose.val);
            const Vd = parseFloat(params.vd.val);
            const k = parseFloat(params.elimRate.val);

            for (let t = 0; t <= 24; t += 1) { // 24 hours
                labels.push(`${t}h`);
                const C = (D / Vd) * Math.exp(-k * t);
                data.push(C);
            }

            return createLineChartConfig(labels, data, 'Concentration (mg/L)', this.color);
        }
    },
    biological: {
        id: 'biological',
        icon: '🧬',
        title: 'Biological',
        subtitle: 'Population Growth',
        formula: 'P(t) = K / (1 + ((K - P₀)/P₀)·e^(-rt))',
        color: '#8b5cf6',
        type: 'chart',
        params: [
            { id: 'capacity', label: 'Carrying Cap. (K)', min: 1000, max: 50000, val: 10000, step: 500, unit: '' },
            { id: 'initialPop', label: 'Initial Pop. (P₀)', min: 10, max: 1000, val: 100, step: 10, unit: '' },
            { id: 'growthRate', label: 'Growth Rate (r)', min: 0.1, max: 2.0, val: 0.5, step: 0.1, unit: '' }
        ],
        getChartConfig(params) {
            const labels = [];
            const data = [];
            const K = parseFloat(params.capacity.val);
            const P0 = parseFloat(params.initialPop.val);
            const r = parseFloat(params.growthRate.val);

            for (let t = 0; t <= 20; t += 1) {
                labels.push(`Day ${t}`);
                const denom = 1 + ((K - P0) / P0) * Math.exp(-r * t);
                data.push(K / denom);
            }

            return createLineChartConfig(labels, data, 'Population Size', this.color);
        }
    },
    statistics: {
        id: 'statistics',
        icon: '📊',
        title: 'Statistics',
        subtitle: 'Normal Distribution',
        formula: 'f(x) = (1 / σ√(2π)) · e^(-(x-μ)² / 2σ²)',
        color: '#0ea5e9',
        type: 'chart',
        params: [
            { id: 'mean', label: 'Mean (μ)', min: -50, max: 50, val: 0, unit: '' },
            { id: 'stddev', label: 'Std. Dev. (σ)', min: 1, max: 20, val: 5, step: 0.5, unit: '' }
        ],
        getChartConfig(params) {
            const labels = [];
            const data = [];
            const u = parseFloat(params.mean.val);
            const std = parseFloat(params.stddev.val);

            // Generate range
            const minX = u - 4 * std;
            const maxX = u + 4 * std;
            const step = (maxX - minX) / 100;

            for (let x = minX; x <= maxX; x += step) {
                labels.push(x.toFixed(1));
                const exponent = -Math.pow((x - u), 2) / (2 * Math.pow(std, 2));
                const fx = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
                data.push(fx);
            }

            return {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Probability Density f(x)',
                        data: data,
                        borderColor: this.color,
                        backgroundColor: this.color + '33', // 20% opacity
                        borderWidth: 3,
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    }]
                },
                options: getCommonChartOptions()
            };
        }
    },
    finance: {
        id: 'finance',
        icon: '📈',
        title: 'Finance',
        subtitle: 'Compound Interest',
        formula: 'A = P(1 + r/n)^(nt)',
        color: '#22c55e',
        type: 'chart',
        params: [
            { id: 'principal', label: 'Principal (P)', min: 1000, max: 100000, val: 10000, step: 1000, unit: '$' },
            { id: 'rate', label: 'Int. Rate (r)', min: 1, max: 20, val: 7, step: 0.5, unit: '%' },
            { id: 'years', label: 'Years (t)', min: 5, max: 50, val: 30, step: 1, unit: 'yr' }
        ],
        getChartConfig(params) {
            const labels = [];
            const principalData = [];
            const interestData = [];

            const P = parseFloat(params.principal.val);
            const r = parseFloat(params.rate.val) / 100;
            const t = parseInt(params.years.val);
            const n = 12; // Monthly

            for (let yr = 0; yr <= t; yr++) {
                labels.push(`Yr ${yr}`);
                const A = P * Math.pow((1 + r / n), n * yr);
                principalData.push(P);
                interestData.push(A - P);
            }

            return {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Principal',
                            data: principalData,
                            backgroundColor: '#94a3b8',
                        },
                        {
                            label: 'Interest Earned',
                            data: interestData,
                            backgroundColor: this.color,
                        }
                    ]
                },
                options: {
                    ...getCommonChartOptions(),
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        y: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                    }
                }
            };
        }
    }
};

// --- Helpers ---
function createLineChartConfig(labels, data, labelName, color) {
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelName,
                data: data,
                borderColor: color,
                backgroundColor: color + '33', // 20% opacity hex
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: color
            }]
        },
        options: getCommonChartOptions()
    };
}

function getCommonChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#e2e8f0', font: { family: "'Outfit', sans-serif" } }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            }
        },
        animation: { duration: 400 } // smooth transition when sliders move
    };
}

Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Outfit', sans-serif";

// --- Application Logic ---
function init() {
    buildNavigation();
    setDomain(state.currentDomain);

    // Global resize handler for canvas
    window.addEventListener('resize', () => {
        const domain = domains[state.currentDomain];
        if (domain.type === 'canvas' && state.canvas) {
            setupCanvasSize(state.canvas);
        }
    });
}

function buildNavigation() {
    elements.domainNav.innerHTML = '';
    Object.values(domains).forEach(domain => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${domain.id === state.currentDomain ? 'active' : ''}`;
        btn.dataset.domain = domain.id;

        btn.innerHTML = `
            <span class="icon">${domain.icon}</span>
            <span>${domain.title}</span>
        `;

        btn.addEventListener('click', () => {
            if (state.currentDomain !== domain.id) {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setDomain(domain.id);
            }
        });

        elements.domainNav.appendChild(btn);
    });
}

function setDomain(domainId) {
    state.currentDomain = domainId;
    const domain = domains[domainId];

    // Stop any existing animation loops
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }

    // Destroy existing chart if any
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }

    // Update Header
    elements.title.innerHTML = `${domain.title}: <span style="font-weight: 300; opacity: 0.8">${domain.subtitle}</span>`;
    elements.formula.textContent = domain.formula;
    elements.formula.style.color = domain.color;

    // Setup Controls
    buildControls(domain);

    // Setup Stage
    elements.stageContainer.innerHTML = '';

    if (domain.type === 'canvas') {
        state.canvas = document.createElement('canvas');
        state.canvas.id = 'viz-canvas';
        elements.stageContainer.appendChild(state.canvas);
        state.ctx = state.canvas.getContext('2d');
        setupCanvasSize(state.canvas);

        // Start render loop
        const loop = () => {
            domain.draw(state.ctx, state.canvas.width, state.canvas.height, state.params);
            state.animationFrameId = requestAnimationFrame(loop);
        };
        loop();

    } else if (domain.type === 'chart') {
        const canvas = document.createElement('canvas');
        canvas.id = 'viz-chart';
        // Wrapper for Chart.js to maintain aspect ratio correctly in flex container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '1.5rem';
        wrapper.style.bottom = '1.5rem';
        wrapper.style.left = '1.5rem';
        wrapper.style.right = '1.5rem';
        wrapper.appendChild(canvas);
        elements.stageContainer.appendChild(wrapper);

        state.chart = new Chart(canvas, domain.getChartConfig(state.params));
    }
}

function buildControls(domain) {
    elements.controlsContainer.innerHTML = '';
    state.params = {};

    domain.params.forEach(param => {
        // Init param state
        state.params[param.id] = { ...param };

        const group = document.createElement('div');
        group.className = 'control-group';

        const header = document.createElement('div');
        header.className = 'control-header';

        const label = document.createElement('label');
        label.setAttribute('for', param.id);
        label.textContent = param.label;

        const valDisplay = document.createElement('span');
        valDisplay.className = 'control-val';
        valDisplay.id = `val-${param.id}`;
        valDisplay.textContent = `${param.val} ${param.unit}`;

        header.appendChild(label);
        header.appendChild(valDisplay);

        const input = document.createElement('input');
        input.type = 'range';
        input.id = param.id;
        input.min = param.min;
        input.max = param.max;
        input.step = param.step || 1;
        input.value = param.val;

        // Dynamic thumb color mapping
        input.style.setProperty('--accent-color', domain.color);

        // Update logic on change
        input.addEventListener('input', (e) => {
            const newVal = e.target.value;
            state.params[param.id].val = newVal;
            valDisplay.textContent = `${newVal} ${param.unit}`;

            // If it's a chart, we need to update data
            if (domain.type === 'chart' && state.chart) {
                const newConfig = domain.getChartConfig(state.params);
                state.chart.data = newConfig.data;
                state.chart.update('none'); // Update without full re-animation for smoothness
            }
        });

        group.appendChild(header);
        group.appendChild(input);
        elements.controlsContainer.appendChild(group);
    });
}

function setupCanvasSize(canvas) {
    const rect = elements.stageContainer.getBoundingClientRect();
    // Factor in padding (1.5rem = 24px per side roughly)
    canvas.width = rect.width - 48;
    canvas.height = rect.height - 48;
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
