/**
 * ChartPanel.jsx – Recharts-based visualization panel.
 * Supports: xy line charts, time-series, area charts, scatter charts.
 */
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
  Scatter,
  ReferenceLine,
} from 'recharts';

// Adaptive tick formatter
const tickFmt = (v) => {
  if (typeof v !== 'number') return v;
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(0) + 'k';
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 1)   return v.toFixed(2);
  return v.toPrecision(3);
};

const CustomTooltip = ({ active, payload, label, xLabel }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-x">{xLabel}: {typeof label === 'number' ? label.toPrecision(5) : label}</p>
      {payload.map((entry, i) => (
        entry.value !== undefined && entry.value !== null ? (
          <p key={i} className="tooltip-row" style={{ color: entry.color }}>
            {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toPrecision(5) : entry.value}</strong>
          </p>
        ) : null
      ))}
    </div>
  );
};

function renderLineChart(data, series, xLabel, yLabel, referenceLines, values) {
  return (
    <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="x"
        type="number"
        domain={['auto', 'auto']}
        tickFormatter={tickFmt}
        label={{ value: xLabel, position: 'insideBottom', offset: -25, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <YAxis
        tickFormatter={tickFmt}
        label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <Tooltip content={<CustomTooltip xLabel={xLabel} />} />
      <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, color: '#D1D5DB' }} />
      {(referenceLines || []).map((rl, i) => {
        const val = typeof rl.value === 'function' ? rl.value(values) : rl.value;
        return (
          <ReferenceLine key={i} y={val} stroke={rl.color} strokeDasharray="4 2"
            label={{ value: rl.label, fill: rl.color, fontSize: 11 }} />
        );
      })}
      {series.map((s) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name}
          stroke={s.color}
          strokeWidth={s.strokeWidth ?? 2}
          dot={false}
          strokeDasharray={s.strokeDasharray}
        />
      ))}
    </LineChart>
  );
}

function renderAreaChart(data, series, xLabel, yLabel) {
  return (
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
      <defs>
        {series.map((s) => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={s.fill ?? s.color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={s.fill ?? s.color} stopOpacity={0.1} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="x"
        type="number"
        domain={['auto', 'auto']}
        tickFormatter={tickFmt}
        label={{ value: xLabel, position: 'insideBottom', offset: -25, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <YAxis
        tickFormatter={tickFmt}
        label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <Tooltip content={<CustomTooltip xLabel={xLabel} />} />
      <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, color: '#D1D5DB' }} />
      {series.map((s) => (
        <Area
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name}
          stroke={s.color}
          fill={`url(#grad-${s.key})`}
          strokeWidth={s.strokeWidth ?? 2}
        />
      ))}
    </AreaChart>
  );
}

function renderScatterChart(data, series, xLabel, yLabel) {
  // Separate data series
  const dataSeries  = series.find((s) => s.key === 'data');
  const lineSeries  = series.find((s) => s.key === 'fit');
  const scatterData = data.filter((p) => p.data !== undefined).map((p) => ({ x: p.x, y: p.data }));
  const lineData    = data.filter((p) => p.fit  !== undefined).map((p) => ({ x: p.x, y: p.fit  }));
  return (
    <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="x"
        type="number"
        name={xLabel}
        domain={['auto', 'auto']}
        tickFormatter={tickFmt}
        label={{ value: xLabel, position: 'insideBottom', offset: -25, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <YAxis
        dataKey="y"
        type="number"
        name={yLabel}
        domain={['auto', 'auto']}
        tickFormatter={tickFmt}
        label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15, fill: '#9CA3AF', fontSize: 12 }}
        tick={{ fill: '#9CA3AF', fontSize: 11 }}
      />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip xLabel={xLabel} />} />
      <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, color: '#D1D5DB' }} />
      {dataSeries && (
        <Scatter name={dataSeries.name} data={scatterData} fill={dataSeries.fill ?? dataSeries.color} />
      )}
      {lineSeries && (
        <Scatter name={lineSeries.name} data={lineData} line={{ stroke: lineSeries.color, strokeWidth: lineSeries.strokeWidth ?? 2 }} fill="none" shape={() => null} />
      )}
    </ScatterChart>
  );
}

export default function ChartPanel({ scenario, values }) {
  if (!scenario) return <div className="chart-empty">Select a scenario to visualise.</div>;

  const { chart } = scenario;
  let data;
  try {
    data = chart.generateData(values);
  } catch {
    data = [];
  }

  const { type, title, xLabel, yLabel, series, referenceLines } = chart;

  let inner;
  if (type === 'scatter') {
    inner = renderScatterChart(data, series, xLabel, yLabel);
  } else if (type === 'area') {
    inner = renderAreaChart(data, series, xLabel, yLabel);
  } else {
    inner = renderLineChart(data, series, xLabel, yLabel, referenceLines, values);
  }

  return (
    <div className="chart-panel">
      <h2 className="chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={380}>
        {inner}
      </ResponsiveContainer>
      <p className="chart-desc">{scenario.description}</p>
    </div>
  );
}
