/** NumericalOutput.jsx – Displays computed outputs for the current scenario */

function formatNumber(n) {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9) return n.toExponential(3);
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(3) + 'M';
  if (Math.abs(n) >= 1e4) return n.toFixed(1);
  if (Math.abs(n) >= 10)  return n.toFixed(3);
  return n.toPrecision(5);
}

export default function NumericalOutput({ outputs, values, domainColor }) {
  return (
    <div className="numerical-output">
      <h3 className="panel-heading">Computed Outputs</h3>
      <div className="output-grid">
        {outputs.map((out, i) => {
          let result;
          try {
            result = out.formula(values);
          } catch {
            result = NaN;
          }
          return (
            <div key={i} className="output-card" style={{ borderTopColor: domainColor }}>
              <span className="output-label">{out.label}</span>
              <span className="output-value" style={{ color: domainColor }}>
                {formatNumber(result)}
                {out.unit ? <span className="output-unit"> {out.unit}</span> : null}
              </span>
              <span className="output-desc">{out.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
