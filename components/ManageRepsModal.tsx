'use client'

import { useState } from 'react'
import { getRepAvatarColors } from '@/lib/supabase'

type Props = {
  reps: string[]
  onSave: (reps: string[]) => void
  onClose: () => void
}

export default function ManageRepsModal({ reps, onSave, onClose }: Props) {
  const [list, setList] = useState<string[]>(reps)
  const [newRep, setNewRep] = useState('')

  const addRep = () => {
    const name = newRep.trim()
    if (!name) return
    if (list.map(r => r.toLowerCase()).includes(name.toLowerCase())) {
      alert(`${name} is already on the team.`)
      return
    }
    setList(l => [...l, name])
    setNewRep('')
  }

  const removeRep = (rep: string) => {
    setList(l => l.filter(r => r !== rep))
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-title">
          <span>Manage Reps</span>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="form-label" style={{ marginBottom: 10 }}>Current Team</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(rep => {
              const colors = getRepAvatarColors(rep)
              return (
                <div key={rep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f5f5f5', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: colors.bg, color: colors.color }}>
                      {rep.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{rep}</span>
                  </div>
                  <button
                    onClick={() => removeRep(rep)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                    title={`Remove ${rep}`}
                  >×</button>
                </div>
              )
            })}
            {list.length === 0 && (
              <div style={{ color: '#888', fontSize: 13, padding: '8px 0' }}>No reps — add one below.</div>
            )}
          </div>
        </div>

        <div className="form-group full" style={{ marginBottom: 4 }}>
          <label className="form-label">Add New Rep</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={newRep}
              onChange={e => setNewRep(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addRep() }}
              placeholder="Rep name"
              style={{ flex: 1 }}
            />
            <button className="btn primary" onClick={addRep}>Add</button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 20 }}>
          Removing a rep hides them from new entries but keeps their existing zoom data.
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => { onSave(list); onClose() }}>Save</button>
        </div>
      </div>
    </div>
  )
}
