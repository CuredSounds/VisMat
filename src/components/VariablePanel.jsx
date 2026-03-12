/** VariablePanel.jsx – Sliders and numeric inputs for all scenario variables */

function formatVal(v) {
  if (Math.abs(v) >= 1e6 || (Math.abs(v) < 0.01 && v !== 0)) {
    return v.toExponential(3);
  }
  return parseFloat(v.toPrecision(5)).toString();
}

function VariableSlider({ variable, value, onChange }) {
  const { id, label, symbol, min, max, step, unit } = variable;

  const handleSlider = (e) => {
    let v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(id, v);
  };

  const handleInput = (e) => {
    const raw = e.target.value;
    const v = parseFloat(raw);
    if (!isNaN(v)) onChange(id, Math.min(max, Math.max(min, v)));
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
            type="number"
            value={formatVal(value)}
            min={min}
            max={max}
            step={step}
            onChange={handleInput}
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
          style={{ '--pct': `${percent}%` }}
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
