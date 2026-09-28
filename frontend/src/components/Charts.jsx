import React from 'react';

// 1. Circular Donut Gauge for Match Percentages & Metrics
export function DonutGauge({ value = 0, size = 64, strokeWidth = 6, title, subtitle, color = '#076a6f', mint = '#9df4c7' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2f5ee"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gauge-grad-${value})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <defs>
            <linearGradient id={`gauge-grad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={mint} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: size < 55 ? '12px' : '14px',
            fontWeight: 800,
            color: '#076a6f'
          }}
        >
          {value}%
        </div>
      </div>
      {(title || subtitle) && (
        <div>
          {title && <div style={{ fontSize: '13px', fontWeight: 700, color: '#093a3d' }}>{title}</div>}
          {subtitle && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
}

// 2. Horizontal Bar Graph for Distributions & Skill Metrics
export function BarGraph({ items = [], height = 12 }) {
  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {items.map((item, idx) => {
        const pct = Math.round((item.value / maxVal) * 100);
        return (
          <div key={idx} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: '#076a6f' }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: '#094c50' }}>{item.displayValue || `${item.value} (${pct}%)`}</span>
            </div>
            <div
              style={{
                height: `${height}px`,
                background: '#e4f7f0',
                borderRadius: '99px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: item.color || 'linear-gradient(90deg, #9df4c7, #076a6f)',
                  borderRadius: '99px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. Multi-Segment Donut / Pie Chart for Department & Category Breakdown
export function DonutPieChart({ data = [], size = 130, innerRadius = 42 }) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  let accumulatedAngle = 0;

  const defaultColors = ['#076a6f', '#14999e', '#5cdb95', '#9df4c7', '#34d399', '#059669'];

  const segments = data.map((d, i) => {
    const valuePct = d.value / total;
    const angle = valuePct * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    return {
      ...d,
      pct: Math.round(valuePct * 100),
      startAngle,
      endAngle: accumulatedAngle,
      color: d.color || defaultColors[i % defaultColors.length]
    };
  });

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 10px rgba(7,106,111,0.12))' }}>
        {segments.map((seg, i) => {
          const startPct = seg.startAngle / 360;
          const endPct = seg.endAngle / 360;
          const [startX, startY] = getCoordinatesForPercent(startPct);
          const [endX, endY] = getCoordinatesForPercent(endPct);
          const largeArcFlag = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`
          ].join(' ');

          return <path key={i} d={pathData} fill={seg.color} stroke="#ffffff" strokeWidth="0.03" />;
        })}
        <circle cx="0" cy="0" r={innerRadius / (size / 2)} fill="#ffffff" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
              <span style={{ color: '#0d2829', fontWeight: 600 }}>{seg.label}</span>
            </div>
            <span style={{ fontWeight: 700, color: '#076a6f' }}>{seg.value} ({seg.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Multi-Factor Scoring Breakdown Bar for Candidate Match Detail
export function ScoreBreakdownBar({ breakdown = {} }) {
  const {
    skillOverlap = 45,
    vectorSimilarity = 12,
    experienceRatio = 12,
    interestAlignment = 8,
    performance = 8
  } = breakdown;

  const total = skillOverlap + vectorSimilarity + experienceRatio + interestAlignment + performance;

  return (
    <div style={{ width: '100%', marginTop: '6px' }}>
      <div style={{ display: 'flex', height: '10px', borderRadius: '99px', overflow: 'hidden', gap: '2px', background: '#e5f6f0' }}>
        <div style={{ width: `${(skillOverlap / 100) * 100}%`, background: '#076a6f' }} title={`Skill Overlap: ${skillOverlap}%`} />
        <div style={{ width: `${(vectorSimilarity / 100) * 100}%`, background: '#14999e' }} title={`Vector Similarity: ${vectorSimilarity}%`} />
        <div style={{ width: `${(experienceRatio / 100) * 100}%`, background: '#5cdb95' }} title={`Experience: ${experienceRatio}%`} />
        <div style={{ width: `${(interestAlignment / 100) * 100}%`, background: '#9df4c7' }} title={`Interest: ${interestAlignment}%`} />
        <div style={{ width: `${(performance / 100) * 100}%`, background: '#22d386' }} title={`Performance: ${performance}%`} />
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--muted)', marginTop: '6px' }}>
        <span style={{ color: '#076a6f', fontWeight: 700 }}>■ Skills ({skillOverlap}%)</span>
        <span style={{ color: '#14999e', fontWeight: 700 }}>■ TF-IDF ({vectorSimilarity}%)</span>
        <span style={{ color: '#2b9060', fontWeight: 700 }}>■ Exp ({experienceRatio}%)</span>
        <span style={{ color: '#076a6f', fontWeight: 700 }}>■ Interest ({interestAlignment}%)</span>
        <span style={{ color: '#16a34a', fontWeight: 700 }}>■ Perf ({performance}%)</span>
      </div>
    </div>
  );
}
