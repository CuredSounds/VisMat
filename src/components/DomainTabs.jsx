/** DomainTabs.jsx – Row of domain selector tabs */
export default function DomainTabs({ domains, selectedId, onSelect }) {
  return (
    <div className="domain-tabs">
      {domains.map((d) => (
        <button
          key={d.id}
          className={`domain-tab${selectedId === d.id ? ' active' : ''}`}
          style={selectedId === d.id ? { borderBottomColor: d.color, color: d.color } : {}}
          onClick={() => onSelect(d.id)}
          title={d.name}
        >
          <span className="domain-icon">{d.icon}</span>
          <span className="domain-name">{d.name}</span>
        </button>
      ))}
    </div>
  );
}
