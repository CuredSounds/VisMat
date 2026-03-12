/**
 * domains.js – Definitions for all STEM domains, scenarios, variables and chart data generators.
 * Each domain → scenarios → variables + outputs + chart config.
 */

// Helper: clamp a number to a range
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Abramowitz & Stegun approximation to the error function (max error ~1.5e-7)
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(ax * ax));
  return sign * y;
}

// Standard normal CDF using erf
function Phi(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// ─── PHYSICS ────────────────────────────────────────────────────────────────
const physicsScenarios = [
  {
    id: 'projectile',
    name: 'Projectile Motion',
    description: 'Trajectory of an object launched at angle θ with velocity v₀',
    variables: [
      { id: 'v0',    label: 'Initial Velocity', symbol: 'v₀',  min: 1,   max: 100,  step: 1,   defaultValue: 30,   unit: 'm/s' },
      { id: 'angle', label: 'Launch Angle',     symbol: 'θ',   min: 1,   max: 89,   step: 1,   defaultValue: 45,   unit: '°'   },
      { id: 'g',     label: 'Gravity',          symbol: 'g',   min: 0.5, max: 25,   step: 0.1, defaultValue: 9.81, unit: 'm/s²'},
      { id: 'h0',    label: 'Initial Height',   symbol: 'h₀',  min: 0,   max: 100,  step: 1,   defaultValue: 0,    unit: 'm'   },
    ],
    outputs: [
      { label: 'Range',          formula: (v) => v.v0 ** 2 * Math.sin(2 * v.angle * Math.PI / 180) / v.g, unit: 'm',  description: 'Horizontal range' },
      { label: 'Max Height',     formula: (v) => v.h0 + (v.v0 * Math.sin(v.angle * Math.PI / 180)) ** 2 / (2 * v.g), unit: 'm', description: 'Peak altitude' },
      { label: 'Time of Flight', formula: (v) => {
          const vy = v.v0 * Math.sin(v.angle * Math.PI / 180);
          return (vy + Math.sqrt(vy ** 2 + 2 * v.g * v.h0)) / v.g;
        }, unit: 's', description: 'Total flight duration' },
    ],
    chart: {
      type: 'xy',
      title: 'Projectile Trajectory',
      xLabel: 'Horizontal Distance (m)',
      yLabel: 'Height (m)',
      series: [
        { key: 'trajectory', name: 'Trajectory', color: '#3B82F6', strokeWidth: 2.5 },
      ],
      generateData: (v) => {
        const rad = v.angle * Math.PI / 180;
        const vx = v.v0 * Math.cos(rad);
        const vy = v.v0 * Math.sin(rad);
        const tTotal = (vy + Math.sqrt(clamp(vy ** 2 + 2 * v.g * v.h0, 0, Infinity))) / v.g;
        const pts = [];
        for (let i = 0; i <= 120; i++) {
          const t = (tTotal * i) / 120;
          const x = vx * t;
          const y = v.h0 + vy * t - 0.5 * v.g * t ** 2;
          pts.push({ x: +x.toFixed(3), trajectory: +Math.max(0, y).toFixed(3) });
        }
        return pts;
      },
      referenceLines: [
        { type: 'horizontal', value: (v) => v.h0, label: 'Ground', color: '#6B7280' },
      ],
    },
  },
  {
    id: 'wave',
    name: 'Wave Superposition',
    description: 'Sum of two sinusoidal waves with adjustable frequency and amplitude',
    variables: [
      { id: 'A1', label: 'Amplitude 1',  symbol: 'A₁', min: 0,   max: 5,    step: 0.1, defaultValue: 1,   unit: 'm'  },
      { id: 'f1', label: 'Frequency 1',  symbol: 'f₁', min: 0.1, max: 10,   step: 0.1, defaultValue: 1,   unit: 'Hz' },
      { id: 'A2', label: 'Amplitude 2',  symbol: 'A₂', min: 0,   max: 5,    step: 0.1, defaultValue: 0.5, unit: 'm'  },
      { id: 'f2', label: 'Frequency 2',  symbol: 'f₂', min: 0.1, max: 10,   step: 0.1, defaultValue: 3,   unit: 'Hz' },
    ],
    outputs: [
      { label: 'Max Amplitude',  formula: (v) => v.A1 + v.A2,                       unit: 'm',  description: 'Constructive peak' },
      { label: 'Beat Frequency', formula: (v) => Math.abs(v.f1 - v.f2),             unit: 'Hz', description: 'Envelope frequency' },
      { label: 'RMS Amplitude',  formula: (v) => Math.sqrt((v.A1 ** 2 + v.A2 ** 2) / 2), unit: 'm', description: 'Root mean square' },
    ],
    chart: {
      type: 'time',
      title: 'Wave Superposition',
      xLabel: 'Time (s)',
      yLabel: 'Displacement (m)',
      series: [
        { key: 'wave1',    name: 'Wave 1', color: '#3B82F6', strokeWidth: 1.5, strokeDasharray: '4 2' },
        { key: 'wave2',    name: 'Wave 2', color: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 2' },
        { key: 'combined', name: 'Sum',    color: '#F59E0B', strokeWidth: 2.5 },
      ],
      generateData: (v) => {
        const points = [];
        for (let i = 0; i <= 200; i++) {
          const t = (4 / v.f1 * i) / 200;
          points.push({
            x:        +t.toFixed(4),
            wave1:    +(v.A1 * Math.sin(2 * Math.PI * v.f1 * t)).toFixed(4),
            wave2:    +(v.A2 * Math.sin(2 * Math.PI * v.f2 * t)).toFixed(4),
            combined: +(v.A1 * Math.sin(2 * Math.PI * v.f1 * t) + v.A2 * Math.sin(2 * Math.PI * v.f2 * t)).toFixed(4),
          });
        }
        return points;
      },
    },
  },
];

// ─── ENGINEERING ────────────────────────────────────────────────────────────
const engineeringScenarios = [
  {
    id: 'beam',
    name: 'Cantilever Beam',
    description: 'Deflection of a cantilever beam under a point load at the free end',
    variables: [
      { id: 'F', label: 'Point Load',        symbol: 'F', min: 100,   max: 100000, step: 100,  defaultValue: 1000,   unit: 'N'   },
      { id: 'L', label: 'Beam Length',       symbol: 'L', min: 0.1,  max: 10,     step: 0.1,  defaultValue: 2,      unit: 'm'   },
      { id: 'E', label: 'Elastic Modulus',   symbol: 'E', min: 1e9,  max: 300e9,  step: 1e9,  defaultValue: 200e9,  unit: 'Pa'  },
      { id: 'I', label: 'Moment of Inertia', symbol: 'I', min: 1e-8, max: 1e-4,   step: 1e-8, defaultValue: 5e-6,   unit: 'm⁴'  },
    ],
    outputs: [
      { label: 'Max Deflection', formula: (v) => (v.F * v.L ** 3) / (3 * v.E * v.I) * 1000, unit: 'mm', description: 'Tip displacement δ = FL³/3EI' },
      { label: 'Max Stress',     formula: (v) => (v.F * v.L) / (v.I / 0.05) / 1e6,          unit: 'MPa', description: 'Bending stress at root' },
      { label: 'Stiffness',      formula: (v) => (3 * v.E * v.I) / v.L ** 3,                unit: 'N/m', description: 'Effective spring stiffness' },
    ],
    chart: {
      type: 'xy',
      title: 'Beam Deflection Profile',
      xLabel: 'Position along beam (m)',
      yLabel: 'Deflection (mm)',
      series: [
        { key: 'deflection', name: 'Deflection', color: '#EF4444', strokeWidth: 2.5 },
      ],
      generateData: (v) => {
        const pts = [];
        for (let i = 0; i <= 100; i++) {
          const x = (v.L * i) / 100;
          const d = (v.F / (6 * v.E * v.I)) * (3 * v.L * x ** 2 - x ** 3) * 1000;
          pts.push({ x: +x.toFixed(3), deflection: +d.toFixed(4) });
        }
        return pts;
      },
    },
  },
  {
    id: 'rc_circuit',
    name: 'RC Circuit',
    description: 'Capacitor charging and discharging through a resistor',
    variables: [
      { id: 'Vs', label: 'Supply Voltage', symbol: 'Vs', min: 1,    max: 24,     step: 0.5,  defaultValue: 5,    unit: 'V'  },
      { id: 'R',  label: 'Resistance',     symbol: 'R',  min: 100,  max: 100000, step: 100,  defaultValue: 1000, unit: 'Ω'  },
      { id: 'C',  label: 'Capacitance',    symbol: 'C',  min: 1e-6, max: 1e-3,   step: 1e-6, defaultValue: 1e-4, unit: 'F'  },
    ],
    outputs: [
      { label: 'Time Constant τ', formula: (v) => v.R * v.C * 1000, unit: 'ms', description: 'τ = RC (63% of Vs)' },
      { label: 'V at 1τ',         formula: (v) => v.Vs * (1 - Math.exp(-1)), unit: 'V',  description: 'Voltage at one τ' },
      { label: 'V at 5τ',         formula: (v) => v.Vs * (1 - Math.exp(-5)), unit: 'V',  description: '≈ Fully charged' },
    ],
    chart: {
      type: 'time',
      title: 'RC Circuit – Capacitor Voltage',
      xLabel: 'Time (ms)',
      yLabel: 'Voltage (V)',
      series: [
        { key: 'charge',    name: 'Charging',    color: '#3B82F6', strokeWidth: 2 },
        { key: 'discharge', name: 'Discharging', color: '#F59E0B', strokeWidth: 2 },
      ],
      generateData: (v) => {
        const tau = v.R * v.C;
        const pts = [];
        for (let i = 0; i <= 200; i++) {
          const t = (5 * tau * i) / 200;
          pts.push({
            x:         +(t * 1000).toFixed(3),
            charge:    +(v.Vs * (1 - Math.exp(-t / tau))).toFixed(4),
            discharge: +(v.Vs * Math.exp(-t / tau)).toFixed(4),
          });
        }
        return pts;
      },
    },
  },
];

// ─── MEDICAL ─────────────────────────────────────────────────────────────────
const medicalScenarios = [
  {
    id: 'pharmacokinetics',
    name: 'Drug Pharmacokinetics',
    description: 'Single-compartment drug concentration over time after oral dose',
    variables: [
      { id: 'D',   label: 'Dose',             symbol: 'D',   min: 10,   max: 1000, step: 10,  defaultValue: 200, unit: 'mg'   },
      { id: 'V',   label: 'Volume of Dist.',   symbol: 'Vd',  min: 5,    max: 100,  step: 1,   defaultValue: 30,  unit: 'L'    },
      { id: 'ka',  label: 'Absorption Rate',   symbol: 'ka',  min: 0.1,  max: 5,    step: 0.1, defaultValue: 1.5, unit: '1/h'  },
      { id: 'ke',  label: 'Elimination Rate',  symbol: 'ke',  min: 0.01, max: 1,    step: 0.01,defaultValue: 0.1, unit: '1/h'  },
      { id: 'MEC', label: 'Min. Effective',    symbol: 'MEC', min: 0,    max: 20,   step: 0.1, defaultValue: 2,   unit: 'mg/L' },
      { id: 'MTC', label: 'Min. Toxic Conc.',  symbol: 'MTC', min: 5,    max: 50,   step: 0.5, defaultValue: 15,  unit: 'mg/L' },
    ],
    outputs: [
      { label: 'Peak Concentration', formula: (v) => {
          const F = 1; const tmax = Math.log(v.ka / v.ke) / (v.ka - v.ke);
          return (F * v.D / v.V) * (v.ka / (v.ka - v.ke)) * (Math.exp(-v.ke * tmax) - Math.exp(-v.ka * tmax));
        }, unit: 'mg/L', description: 'C_max' },
      { label: 'Time to Peak', formula: (v) => Math.log(v.ka / v.ke) / (v.ka - v.ke), unit: 'h', description: 'T_max' },
      { label: 'Half-Life', formula: (v) => Math.log(2) / v.ke, unit: 'h', description: 'Elimination t½' },
    ],
    chart: {
      type: 'time',
      title: 'Drug Concentration–Time Profile',
      xLabel: 'Time (h)',
      yLabel: 'Concentration (mg/L)',
      series: [
        { key: 'conc', name: 'Drug Concentration', color: '#8B5CF6', strokeWidth: 2.5 },
      ],
      therapeuticBand: { min: 'MEC', max: 'MTC' },
      generateData: (v) => {
        const pts = [];
        for (let i = 0; i <= 200; i++) {
          const t = (24 * i) / 200;
          const c = (v.D / v.V) * (v.ka / (v.ka - v.ke)) * (Math.exp(-v.ke * t) - Math.exp(-v.ka * t));
          pts.push({ x: +t.toFixed(3), conc: +Math.max(0, c).toFixed(4), MEC: v.MEC, MTC: v.MTC });
        }
        return pts;
      },
    },
  },
  {
    id: 'spirometry',
    name: 'Lung Function (Spirometry)',
    description: 'Forced Vital Capacity and flow–volume loop during forced expiration',
    variables: [
      { id: 'FVC',  label: 'Forced Vital Cap.', symbol: 'FVC',  min: 1, max: 7,   step: 0.1, defaultValue: 4.5, unit: 'L'   },
      { id: 'FEV1', label: 'FEV₁ ratio',        symbol: 'FEV₁', min: 0.3, max: 1, step: 0.01, defaultValue: 0.8, unit: 'ratio' },
      { id: 'PEF',  label: 'Peak Flow',          symbol: 'PEF',  min: 1, max: 15,  step: 0.5, defaultValue: 8,   unit: 'L/s' },
    ],
    outputs: [
      { label: 'FEV₁ (L)',    formula: (v) => v.FVC * v.FEV1,                     unit: 'L',    description: 'Volume in first second' },
      { label: 'FEV₁/FVC',    formula: (v) => v.FEV1 * 100,                       unit: '%',    description: 'Airway obstruction marker' },
      { label: 'Classification', formula: (v) => v.FEV1 >= 0.7 ? 1 : v.FEV1 >= 0.5 ? 2 : 3, unit: '', description: '1=Normal 2=Moderate 3=Severe' },
    ],
    chart: {
      type: 'xy',
      title: 'Flow–Volume Loop',
      xLabel: 'Volume (L)',
      yLabel: 'Flow (L/s)',
      series: [
        { key: 'expiration',  name: 'Expiration',  color: '#EC4899', strokeWidth: 2.5 },
        { key: 'inspiration', name: 'Inspiration', color: '#3B82F6', strokeWidth: 2,   strokeDasharray: '4 2' },
      ],
      generateData: (v) => {
        const pts = [];
        for (let i = 0; i <= 100; i++) {
          const frac = i / 100;
          const vol = frac * v.FVC;
          const expFlow = v.PEF * Math.exp(-3 * frac) * (1 - Math.exp(-8 * frac));
          const inspFlow = -(v.PEF * 0.5) * Math.sin(Math.PI * frac);
          pts.push({ x: +vol.toFixed(3), expiration: +expFlow.toFixed(3), inspiration: +inspFlow.toFixed(3) });
        }
        return pts;
      },
    },
  },
];

// ─── BIOLOGY ─────────────────────────────────────────────────────────────────
const biologyScenarios = [
  {
    id: 'logistic',
    name: 'Logistic Population Growth',
    description: 'Population N(t) following the logistic model with carrying capacity K',
    variables: [
      { id: 'N0', label: 'Initial Population', symbol: 'N₀', min: 1,    max: 1000,  step: 1,   defaultValue: 10,  unit: ''     },
      { id: 'K',  label: 'Carrying Capacity',  symbol: 'K',  min: 100,  max: 10000, step: 100, defaultValue: 1000, unit: ''    },
      { id: 'r',  label: 'Growth Rate',        symbol: 'r',  min: 0.01, max: 3,     step: 0.01, defaultValue: 0.5, unit: '1/yr' },
    ],
    outputs: [
      { label: 'Inflection Point',    formula: (v) => v.K / 2, unit: '', description: 'Population at max growth' },
      { label: 'Time to K/2',         formula: (v) => Math.log(v.K / v.N0 - 1) / v.r, unit: 'yr', description: 'Time to half capacity' },
      { label: 'Intrinsic Rate rmax', formula: (v) => v.r * v.K / 4, unit: '/yr', description: 'Max absolute growth rate' },
    ],
    chart: {
      type: 'time',
      title: 'Logistic Population Growth',
      xLabel: 'Time (years)',
      yLabel: 'Population',
      series: [
        { key: 'logistic',    name: 'Logistic Growth',    color: '#10B981', strokeWidth: 2.5 },
        { key: 'exponential', name: 'Exponential (uncapped)', color: '#6B7280', strokeWidth: 1.5, strokeDasharray: '5 3' },
      ],
      generateData: (v) => {
        const tEnd = Math.max(20, Math.log(v.K / v.N0 - 1) / v.r * 3);
        const pts = [];
        for (let i = 0; i <= 200; i++) {
          const t = (tEnd * i) / 200;
          const logN = v.K * v.N0 * Math.exp(v.r * t) / (v.K + v.N0 * (Math.exp(v.r * t) - 1));
          const expN = v.N0 * Math.exp(v.r * t);
          pts.push({ x: +t.toFixed(3), logistic: +logN.toFixed(2), exponential: +Math.min(expN, v.K * 3).toFixed(2) });
        }
        return pts;
      },
    },
  },
  {
    id: 'sir',
    name: 'SIR Epidemic Model',
    description: 'Susceptible–Infected–Recovered spread through a population',
    variables: [
      { id: 'N',    label: 'Population Size',   symbol: 'N',    min: 100,  max: 100000, step: 100,  defaultValue: 10000, unit: ''      },
      { id: 'beta', label: 'Transmission Rate', symbol: 'β',    min: 0.01, max: 1,      step: 0.01, defaultValue: 0.3,   unit: '1/day' },
      { id: 'gamma',label: 'Recovery Rate',     symbol: 'γ',    min: 0.01, max: 1,      step: 0.01, defaultValue: 0.1,   unit: '1/day' },
      { id: 'I0',   label: 'Initial Infected',  symbol: 'I₀',   min: 1,    max: 1000,   step: 1,    defaultValue: 10,    unit: ''      },
    ],
    outputs: [
      { label: 'R₀',           formula: (v) => v.beta / v.gamma,                       unit: '',    description: 'Basic reproduction number' },
      { label: 'Herd Immunity', formula: (v) => (1 - 1 / (v.beta / v.gamma)) * 100,    unit: '%',   description: 'Vaccination threshold' },
      { label: 'Peak Day',      formula: (v) => {
          const R0 = v.beta / v.gamma;
          return Math.log((v.N - v.I0) / (v.N / R0)) / (v.beta - v.gamma);
        }, unit: 'day', description: 'Day of maximum infections' },
    ],
    chart: {
      type: 'time',
      title: 'SIR Epidemic Model',
      xLabel: 'Days',
      yLabel: 'People',
      series: [
        { key: 'S', name: 'Susceptible', color: '#3B82F6', strokeWidth: 2 },
        { key: 'I', name: 'Infected',    color: '#EF4444', strokeWidth: 2.5 },
        { key: 'R', name: 'Recovered',   color: '#10B981', strokeWidth: 2 },
      ],
      generateData: (v) => {
        let S = v.N - v.I0, I = v.I0, R = 0;
        const dt = 0.1;
        const days = 160;
        const pts = [];
        for (let t = 0; t <= days; t += dt) {
          if (t % 0.8 < dt) pts.push({ x: +t.toFixed(1), S: +S.toFixed(0), I: +I.toFixed(0), R: +R.toFixed(0) });
          const dS = -(v.beta / v.N) * S * I * dt;
          const dI = ((v.beta / v.N) * S * I - v.gamma * I) * dt;
          const dR = v.gamma * I * dt;
          S += dS; I += dI; R += dR;
        }
        return pts;
      },
    },
  },
];

// ─── STATISTICS ──────────────────────────────────────────────────────────────

const statisticsScenarios = [
  {
    id: 'normal',
    name: 'Normal Distribution',
    description: 'Gaussian probability density with mean μ and standard deviation σ',
    variables: [
      { id: 'mu',    label: 'Mean',              symbol: 'μ',  min: -10, max: 10,  step: 0.1, defaultValue: 0,   unit: ''  },
      { id: 'sigma', label: 'Std. Deviation',    symbol: 'σ',  min: 0.1, max: 5,   step: 0.1, defaultValue: 1,   unit: ''  },
      { id: 'x1',   label: 'Shaded Region Low',  symbol: 'x₁', min: -15, max: 15,  step: 0.1, defaultValue: -1,  unit: ''  },
      { id: 'x2',   label: 'Shaded Region High', symbol: 'x₂', min: -15, max: 15,  step: 0.1, defaultValue: 1,   unit: ''  },
    ],
    outputs: [
      { label: 'P(x₁ < X < x₂)', formula: (v) => {
          const phiNorm = (x) => Phi((x - v.mu) / v.sigma);
          return (phiNorm(v.x2) - phiNorm(v.x1)) * 100;
        }, unit: '%', description: 'Probability in shaded region' },
      { label: 'Skewness', formula: () => 0,                     unit: '',    description: 'Normal is symmetric' },
      { label: 'Kurtosis', formula: () => 3,                     unit: '',    description: 'Excess kurtosis = 0' },
    ],
    chart: {
      type: 'area',
      title: 'Normal Distribution',
      xLabel: 'x',
      yLabel: 'Probability Density',
      series: [
        { key: 'pdf',    name: 'PDF',    color: '#6366F1', strokeWidth: 2.5 },
        { key: 'shaded', name: 'P(x₁<X<x₂)', color: '#A5B4FC', strokeWidth: 0 },
      ],
      generateData: (v) => {
        const lo = v.mu - 4 * v.sigma;
        const hi = v.mu + 4 * v.sigma;
        const pts = [];
        for (let i = 0; i <= 200; i++) {
          const x = lo + ((hi - lo) * i) / 200;
          const pdf = (1 / (v.sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - v.mu) / v.sigma) ** 2);
          const inRegion = x >= Math.min(v.x1, v.x2) && x <= Math.max(v.x1, v.x2);
          pts.push({ x: +x.toFixed(4), pdf: +pdf.toFixed(6), shaded: inRegion ? +pdf.toFixed(6) : 0 });
        }
        return pts;
      },
    },
  },
  {
    id: 'regression',
    name: 'Linear Regression',
    description: 'Fit a line y = mx + b to data with adjustable noise and slope',
    variables: [
      { id: 'm',     label: 'True Slope',   symbol: 'm',  min: -5,  max: 5,   step: 0.1, defaultValue: 1.5,  unit: ''   },
      { id: 'b',     label: 'True Intercept', symbol: 'b', min: -10, max: 10,  step: 0.5, defaultValue: 2,    unit: ''   },
      { id: 'noise', label: 'Noise Level', symbol: 'σ',   min: 0,   max: 10,  step: 0.1, defaultValue: 2,    unit: ''   },
      { id: 'n',     label: 'Data Points', symbol: 'n',   min: 5,   max: 50,  step: 1,   defaultValue: 20,   unit: ''   },
    ],
    outputs: [
      { label: 'R² (approx)',   formula: (v) => {
          const snr = (v.m * 5) ** 2 / (v.noise ** 2 || 0.001);
          return Math.min(1, snr / (snr + 1));
        }, unit: '', description: 'Coefficient of determination' },
      { label: 'Std Error',    formula: (v) => v.noise / Math.sqrt(v.n || 1), unit: '', description: 'SE of the mean' },
      { label: 'y at x=10',   formula: (v) => v.m * 10 + v.b,               unit: '', description: 'Regression prediction' },
    ],
    chart: {
      type: 'scatter',
      title: 'Linear Regression',
      xLabel: 'x',
      yLabel: 'y',
      series: [
        { key: 'data', name: 'Data',       color: '#3B82F6', fill: '#93C5FD', r: 4 },
        { key: 'fit',  name: 'Regression', color: '#EF4444', strokeWidth: 2 },
      ],
      generateData: (v) => {
        // Seeded pseudo-random using a simple LCG
        let seed = 42;
        const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967296; };
        const raw = [];
        for (let i = 0; i < v.n; i++) {
          const x = rand() * 10;
          const y = v.m * x + v.b + (rand() - 0.5) * 2 * v.noise;
          raw.push({ x: +x.toFixed(3), data: +y.toFixed(3), fit: undefined });
        }
        // Compute OLS
        const xs = raw.map(p => p.x), ys = raw.map(p => p.data);
        const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
        const my = ys.reduce((a, b) => a + b, 0) / ys.length;
        const ssxy = xs.reduce((s, xi, i) => s + (xi - mx) * (ys[i] - my), 0);
        const ssxx = xs.reduce((s, xi) => s + (xi - mx) ** 2, 0);
        const slope = ssxy / (ssxx || 1), intercept = my - slope * mx;
        // Add regression line points
        raw.push({ x: 0, data: undefined, fit: +(intercept).toFixed(3) });
        raw.push({ x: 10, data: undefined, fit: +(10 * slope + intercept).toFixed(3) });
        return raw.sort((a, b) => a.x - b.x);
      },
    },
  },
];

// ─── FINANCE ─────────────────────────────────────────────────────────────────
const financeScenarios = [
  {
    id: 'compound',
    name: 'Compound Interest',
    description: 'Growth of an investment with periodic compounding and optional regular contributions',
    variables: [
      { id: 'P',  label: 'Principal',          symbol: 'P',  min: 100,  max: 1000000, step: 100,  defaultValue: 10000, unit: '$'   },
      { id: 'r',  label: 'Annual Rate',         symbol: 'r',  min: 0.1,  max: 30,      step: 0.1,  defaultValue: 7,     unit: '%'   },
      { id: 'n',  label: 'Compounds / Year',    symbol: 'n',  min: 1,    max: 365,     step: 1,    defaultValue: 12,    unit: '/yr' },
      { id: 't',  label: 'Years',               symbol: 't',  min: 1,    max: 50,      step: 1,    defaultValue: 20,    unit: 'yr'  },
      { id: 'pmt',label: 'Monthly Contribution',symbol: 'PMT',min: 0,    max: 10000,   step: 50,   defaultValue: 200,   unit: '$/mo'},
    ],
    outputs: [
      { label: 'Final Balance',    formula: (v) => {
          const rate = v.r / 100, pmt = v.pmt;
          const lump = v.P * (1 + rate / v.n) ** (v.n * v.t);
          const contrib = pmt * 12 * ((((1 + rate / v.n) ** (v.n * v.t)) - 1) / (rate / v.n));
          return lump + contrib;
        }, unit: '$', description: 'Total account value' },
      { label: 'Interest Earned',  formula: (v) => {
          const rate = v.r / 100, pmt = v.pmt;
          const total = v.P * (1 + rate / v.n) ** (v.n * v.t) + pmt * 12 * ((((1 + rate / v.n) ** (v.n * v.t)) - 1) / (rate / v.n));
          return total - v.P - pmt * 12 * v.t;
        }, unit: '$', description: 'Total interest / gains' },
      { label: 'Real Rate (approx)', formula: (v) => (1 + v.r / 100) ** (1 / 12) - 1, unit: '', description: 'Monthly rate' },
    ],
    chart: {
      type: 'area',
      title: 'Compound Interest Growth',
      xLabel: 'Years',
      yLabel: 'Portfolio Value ($)',
      series: [
        { key: 'principal', name: 'Contributions',    color: '#9CA3AF', fill: '#D1D5DB', strokeWidth: 0 },
        { key: 'balance',   name: 'Balance w/ Interest', color: '#F59E0B', fill: '#FDE68A', strokeWidth: 2 },
      ],
      generateData: (v) => {
        const rate = v.r / 100;
        const pts = [];
        for (let i = 0; i <= v.t * 12; i++) {
          const t = i / 12;
          const balance = v.P * (1 + rate / v.n) ** (v.n * t)
            + v.pmt * (((1 + rate / v.n) ** (v.n * t) - 1) / (rate / v.n || 1));
          const contributed = v.P + v.pmt * i;
          pts.push({ x: +t.toFixed(2), balance: +balance.toFixed(2), principal: +contributed.toFixed(2) });
        }
        return pts;
      },
    },
  },
  {
    id: 'blackscholes',
    name: 'Option Pricing (Black-Scholes)',
    description: 'European call and put option values vs. stock price',
    variables: [
      { id: 'S',   label: 'Stock Price',    symbol: 'S',  min: 1,   max: 500,  step: 1,   defaultValue: 100, unit: '$'  },
      { id: 'K',   label: 'Strike Price',   symbol: 'K',  min: 1,   max: 500,  step: 1,   defaultValue: 100, unit: '$'  },
      { id: 'T',   label: 'Time to Expiry', symbol: 'T',  min: 0.01,max: 3,    step: 0.01,defaultValue: 0.5, unit: 'yr' },
      { id: 'sig', label: 'Volatility',     symbol: 'σ',  min: 0.01,max: 1,    step: 0.01,defaultValue: 0.2, unit: ''   },
      { id: 'rf',  label: 'Risk-Free Rate', symbol: 'r',  min: 0,   max: 0.2,  step: 0.005,defaultValue:0.05,unit: ''   },
    ],
    outputs: [
      { label: 'Call Price', formula: (v) => {
          const d1 = (Math.log(v.S / v.K) + (v.rf + 0.5 * v.sig ** 2) * v.T) / (v.sig * Math.sqrt(v.T));
          const d2 = d1 - v.sig * Math.sqrt(v.T);
          return v.S * Phi(d1) - v.K * Math.exp(-v.rf * v.T) * Phi(d2);
        }, unit: '$', description: 'European call option' },
      { label: 'Put Price', formula: (v) => {
          const d1 = (Math.log(v.S / v.K) + (v.rf + 0.5 * v.sig ** 2) * v.T) / (v.sig * Math.sqrt(v.T));
          const d2 = d1 - v.sig * Math.sqrt(v.T);
          return v.K * Math.exp(-v.rf * v.T) * Phi(-d2) - v.S * Phi(-d1);
        }, unit: '$', description: 'European put option' },
      { label: 'Delta (Call)', formula: (v) => {
          const d1 = (Math.log(v.S / v.K) + (v.rf + 0.5 * v.sig ** 2) * v.T) / (v.sig * Math.sqrt(v.T));
          return Phi(d1);
        }, unit: '', description: 'Δ = dC/dS' },
    ],
    chart: {
      type: 'time',
      title: 'Option Value vs. Stock Price',
      xLabel: 'Stock Price ($)',
      yLabel: 'Option Value ($)',
      series: [
        { key: 'call', name: 'Call Value', color: '#10B981', strokeWidth: 2.5 },
        { key: 'put',  name: 'Put Value',  color: '#EF4444', strokeWidth: 2.5 },
      ],
      generateData: (v) => {
        const pts = [];
        const sMin = Math.max(1, v.K * 0.3), sMax = v.K * 2;
        for (let i = 0; i <= 150; i++) {
          const S = sMin + ((sMax - sMin) * i) / 150;
          const d1 = (Math.log(S / v.K) + (v.rf + 0.5 * v.sig ** 2) * v.T) / (v.sig * Math.sqrt(v.T));
          const d2 = d1 - v.sig * Math.sqrt(v.T);
          const call = S * Phi(d1) - v.K * Math.exp(-v.rf * v.T) * Phi(d2);
          const put  = v.K * Math.exp(-v.rf * v.T) * Phi(-d2) - S * Phi(-d1);
          pts.push({ x: +S.toFixed(2), call: +Math.max(0, call).toFixed(3), put: +Math.max(0, put).toFixed(3) });
        }
        return pts;
      },
    },
  },
];

// ─── DOMAINS EXPORT ──────────────────────────────────────────────────────────
export const DOMAINS = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    color: '#3B82F6',
    scenarios: physicsScenarios,
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '⚙️',
    color: '#EF4444',
    scenarios: engineeringScenarios,
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: '🩺',
    color: '#EC4899',
    scenarios: medicalScenarios,
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    color: '#10B981',
    scenarios: biologyScenarios,
  },
  {
    id: 'statistics',
    name: 'Statistics',
    icon: '📊',
    color: '#6366F1',
    scenarios: statisticsScenarios,
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💹',
    color: '#F59E0B',
    scenarios: financeScenarios,
  },
];
