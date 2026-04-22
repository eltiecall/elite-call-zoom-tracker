import { ZoomEntry } from './supabase'

export type Stats = {
  total: number
  sat: number
  missed: number
  rescheduled: number
  satPct: number
  uniqueSat: number
  uniqueClosed: number
  closeRate: number
  pipeline: number
  closedRevenue: number
}

export type RepStats = Stats & {
  rep: string
  entries: number
}

export type TrendInsight = {
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  rep: string
  title: string
  detail: string
  metric?: string
}

export function parseDeal(str: string): number {
  if (!str) return 0
  const n = parseFloat(str.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export function computeStats(rows: ZoomEntry[]): Stats {
  const total = rows.length
  const sat = rows.filter(r => r.sat === 'Sat').length
  const missed = rows.filter(r => r.sat === 'Missed').length
  const rescheduled = rows.filter(r => r.sat === 'Rescheduled').length
  const satPct = total > 0 ? (sat / total) * 100 : 0

  // Unique account logic: each company+rep combo counts once
  const accts: Record<string, { sat: boolean; closed: boolean }> = {}
  rows.forEach(r => {
    const k = `${r.company.trim().toLowerCase()}|${r.rep.toLowerCase()}`
    if (!accts[k]) accts[k] = { sat: false, closed: false }
    if (r.sat === 'Sat') accts[k].sat = true
    if (r.outcome === 'Closed') accts[k].closed = true
  })

  const av = Object.values(accts)
  const uniqueSat = av.filter(a => a.sat).length
  const uniqueClosed = av.filter(a => a.closed).length
  const closeRate = uniqueSat > 0 ? (uniqueClosed / uniqueSat) * 100 : 0

  let pipeline = 0
  let closedRevenue = 0
  rows.forEach(r => {
    const v = parseDeal(r.deal_value)
    if (r.outcome === 'Proposal Sent' || r.outcome === 'Closed') pipeline += v
    if (r.outcome === 'Closed') closedRevenue += v
  })

  return { total, sat, missed, rescheduled, satPct, uniqueSat, uniqueClosed, closeRate, pipeline, closedRevenue }
}

export function computeRepStats(rows: ZoomEntry[]): RepStats[] {
  const byRep: Record<string, ZoomEntry[]> = {}
  rows.forEach(r => {
    if (!byRep[r.rep]) byRep[r.rep] = []
    byRep[r.rep].push(r)
  })
  return Object.entries(byRep)
    .map(([rep, rs]) => ({ rep, entries: rs.length, ...computeStats(rs) }))
    .sort((a, b) => b.closeRate - a.closeRate)
}

export function generateTrends(allRows: ZoomEntry[], monthData: Record<string, ZoomEntry[]>): TrendInsight[] {
  const insights: TrendInsight[] = []
  const months = Object.keys(monthData).sort()

  if (months.length === 0) return []

  const allRepStats = computeRepStats(allRows)
  const teamAvgClose = allRepStats.length > 0
    ? allRepStats.reduce((s, r) => s + r.closeRate, 0) / allRepStats.length
    : 0
  const teamAvgSat = allRepStats.length > 0
    ? allRepStats.reduce((s, r) => s + r.satPct, 0) / allRepStats.length
    : 0

  // Per-rep trend analysis
  allRepStats.forEach(repStat => {
    const rep = repStat.rep

    // Close rate vs team average
    if (repStat.closeRate > teamAvgClose + 8 && repStat.uniqueSat >= 3) {
      insights.push({
        type: 'positive',
        rep,
        title: `${rep} is closing above team average`,
        detail: `${rep}'s close rate is ${repStat.closeRate.toFixed(1)}% vs team avg ${teamAvgClose.toFixed(1)}%. ${repStat.uniqueClosed} deals closed from ${repStat.uniqueSat} unique accounts sat.`,
        metric: `+${(repStat.closeRate - teamAvgClose).toFixed(1)}% above avg`,
      })
    }

    if (repStat.closeRate < teamAvgClose - 8 && repStat.uniqueSat >= 4) {
      insights.push({
        type: 'negative',
        rep,
        title: `${rep}'s close rate is below team average`,
        detail: `${rep} is closing at ${repStat.closeRate.toFixed(1)}% vs team avg ${teamAvgClose.toFixed(1)}%. With ${repStat.uniqueSat} unique accounts sat, there's pipeline not converting. Review pitch and proposal quality.`,
        metric: `${(repStat.closeRate - teamAvgClose).toFixed(1)}% vs avg`,
      })
    }

    // Sat rate
    if (repStat.satPct < teamAvgSat - 15 && repStat.total >= 5) {
      insights.push({
        type: 'warning',
        rep,
        title: `${rep} has a low show-up rate`,
        detail: `Only ${repStat.satPct.toFixed(1)}% of ${rep}'s zooms are sitting vs team avg ${teamAvgSat.toFixed(1)}%. ${repStat.missed} missed zooms. This points to poor prospect qualification or weak confirmation process.`,
        metric: `${repStat.satPct.toFixed(1)}% sat rate`,
      })
    }

    if (repStat.satPct > teamAvgSat + 15 && repStat.total >= 5) {
      insights.push({
        type: 'positive',
        rep,
        title: `${rep} has the best show-up rate`,
        detail: `${rep} sits ${repStat.satPct.toFixed(1)}% of booked zooms — well above team avg ${teamAvgSat.toFixed(1)}%. Strong confirmation and qualification process worth sharing with the team.`,
        metric: `${repStat.satPct.toFixed(1)}% sat rate`,
      })
    }

    // Proposal to close gap
    const repRows = allRows.filter(r => r.rep === rep)
    const proposals = repRows.filter(r => r.outcome === 'Proposal Sent').length
    const closed = repRows.filter(r => r.outcome === 'Closed').length
    if (proposals >= 4 && closed === 0) {
      insights.push({
        type: 'warning',
        rep,
        title: `${rep} has ${proposals} proposals with 0 closes`,
        detail: `${rep} is sending proposals but none are converting. Potential issue: pricing objections, follow-up cadence, or proposals going to wrong decision makers. Do a proposal audit.`,
        metric: `${proposals} proposals, 0 closed`,
      })
    }

    // High volume, low conversion
    if (repStat.total >= 10 && repStat.uniqueClosed === 0) {
      insights.push({
        type: 'negative',
        rep,
        title: `${rep} has high zoom volume but no closes`,
        detail: `${repStat.total} zoom entries logged with 0 closed deals. High activity isn't translating. Prioritize a pitch review and zoom call audit with this rep.`,
        metric: `${repStat.total} zooms, 0 deals`,
      })
    }

    // Pipeline value vs closed
    const pipelineOnly = repStat.pipeline - repStat.closedRevenue
    if (pipelineOnly > 15000 && repStat.uniqueClosed === 0) {
      insights.push({
        type: 'warning',
        rep,
        title: `${rep} has $${(pipelineOnly / 1000).toFixed(0)}k in unclosed proposals`,
        detail: `Strong proposal value but no confirmed revenue. These deals need active follow-up. If more than 2 weeks old, re-engage or disqualify.`,
        metric: `$${pipelineOnly.toLocaleString()} pending`,
      })
    }

    // Good closer with high revenue
    if (repStat.closedRevenue > 20000) {
      insights.push({
        type: 'positive',
        rep,
        title: `${rep} is a top revenue generator`,
        detail: `$${repStat.closedRevenue.toLocaleString()}/mo in confirmed closed revenue. ${rep} should be used as a case study — have them document their pitch approach and share with the team.`,
        metric: `$${repStat.closedRevenue.toLocaleString()} closed`,
      })
    }
  })

  // Month-over-month trends (if 2+ months)
  if (months.length >= 2) {
    const lastMonth = months[months.length - 1]
    const prevMonth = months[months.length - 2]
    const lastStats = computeStats(monthData[lastMonth] || [])
    const prevStats = computeStats(monthData[prevMonth] || [])

    if (prevStats.total > 0) {
      const volumeChange = ((lastStats.total - prevStats.total) / prevStats.total) * 100
      if (volumeChange < -20) {
        insights.push({
          type: 'negative',
          rep: 'Team',
          title: 'Zoom volume dropped month-over-month',
          detail: `${prevMonth}: ${prevStats.total} zooms → ${lastMonth}: ${lastStats.total} zooms (${volumeChange.toFixed(0)}% drop). Team is booking fewer meetings. Pipeline is going to thin out in 4-6 weeks if not addressed now.`,
          metric: `${volumeChange.toFixed(0)}% MoM`,
        })
      }
      if (volumeChange > 20) {
        insights.push({
          type: 'positive',
          rep: 'Team',
          title: 'Zoom volume increased month-over-month',
          detail: `${prevMonth}: ${prevStats.total} zooms → ${lastMonth}: ${lastStats.total} zooms (+${volumeChange.toFixed(0)}%). Team is booking more meetings. Good sign for pipeline 30-60 days out.`,
          metric: `+${volumeChange.toFixed(0)}% MoM`,
        })
      }

      const crChange = lastStats.closeRate - prevStats.closeRate
      if (crChange < -5 && prevStats.uniqueSat >= 5) {
        insights.push({
          type: 'warning',
          rep: 'Team',
          title: 'Team close rate declined month-over-month',
          detail: `Close rate dropped from ${prevStats.closeRate.toFixed(1)}% (${prevMonth}) to ${lastStats.closeRate.toFixed(1)}% (${lastMonth}). Identify if it's qualification, pitch, or follow-up breakdown.`,
          metric: `${crChange.toFixed(1)}% change`,
        })
      }
      if (crChange > 5 && lastStats.uniqueSat >= 5) {
        insights.push({
          type: 'positive',
          rep: 'Team',
          title: 'Team close rate improved month-over-month',
          detail: `Close rate improved from ${prevStats.closeRate.toFixed(1)}% (${prevMonth}) to ${lastStats.closeRate.toFixed(1)}% (${lastMonth}). Whatever the team changed this month — reinforce it.`,
          metric: `+${crChange.toFixed(1)}% change`,
        })
      }
    }
  }

  // Multi-zoom accounts not closing
  const multiZoomNoClose: Record<string, { rep: string; company: string; count: number }> = {}
  allRows.forEach(r => {
    const k = `${r.company.trim().toLowerCase()}|${r.rep.toLowerCase()}`
    if (!multiZoomNoClose[k]) multiZoomNoClose[k] = { rep: r.rep, company: r.company, count: 0 }
    multiZoomNoClose[k].count++
  })
  const staleAccounts = Object.values(multiZoomNoClose).filter(a => a.count >= 3)
  const closedAccounts = new Set(allRows.filter(r => r.outcome === 'Closed').map(r => `${r.company.trim().toLowerCase()}|${r.rep.toLowerCase()}`))
  const trueStale = staleAccounts.filter(a => !closedAccounts.has(`${a.company.trim().toLowerCase()}|${a.rep.toLowerCase()}`))

  if (trueStale.length > 0) {
    insights.push({
      type: 'warning',
      rep: 'Team',
      title: `${trueStale.length} accounts on 3+ zooms without closing`,
      detail: `Accounts with 3+ zoom entries but no close: ${trueStale.slice(0, 4).map(a => `${a.company} (${a.rep})`).join(', ')}${trueStale.length > 4 ? ` +${trueStale.length - 4} more` : ''}. Either close these or disqualify — they're consuming time.`,
      metric: `${trueStale.length} stale accounts`,
    })
  }

  // Top performer spotlight
  const topRep = allRepStats.find(r => r.closedRevenue === Math.max(...allRepStats.map(x => x.closedRevenue)))
  if (topRep && topRep.closedRevenue > 0) {
    const alreadyFlagged = insights.some(i => i.rep === topRep.rep && i.type === 'positive' && i.title.includes('revenue'))
    if (!alreadyFlagged) {
      insights.push({
        type: 'positive',
        rep: topRep.rep,
        title: `${topRep.rep} leads in closed revenue`,
        detail: `$${topRep.closedRevenue.toLocaleString()}/mo confirmed — highest on the team. ${topRep.uniqueClosed} accounts closed at a ${topRep.closeRate.toFixed(1)}% close rate.`,
        metric: `$${topRep.closedRevenue.toLocaleString()} closed`,
      })
    }
  }

  // Sort: negatives/warnings first, then positives
  return insights.sort((a, b) => {
    const order = { negative: 0, warning: 1, neutral: 2, positive: 3 }
    return order[a.type] - order[b.type]
  })
}

export function getOutcomeColor(outcome: string): string {
  const m: Record<string, string> = {
    'Closed': '#22c55e',
    'Proposal Sent': '#3b82f6',
    'Follow-Up Needed': '#f59e0b',
    'No Show': '#ef4444',
    'Not Interested': '#94a3b8',
    'Rescheduled': '#8b5cf6',
  }
  return m[outcome] || '#9ca3af'
}

export function crColor(rate: number): string {
  return rate >= 30 ? '#22c55e' : rate >= 15 ? '#f59e0b' : '#ef4444'
}
