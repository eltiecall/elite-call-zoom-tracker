import { TrendInsight } from '@/lib/stats'

const TYPE_ICONS: Record<string, string> = {
  positive: '↑',
  negative: '↓',
  warning: '!',
  neutral: '→',
}

export default function TrendsPanel({ trends }: { trends: TrendInsight[] }) {
  if (trends.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: 13, background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.1)', marginBottom: 20 }}>
        No trends to display yet. Add more zoom data to generate insights.
      </div>
    )
  }

  const negativeWarning = trends.filter(t => t.type === 'negative' || t.type === 'warning')
  const positive = trends.filter(t => t.type === 'positive')
  const neutral = trends.filter(t => t.type === 'neutral')

  return (
    <div>
      {negativeWarning.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Action Items — {negativeWarning.length} flagged
          </div>
          <div className="trends-grid" style={{ marginBottom: 20 }}>
            {negativeWarning.map((t, i) => (
              <TrendCard key={i} trend={t} />
            ))}
          </div>
        </>
      )}
      {positive.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, marginTop: negativeWarning.length > 0 ? 4 : 0 }}>
            Wins — {positive.length} highlights
          </div>
          <div className="trends-grid" style={{ marginBottom: 20 }}>
            {positive.map((t, i) => (
              <TrendCard key={i} trend={t} />
            ))}
          </div>
        </>
      )}
      {neutral.length > 0 && (
        <div className="trends-grid">
          {neutral.map((t, i) => <TrendCard key={i} trend={t} />)}
        </div>
      )}
    </div>
  )
}

function TrendCard({ trend }: { trend: TrendInsight }) {
  return (
    <div className={`trend-card ${trend.type}`}>
      <div className="trend-rep">{trend.rep}</div>
      <div className="trend-header">
        <div className="trend-title">{trend.title}</div>
        <div className={`trend-badge ${trend.type}`}>
          {TYPE_ICONS[trend.type]} {trend.type}
        </div>
      </div>
      <div className="trend-detail">{trend.detail}</div>
      {trend.metric && <div className="trend-metric">{trend.metric}</div>}
    </div>
  )
}
