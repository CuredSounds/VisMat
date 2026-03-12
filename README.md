# VisMat – Visual Mathematics

A mathematics app that allows users to enter variables (including sliders) with numerical and visual output across multiple STEM domains.

## Features

- **Variable Input** – Enter variables with interactive sliders and direct numeric input
- **Custom Expressions** – Evaluate arbitrary mathjs expressions using all defined variable values
- **Numerical Output** – Computed results displayed as labeled metric cards
- **STEM Domains** – Six selectable science domains, each with two scenarios:
  | Domain | Scenarios |
  |---|---|
  | ⚛️ Physics | Projectile Motion, Wave Superposition |
  | ⚙️ Engineering | Cantilever Beam Deflection, RC Circuit |
  | 🩺 Medical | Drug Pharmacokinetics, Spirometry |
  | 🧬 Biology | Logistic Population Growth, SIR Epidemic Model |
  | 📊 Statistics | Normal Distribution, Linear Regression |
  | 💹 Finance | Compound Interest, Option Pricing (Black-Scholes) |
- **Dynamic Visualizations** – Recharts-powered interactive charts (line, area, scatter) that update in real time as sliders are adjusted
- **Storytelling Annotations** – Reference lines, therapeutic bands, and descriptive labels provide context

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- [mathjs](https://mathjs.org/) – expression evaluation
- [Recharts](https://recharts.org/) – charts and visualizations
