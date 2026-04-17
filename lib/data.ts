import { createClient, createServiceClient } from './supabase/server'
import type { Race, Runner, Bet } from './types'

// ─── Races ───────────────────────────────────────────────────────────────────

export async function getRaces(): Promise<Race[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRace(id: string): Promise<Race | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createRace(name: string, status: Race['status']): Promise<Race> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('races')
    .insert({ name, status })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateRace(id: string, updates: Partial<Pick<Race, 'name' | 'status'>>): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('races')
    .update(updates)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Runners ─────────────────────────────────────────────────────────────────

export async function getRunners(raceId: string): Promise<Runner[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('runners')
    .select('*')
    .eq('race_id', raceId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createRunner(
  raceId: string,
  name: string,
  startingOdds: number
): Promise<Runner> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('runners')
    .insert({ race_id: raceId, name, starting_odds: startingOdds, current_odds: startingOdds })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteRunner(id: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('runners').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateRunner(
  id: string,
  updates: Partial<Pick<Runner, 'name' | 'starting_odds' | 'current_odds'>>
): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('runners').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Bets ─────────────────────────────────────────────────────────────────────

export async function getBets(raceId: string): Promise<(Bet & { runner_name: string })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bets')
    .select('*, runners(name)')
    .eq('race_id', raceId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((b: Bet & { runners: { name: string } }) => ({
    ...b,
    runner_name: b.runners?.name ?? 'Unknown',
  }))
}

export async function placeBet(
  raceId: string,
  runnerId: string,
  bettorName: string,
  amount: number,
  oddsAtTimeOfBet: number
): Promise<Bet> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bets')
    .insert({
      race_id: raceId,
      runner_id: runnerId,
      bettor_name: bettorName,
      amount,
      odds_at_time_of_bet: oddsAtTimeOfBet,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── Odds recalculation ───────────────────────────────────────────────────────

export async function recalculateOdds(raceId: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.rpc('recalculate_odds', { p_race_id: raceId })
  if (error) throw new Error(error.message)
}
