import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type ZoomEntry = {
  id: string
  month: string
  date: string
  rep: string
  company: string
  zoom_type: string
  sat: string
  outcome: string
  deal_value: string
  notes: string
  created_at?: string
}

export const REPS = ['Travis', 'Dan', 'Mike', 'Ryan', 'Jack', 'Tim', 'Andrew']
export const ZOOM_TYPES = ['1st Zoom', '2nd Zoom', '3rd Zoom', 'Follow-Up', 'Close Call', 'Discovery']
export const SAT_OPTIONS = ['Sat', 'Missed', 'Rescheduled']
export const OUTCOMES = ['Follow-Up Needed', 'Proposal Sent', 'Closed', 'No Show', 'Not Interested', 'Rescheduled']

export const REP_COLORS: Record<string, string> = {
  Travis: '#3b82f6',
  Dan: '#22c55e',
  Mike: '#ec4899',
  Ryan: '#f59e0b',
  Jack: '#8b5cf6',
  Tim: '#ef4444',
  Andrew: '#06b6d4',
}

export const REP_AVATAR_COLORS: Record<string, { bg: string; color: string }> = {
  Travis: { bg: '#dbeafe', color: '#1e40af' },
  Dan: { bg: '#dcfce7', color: '#166534' },
  Mike: { bg: '#fce7f3', color: '#9d174d' },
  Ryan: { bg: '#fef3c7', color: '#92400e' },
  Jack: { bg: '#ede9fe', color: '#4c1d95' },
  Tim: { bg: '#fee2e2', color: '#991b1b' },
  Andrew: { bg: '#e0f2fe', color: '#075985' },
}

const COLOR_PALETTE = ['#3b82f6','#22c55e','#ec4899','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#14b8a6','#a855f7','#84cc16','#e11d48']
const AVATAR_PALETTE: { bg: string; color: string }[] = [
  { bg: '#dbeafe', color: '#1e40af' }, { bg: '#dcfce7', color: '#166534' },
  { bg: '#fce7f3', color: '#9d174d' }, { bg: '#fef3c7', color: '#92400e' },
  { bg: '#ede9fe', color: '#4c1d95' }, { bg: '#fee2e2', color: '#991b1b' },
  { bg: '#e0f2fe', color: '#075985' }, { bg: '#ffedd5', color: '#9a3412' },
  { bg: '#ccfbf1', color: '#115e59' }, { bg: '#f3e8ff', color: '#6b21a8' },
  { bg: '#ecfccb', color: '#365314' }, { bg: '#ffe4e6', color: '#9f1239' },
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff
  return h
}

export function getRepColor(rep: string): string {
  return REP_COLORS[rep] ?? COLOR_PALETTE[hashStr(rep) % COLOR_PALETTE.length]
}

export function getRepAvatarColors(rep: string): { bg: string; color: string } {
  return REP_AVATAR_COLORS[rep] ?? AVATAR_PALETTE[hashStr(rep) % AVATAR_PALETTE.length]
}
