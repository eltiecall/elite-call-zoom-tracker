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
