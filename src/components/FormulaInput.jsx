/** FormulaInput.jsx – Custom expression evaluator using mathjs */
import { useState, useCallback } from 'react';
import { evaluate, format } from 'mathjs';

export default function FormulaInput({ values }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const compute = useCallback(() => {
    if (!expr.trim()) { setResult(null); setError(''); return; }
    try {
      // Build a mathjs scope from all current variable values
      const scope = { ...values, pi: Math.PI, e: Math.E };
      const val = evaluate(expr, scope);
      setResult(format(val, { notation: 'auto', precision: 8 }));
      setError('');
    } catch (err) {
      setError(err.message || 'Invalid expression');
      setResult(null);
    }
  }, [expr, values]);

  const handleKey = (e) => {
    if (e.key === 'Enter') compute();
  };

  return (
    <div className="formula-input">
      <h3 className="panel-heading">Custom Expression</h3>
      <p className="formula-hint">
        All variable symbols are in scope. Use mathjs syntax, e.g.{' '}
        <code>v0^2 * sin(angle * pi / 180) / g</code>
      </p>
      <div className="formula-row">
        <span className="formula-prompt">ƒ( ) =</span>
        <input
          className="formula-text"
          type="text"
          value={expr}
          placeholder="Enter expression…"
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={handleKey}
          spellCheck={false}
        />
        <button className="formula-eval-btn" onClick={compute}>
          Evaluate
        </button>
      </div>
      {error && <div className="formula-error">⚠ {error}</div>}
      {result !== null && !error && (
        <div className="formula-result">
          <span className="formula-result-label">Result:</span>
          <span className="formula-result-value">{result}</span>
        </div>
      )}
    </div>
  );
}
