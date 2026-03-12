/** ScenarioList.jsx – Selectable list of scenarios within a domain */
export default function ScenarioList({ scenarios, selectedId, onSelect, domainColor }) {
  return (
    <div className="scenario-list">
      <h3 className="panel-heading">Scenarios</h3>
      {scenarios.map((s) => (
        <button
          key={s.id}
          className={`scenario-btn${selectedId === s.id ? ' active' : ''}`}
          style={selectedId === s.id ? { borderLeftColor: domainColor, backgroundColor: `${domainColor}18` } : {}}
          onClick={() => onSelect(s.id)}
        >
          <span className="scenario-name">{s.name}</span>
          <span className="scenario-desc">{s.description}</span>
        </button>
      ))}
    </div>
  );
}
