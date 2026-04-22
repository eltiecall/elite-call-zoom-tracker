import { Stats } from '@/lib/stats'

export default function MetricCards({ stats, label }: { stats: Stats; label: string }) {
  return (
    <div className="metrics-grid">
      <div className="metric">
        <div className="metric-label">Total Zooms</div>
        <div className="metric-value">{stats.total}</div>
        <div className="metric-sub">{label}</div>
      </div>
      <div className="metric">
        <div className="metric-label">Sat Rate</div>
        <div className="metric-value">{stats.satPct.toFixed(1)}%</div>
        <div className="metric-sub">{stats.sat} sat / {stats.missed} missed</div>
      </div>
      <div className="metric green">
        <div className="metric-label">Unique Close Rate</div>
        <div className="metric-value">{stats.closeRate.toFixed(1)}%</div>
        <div className="metric-sub">{stats.uniqueClosed} closed / {stats.uniqueSat} unique accts sat</div>
      </div>
      <div className="metric">
        <div className="metric-label">Deals Closed</div>
        <div className="metric-value">{stats.uniqueClosed}</div>
        <div className="metric-sub">Unique accounts</div>
      </div>
      <div className="metric amber">
        <div className="metric-label">Pipeline</div>
        <div className="metric-value">${(stats.pipeline / 1000).toFixed(0)}k</div>
        <div className="metric-sub">Proposals + Closed /mo</div>
      </div>
      <div className="metric green">
        <div className="metric-label">Closed Rev</div>
        <div className="metric-value">${stats.closedRevenue.toLocaleString()}</div>
        <div className="metric-sub">Confirmed /mo</div>
      </div>
    </div>
  )
}
