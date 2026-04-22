'use client'

import { useState } from 'react'
import { ZoomEntry } from '@/lib/supabase'
import { REP_AVATAR_COLORS } from '@/lib/supabase'

const OUTCOME_CLASSES: Record<string, string> = {
  'Closed': 'b-closed',
  'Proposal Sent': 'b-proposal',
  'Follow-Up Needed': 'b-followup',
  'No Show': 'b-noshow',
  'Rescheduled': 'b-reschedule',
  'Not Interested': 'b-notinterested',
}

const SAT_COLORS: Record<string, string> = { Sat: '#22c55e', Missed: '#ef4444', Rescheduled: '#9ca3af' }

function Avatar({ rep }: { rep: string }) {
  const colors = REP_AVATAR_COLORS[rep] || { bg: '#e5e7eb', color: '#374151' }
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, background: colors.bg, color: colors.color, flexShrink: 0 }}>
      {rep.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function ZoomLog({ rows, onEdit, onDelete }: {
  rows: ZoomEntry[]
  onEdit: (e: ZoomEntry) => void
  onDelete: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [repFilter, setRepFilter] = useState('All')
  const [outcomeFilter, setOutcomeFilter] = useState('All')
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const allReps = Array.from(new Set(rows.map(r => r.rep))).sort()
  const allOutcomes = Array.from(new Set(rows.map(r => r.outcome).filter(Boolean))).sort()

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    if (q && !r.company.toLowerCase().includes(q) && !r.rep.toLowerCase().includes(q) && !r.notes.toLowerCase().includes(q)) return false
    if (repFilter !== 'All' && r.rep !== repFilter) return false
    if (outcomeFilter !== 'All' && r.outcome !== outcomeFilter) return false
    return true
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const av = (a as any)[sortCol] || ''
    const bv = (b as any)[sortCol] || ''
    return av.localeCompare(bv) * dir
  })

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortIndicator = ({ col }: { col: string }) => sortCol === col ? <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span> : null

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <input className="search-input" placeholder="Search company, rep, notes..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={repFilter} onChange={e => setRepFilter(e.target.value)}>
          <option value="All">All Reps</option>
          {allReps.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}>
          <option value="All">All Outcomes</option>
          {allOutcomes.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{filtered.length} rows</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')}>Date <SortIndicator col="date" /></th>
              <th onClick={() => toggleSort('rep')}>Rep <SortIndicator col="rep" /></th>
              <th onClick={() => toggleSort('company')}>Company <SortIndicator col="company" /></th>
              <th>Type</th>
              <th>Sat?</th>
              <th onClick={() => toggleSort('outcome')}>Outcome <SortIndicator col="outcome" /></th>
              <th>Value</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><div className="empty-state">No entries match your filters.</div></td></tr>
            ) : filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{r.date}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar rep={r.rep} />
                    {r.rep}
                  </div>
                </td>
                <td style={{ fontWeight: 500, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company}</td>
                <td style={{ fontSize: 11, color: '#888' }}>{r.zoom_type}</td>
                <td>
                  <div className="sat-indicator">
                    <div className="sat-dot" style={{ background: SAT_COLORS[r.sat] || '#9ca3af' }} />
                    <span style={{ fontSize: 12 }}>{r.sat || '—'}</span>
                  </div>
                </td>
                <td>{r.outcome ? <span className={`badge ${OUTCOME_CLASSES[r.outcome] || 'b-followup'}`}>{r.outcome}</span> : '—'}</td>
                <td><span className="pipeline-val">{r.deal_value}</span></td>
                <td><div className="note-cell" title={r.notes}>{r.notes}</div></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="del-btn" onClick={() => onEdit(r)}>Edit</button>
                    <button className="del-btn" onClick={() => onDelete(r.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
