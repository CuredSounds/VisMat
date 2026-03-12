import { useState, useMemo, useCallback } from 'react';
import './App.css';

import { DOMAINS } from './domains';
import DomainTabs    from './components/DomainTabs';
import ScenarioList  from './components/ScenarioList';
import VariablePanel from './components/VariablePanel';
import NumericalOutput from './components/NumericalOutput';
import ChartPanel    from './components/ChartPanel';
import FormulaInput  from './components/FormulaInput';

// Build initial variable values for a scenario
function initValues(scenario) {
  const vals = {};
  for (const v of scenario.variables) vals[v.id] = v.defaultValue;
  return vals;
}

export default function App() {
  const [domainId,    setDomainId]    = useState(DOMAINS[0].id);
  const [scenarioId,  setScenarioId]  = useState(DOMAINS[0].scenarios[0].id);
  const [varValues,   setVarValues]   = useState(() => initValues(DOMAINS[0].scenarios[0]));

  const domain   = useMemo(() => DOMAINS.find((d) => d.id === domainId),   [domainId]);
  const scenario = useMemo(() => domain.scenarios.find((s) => s.id === scenarioId), [domain, scenarioId]);

  const selectDomain = useCallback((id) => {
    const d = DOMAINS.find((dom) => dom.id === id);
    const s = d.scenarios[0];
    setDomainId(id);
    setScenarioId(s.id);
    setVarValues(initValues(s));
  }, []);

  const selectScenario = useCallback((id) => {
    const s = domain.scenarios.find((sc) => sc.id === id);
    setScenarioId(id);
    setVarValues(initValues(s));
  }, [domain]);

  const handleVarChange = useCallback((id, value) => {
    setVarValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  return (
    <div className="app">
      {/* ─── TOP NAV ─── */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">∑</span>
          <span className="brand-name">VisMat</span>
          <span className="brand-tagline">Visual Mathematics</span>
        </div>
        <DomainTabs domains={DOMAINS} selectedId={domainId} onSelect={selectDomain} />
      </header>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="app-body">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="sidebar">
          <ScenarioList
            scenarios={domain.scenarios}
            selectedId={scenarioId}
            onSelect={selectScenario}
            domainColor={domain.color}
          />
          <VariablePanel
            variables={scenario.variables}
            values={varValues}
            onChange={handleVarChange}
          />
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="content">
          <ChartPanel scenario={scenario} values={varValues} />

          <div className="bottom-row">
            <NumericalOutput
              outputs={scenario.outputs}
              values={varValues}
              domainColor={domain.color}
            />
            <FormulaInput values={varValues} />
          </div>
        </main>
      </div>
    </div>
  );
}
