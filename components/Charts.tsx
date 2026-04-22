'use client'

import { useEffect, useRef } from 'react'
import { RepStats, computeStats, getOutcomeColor } from '@/lib/stats'
import { ZoomEntry, REP_COLORS } from '@/lib/supabase'

type Props = {
  repStats: RepStats[]
  monthData: Record<string, ZoomEntry[]>
  months: string[]
  isDashboard: boolean
  currentMonth?: string
  rows?: ZoomEntry[]
}

export default function Charts({ repStats, monthData, months, isDashboard, rows = [] }: Props) {
  const repChartRef = useRef<HTMLCanvasElement>(null)
  const secondChartRef = useRef<HTMLCanvasElement>(null)
  const repChartInstance = useRef<any>(null)
  const secondChartInstance = useRef<any>(null)

  useEffect(() => {
    let Chart: any
    const load = async () => {
      const mod = await import('chart.js')
      Chart = mod.Chart
      mod.Chart.register(...mod.registerables)

      // Rep close rate chart
      if (repChartRef.current && repStats.length > 0) {
        if (repChartInstance.current) repChartInstance.current.destroy()
        repChartInstance.current = new Chart(repChartRef.current, {
          type: 'bar',
          data: {
            labels: repStats.map(r => r.rep),
            datasets: [{
              label: 'Close Rate %',
              data: repStats.map(r => parseFloat(r.closeRate.toFixed(1))),
              backgroundColor: repStats.map(r => REP_COLORS[r.rep] || '#888'),
              borderRadius: 4,
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, max: 60, ticks: { callback: (v: any) => v + '%', color: '#888', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { ticks: { color: '#888', font: { size: 11 } }, grid: { display: false } }
            }
          }
        })
      }

      // Second chart: MoM comparison (dashboard) or Outcome breakdown (month view)
      if (secondChartRef.current) {
        if (secondChartInstance.current) secondChartInstance.current.destroy()

        if (isDashboard && months.length >= 2) {
          // Month-over-month bar chart
          const data = months.map(m => computeStats(monthData[m] || []))
          secondChartInstance.current = new Chart(secondChartRef.current, {
            type: 'bar',
            data: {
              labels: months,
              datasets: [
                { label: 'Total Zooms', data: data.map(d => d.total), backgroundColor: '#3b82f6', borderRadius: 3 },
                { label: 'Sat', data: data.map(d => d.sat), backgroundColor: '#22c55e', borderRadius: 3 },
                { label: 'Closed', data: data.map(d => d.uniqueClosed), backgroundColor: '#1a1a2e', borderRadius: 3 },
              ]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8, boxWidth: 8, color: '#888' } } },
              scales: {
                y: { beginAtZero: true, ticks: { color: '#888', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { ticks: { color: '#888', font: { size: 11 } }, grid: { display: false } }
              }
            }
          })
        } else {
          // Outcome breakdown donut
          const outcomeRows = isDashboard ? [] : rows
          const counts: Record<string, number> = {}
          outcomeRows.forEach(r => { if (r.outcome) counts[r.outcome] = (counts[r.outcome] || 0) + 1 })
          const labels = Object.keys(counts)
          const values = Object.values(counts)
          if (labels.length > 0) {
            secondChartInstance.current = new Chart(secondChartRef.current, {
              type: 'doughnut',
              data: {
                labels,
                datasets: [{ data: values, backgroundColor: labels.map(l => getOutcomeColor(l)), borderWidth: 2, borderColor: '#fff' }]
              },
              options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { font: { size: 10 }, padding: 6, boxWidth: 9, color: '#888' } } },
                cutout: '60%'
              }
            })
          }
        }
      }
    }
    load()
    return () => {
      repChartInstance.current?.destroy()
      secondChartInstance.current?.destroy()
    }
  }, [repStats, monthData, months, isDashboard, rows])

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div className="section-label" style={{ margin: 0 }}>Close Rate by Rep</div>
        </div>
        <div className="chart-body">
          <canvas ref={repChartRef} aria-label="Rep close rates chart" />
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-header">
          <div className="section-label" style={{ margin: 0 }}>
            {isDashboard ? 'Month-over-Month' : 'Outcome Breakdown'}
          </div>
        </div>
        <div className="chart-body">
          <canvas ref={secondChartRef} aria-label="Secondary chart" />
        </div>
      </div>
    </div>
  )
}
