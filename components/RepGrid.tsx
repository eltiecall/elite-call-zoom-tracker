import { RepStats, crColor } from '@/lib/stats'
import { getRepAvatarColors } from '@/lib/supabase'

function Avatar({ rep }: { rep: string }) {
  const colors = getRepAvatarColors(rep)
  return (
    <div className="avatar" style={{ background: colors.bg, color: colors.color }}>
      {rep.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function RepGrid({ repStats }: { repStats: RepStats[] }) {
  if (repStats.length === 0) return null
  return (
    <div className="rep-grid">
      {repStats.map(r => {
        const cr = r.closeRate
        const c = crColor(cr)
        return (
          <div key={r.rep} className="rep-card">
            <div className="rep-header">
              <Avatar rep={r.rep} />
              <div>
                <div className="rep-name">{r.rep}</div>
                <div className="rep-sub">{r.entries} entries</div>
              </div>
            </div>
            <div className="rep-stats">
              <div className="rep-stat">
                <div className="rep-stat-val">{r.uniqueZooms}</div>
                <div className="rep-stat-lbl">Uniq Zooms</div>
              </div>
              <div className="rep-stat">
                <div className="rep-stat-val">{r.uniqueSat}</div>
                <div className="rep-stat-lbl">Uniq Sat</div>
              </div>
              <div className="rep-stat">
                <div className="rep-stat-val">{r.uniqueClosed}</div>
                <div className="rep-stat-lbl">Closed</div>
              </div>
              <div className="rep-stat">
                <div className="rep-stat-val" style={{ color: c }}>{r.closeRate.toFixed(1)}%</div>
                <div className="rep-stat-lbl">Close %</div>
              </div>
            </div>
            <div className="close-bar">
              <div className="close-fill" style={{ width: `${Math.min(cr, 100)}%`, background: c }} />
            </div>
            <div className="close-pct">
              <span>0%</span>
              <span style={{ color: c, fontWeight: 600 }}>{r.closeRate.toFixed(1)}%</span>
              <span>50%+</span>
            </div>
            {r.closedRevenue > 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#22c55e', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                ${r.closedRevenue.toLocaleString()} closed /mo
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
