'use client'

import { useState } from 'react'
import { ZoomEntry, REPS, ZOOM_TYPES, SAT_OPTIONS, OUTCOMES } from '@/lib/supabase'

type Props = {
  entry: ZoomEntry | null
  defaultMonth: string
  months: string[]
  onSave: (entry: Omit<ZoomEntry, 'created_at'>) => void
  onClose: () => void
}

export default function ZoomModal({ entry, defaultMonth, months, onSave, onClose }: Props) {
  const isEdit = !!entry
  const [form, setForm] = useState({
    id: entry?.id || crypto.randomUUID(),
    month: entry?.month || defaultMonth,
    date: entry?.date || '',
    rep: entry?.rep || 'Travis',
    company: entry?.company || '',
    zoom_type: entry?.zoom_type || '1st Zoom',
    sat: entry?.sat || 'Sat',
    outcome: entry?.outcome || 'Follow-Up Needed',
    deal_value: entry?.deal_value || '',
    notes: entry?.notes || '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.company.trim()) { alert('Company name required.'); return }
    onSave(form)
  }

  const allMonths = Array.from(new Set([...months, 'March 2025', 'April 2025'])).sort()

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-title">
          <span>{isEdit ? 'Edit Zoom Entry' : 'Add Zoom Entry'}</span>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Month</label>
            <select className="form-select" value={form.month} onChange={e => set('month', e.target.value)}>
              {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" value={form.date} onChange={e => set('date', e.target.value)} placeholder="4/1" />
          </div>
          <div className="form-group full">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="ACME HVAC" />
          </div>
          <div className="form-group">
            <label className="form-label">Rep</label>
            <select className="form-select" value={form.rep} onChange={e => set('rep', e.target.value)}>
              {REPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Zoom Type</label>
            <select className="form-select" value={form.zoom_type} onChange={e => set('zoom_type', e.target.value)}>
              {ZOOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sat / Missed</label>
            <select className="form-select" value={form.sat} onChange={e => set('sat', e.target.value)}>
              <option value="">—</option>
              {SAT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Outcome</label>
            <select className="form-select" value={form.outcome} onChange={e => set('outcome', e.target.value)}>
              <option value="">—</option>
              {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">Deal Value $/mo</label>
            <input className="form-input" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} placeholder="$5,000" />
          </div>
          <div className="form-group full">
            <label className="form-label">Notes</label>
            <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Follow-up notes, next steps..." />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Zoom'}</button>
        </div>
      </div>
    </div>
  )
}
