import { ZoomEntry } from '@/lib/supabase'
import { parseDeal } from '@/lib/stats'
import { REP_AVATAR_COLORS } from '@/lib/supabase'

const OUTCOME_CLASSES: Record<string, string> = {
  'Closed': 'b-closed', 'Proposal Sent': 'b-proposal',
  'Follow-Up Needed': 'b-followup', 'No Show': 'b-noshow',
}

function Avatar({ rep }: { rep: string }) {
  const colors = REP_AVATAR_COLORS[rep] || { bg: '#e5e7eb', color: '#374151' }
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, background: colors.bg, color: colors.color, flexShrink: 0 }}>
      {rep.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function Pipeline({ rows }: { rows: ZoomEntry[] }) {
  const withValue = rows.filter(r => r.deal_value && r.deal_value.trim() !== '')
  const sorted = [...withValue].sort((a, b) => parseDeal(b.deal_value) - parseDeal(a.deal_value))

  const byRep: Record<string, number> = {}
  withValue.forEach(r => { byRep[r.rep] = (byRep[r.rep] || 0) + parseDeal(r.deal_value) })
  const repTotals = Object.entries(byRep).sort((a, b) => b[1] - a[1])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {repTotals.map(([rep, val]) => (
          <div key={rep} className="metric">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Avatar rep={rep} />
              <div className="metric-label" style={{ margin: 0 }}>{rep}</div>
            </div>
            <div className="metric-value" style={{ fontSize: 20 }}>${val.toLocaleString()}</div>
            <div className="metric-sub">pipeline /mo</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
          <div className="section-label" style={{ margin: 0 }}>Active Pipeline — {sorted.length} accounts with value</div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Rep</th>
                <th>Value /mo</th>
                <th>Outcome</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state">No entries with deal value.</div></td></tr>
              ) : sorted.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.company}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar rep={r.rep} />
                      {r.rep}
                    </div>
                  </td>
                  <td><span className="pipeline-val" style={{ fontSize: 13, fontWeight: 600 }}>{r.deal_value}</span></td>
                  <td>{r.outcome ? <span className={`badge ${OUTCOME_CLASSES[r.outcome] || 'b-followup'}`}>{r.outcome}</span> : '—'}</td>
                  <td><div className="note-cell">{r.notes}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
