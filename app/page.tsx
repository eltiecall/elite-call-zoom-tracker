'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, ZoomEntry, REPS } from '@/lib/supabase'
import { MARCH_DATA, APRIL_DATA } from '@/lib/seedData'
import { computeStats, computeRepStats, generateTrends, TrendInsight } from '@/lib/stats'
import MetricCards from '@/components/MetricCards'
import RepGrid from '@/components/RepGrid'
import ZoomLog from '@/components/ZoomLog'
import Pipeline from '@/components/Pipeline'
import Charts from '@/components/Charts'
import TrendsPanel from '@/components/TrendsPanel'
import ZoomModal from '@/components/ZoomModal'
import ManageRepsModal from '@/components/ManageRepsModal'

type Tab = 'dashboard' | string
type View = 'dashboard' | 'log' | 'pipeline' | 'trends'

export default function Home() {
  const [allEntries, setAllEntries] = useState<ZoomEntry[]>([])
  const [extraMonths, setExtraMonths] = useState<string[]>([])
  const [reps, setReps] = useState<string[]>(REPS)
  const [manageRepsOpen, setManageRepsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [view, setView] = useState<View>('dashboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<ZoomEntry | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [liveCount, setLiveCount] = useState(0)

  useEffect(() => {
    try {
      const storedMonths = JSON.parse(localStorage.getItem('elite-call-months') || '[]')
      if (Array.isArray(storedMonths)) setExtraMonths(storedMonths)
    } catch {}
  }, [])

  const fetchReps = useCallback(async () => {
    const { data } = await supabase.from('reps').select('name').order('name')
    if (data && data.length > 0) setReps(data.map((r: { name: string }) => r.name))
  }, [])

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('zoom_entries')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) {
      setAllEntries(data)
      setLiveCount(c => c + 1)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReps()
    fetchAll()
    const channel = supabase
      .channel('tracker_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zoom_entries' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reps' }, fetchReps)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll, fetchReps])

  const addRep = async (name: string) => {
    await supabase.from('reps').insert({ name })
  }

  const removeRep = async (name: string) => {
    await supabase.from('reps').delete().eq('name', name)
  }

  const seedDatabase = async () => {
    setSeeding(true)
    const all = [...MARCH_DATA, ...APRIL_DATA]
    const { error } = await supabase.from('zoom_entries').upsert(all, { onConflict: 'id' })
    if (error) { alert('Seed error: ' + error.message) }
    await fetchAll()
    setSeeding(false)
  }

  const months = Array.from(new Set([...allEntries.map(e => e.month), ...extraMonths])).sort()
  const monthData: Record<string, ZoomEntry[]> = {}
  months.forEach(m => { monthData[m] = allEntries.filter(e => e.month === m) })

  const currentRows = tab === 'dashboard' ? allEntries : (monthData[tab] || [])
  const stats = computeStats(currentRows)
  const repStats = computeRepStats(currentRows)
  const trends: TrendInsight[] = generateTrends(allEntries, monthData)

  const handleSave = async (entry: Omit<ZoomEntry, 'created_at'>) => {
    if (editEntry) {
      await supabase.from('zoom_entries').update(entry).eq('id', entry.id)
    } else {
      await supabase.from('zoom_entries').insert(entry)
    }
    await fetchAll()
    setModalOpen(false)
    setEditEntry(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await supabase.from('zoom_entries').delete().eq('id', id)
    await fetchAll()
  }

  const openAdd = () => { setEditEntry(null); setModalOpen(true) }
  const openEdit = (e: ZoomEntry) => { setEditEntry(e); setModalOpen(true) }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#888' }}>
        Loading Elite Call Zoom Tracker...
      </div>
    )
  }

  const isDash = tab === 'dashboard'

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <div className="logo-badge">EC</div>
          <div>
            <div className="logo-text">Elite Call</div>
            <div className="logo-sub">Zoom Tracker</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {allEntries.length === 0 && (
            <button className="btn" onClick={seedDatabase} disabled={seeding}>
              {seeding ? 'Seeding...' : '⚡ Load Data'}
            </button>
          )}
          <div className="live-badge">
            <div className="pulse-dot" />
            Live
          </div>
          <button className="btn" onClick={() => setManageRepsOpen(true)}>Manage Reps</button>
          <button className="btn primary" onClick={openAdd}>+ Add Zoom</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => { setTab('dashboard'); setView('dashboard') }}>
          Dashboard
        </button>
        {months.map(m => (
          <button key={m} className={`tab ${tab === m ? 'active' : ''}`} onClick={() => { setTab(m); setView('dashboard') }}>
            {m}
          </button>
        ))}
        <button className="tab" onClick={() => {
          const name = prompt('New month name (e.g. "May 2025"):')
          if (name?.trim()) {
            const trimmed = name.trim()
            const updated = Array.from(new Set([...extraMonths, trimmed]))
            setExtraMonths(updated)
            try { localStorage.setItem('elite-call-months', JSON.stringify(updated)) } catch {}
            setTab(trimmed)
            setView('dashboard')
          }
        }}>+ Month</button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Page header */}
        <div className="page-header">
          <div>
            <div className="page-title">{isDash ? 'All-Time Performance' : tab}</div>
            <div className="page-sub">
              {isDash ? `${months.join(' + ')} combined — unique account close rate` : 'Unique account close rate — each company counted once'}
            </div>
          </div>
          {!isDash && (
            <div className="view-btns">
              {(['dashboard', 'log', 'pipeline', 'trends'] as View[]).map(v => (
                <button key={v} className={`vbtn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <MetricCards stats={stats} label={isDash ? `${allEntries.length} total entries` : `${currentRows.length} entries this month`} />

        {isDash ? (
          <>
            {/* Month comparison cards */}
            <div className="month-cards">
              {months.map(m => {
                const ms = computeStats(monthData[m] || [])
                return (
                  <div key={m} className="month-card" onClick={() => { setTab(m); setView('dashboard') }}>
                    <div className="month-card-name">{m}</div>
                    <div className="month-card-val">{ms.total} zooms</div>
                    <div className="month-card-sub">{ms.closeRate.toFixed(1)}% close · {ms.uniqueClosed} deals · ${(ms.closedRevenue / 1000).toFixed(0)}k</div>
                  </div>
                )
              })}
            </div>

            <div className="section-label">All-Time Rep Leaderboard</div>
            <RepGrid repStats={repStats} />
            <Charts repStats={repStats} monthData={monthData} months={months} isDashboard />

            <div className="section-label" style={{ marginTop: 24 }}>Trends & Analysis</div>
            <TrendsPanel trends={trends} />
          </>
        ) : (
          <>
            {view === 'dashboard' && (
              <>
                <div className="section-label">Rep Performance — {tab}</div>
                <RepGrid repStats={repStats} />
                <Charts repStats={repStats} monthData={monthData} months={months} isDashboard={false} currentMonth={tab} rows={currentRows} />
              </>
            )}
            {view === 'log' && (
              <ZoomLog rows={currentRows} onEdit={openEdit} onDelete={handleDelete} />
            )}
            {view === 'pipeline' && (
              <Pipeline rows={currentRows} />
            )}
            {view === 'trends' && (
              <>
                <div className="section-label">Trends & Insights — {tab}</div>
                <TrendsPanel trends={generateTrends(currentRows, { [tab]: currentRows })} />
              </>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <ZoomModal
          entry={editEntry}
          defaultMonth={tab === 'dashboard' ? (months[months.length - 1] || 'April 2025') : tab}
          months={months}
          reps={reps}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditEntry(null) }}
        />
      )}
      {manageRepsOpen && (
        <ManageRepsModal
          reps={reps}
          onAdd={addRep}
          onRemove={removeRep}
          onClose={() => setManageRepsOpen(false)}
        />
      )}
    </div>
  )
}
