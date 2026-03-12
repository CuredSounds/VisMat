/** VariablePanel.jsx – Sliders and numeric inputs for all scenario variables */
import { useState, useEffect } from 'react';

function formatVal(v) {
  if (Math.abs(v) >= 1e6 || (Math.abs(v) < 0.01 && v !== 0)) {
    return v.toExponential(3);
  }
  return parseFloat(v.toPrecision(5)).toString();
}

function VariableSlider({ variable, value, onChange }) {
  const { id, label, symbol, min, max, step, unit } = variable;

  // Keep a local raw string so the user can type freely without reformatting mid-entry
  const [raw, setRaw] = useState(formatVal(value));
  // Keep raw in sync when value changes from slider or external reset
  useEffect(() => { setRaw(formatVal(value)); }, [value]);

  const handleSlider = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(id, v);
  };

  const handleInputChange = (e) => {
    setRaw(e.target.value);
  };

  const commitInput = () => {
    const v = parseFloat(raw);
    if (!isNaN(v)) {
      onChange(id, Math.min(max, Math.max(min, v)));
    } else {
      // Restore formatted display of current value if input is invalid
      setRaw(formatVal(value));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.target.blur(); }
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="variable-row">
      <div className="variable-header">
        <span className="variable-label">
          <span className="variable-symbol">{symbol}</span>
          {label}
        </span>
        <span className="variable-value-badge">
          <input
            className="variable-num-input"
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={handleKeyDown}
          />
          <span className="variable-unit">{unit}</span>
        </span>
      </div>
      <div className="slider-track-wrap">
        <input
          className="slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSlider}
          style={{ '--pct': `${Math.min(100, Math.max(0, percent)).toFixed(2)}%` }}
        />
      </div>
      <div className="slider-bounds">
        <span>{formatVal(min)}</span>
        <span>{formatVal(max)}</span>
      </div>
    </div>
  );
}

export default function VariablePanel({ variables, values, onChange }) {
  return (
    <div className="variable-panel">
      <h3 className="panel-heading">Variables</h3>
      {variables.map((v) => (
        <VariableSlider
          key={v.id}
          variable={v}
          value={values[v.id] ?? v.defaultValue}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
