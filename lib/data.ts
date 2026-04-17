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

export async function updateRace(id: string, updates: Partial<Pick<Race, 'name' | 'status' | 'winner_runner_id'>>): Promise<void> {
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

// ─── Winner ───────────────────────────────────────────────────────────────────

export async function declareWinner(raceId: string, winnerRunnerId: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('races')
    .update({ winner_runner_id: winnerRunnerId, status: 'finished' })
    .eq('id', raceId)
  if (error) throw new Error(error.message)
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface CumulativeEntry {
  bettor_name: string
  bets: number
  wins: number
  total_wagered: number
  net: number
}

export function getCumulativeStandings(entries: LeaderboardEntry[]): CumulativeEntry[] {
  const map = new Map<string, CumulativeEntry>()
  for (const e of entries) {
    const existing = map.get(e.bettor_name) ?? {
      bettor_name: e.bettor_name,
      bets: 0,
      wins: 0,
      total_wagered: 0,
      net: 0,
    }
    existing.bets += 1
    existing.wins += e.won ? 1 : 0
    existing.total_wagered += e.amount
    existing.net += e.result
    map.set(e.bettor_name, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.net - a.net)
}

export interface LeaderboardEntry {
  bettor_name: string
  race_name: string
  runner_name: string
  amount: number
  odds: number
  won: boolean
  result: number // positive payout if won, negative amount if lost
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  // Get all bets on finished races (where winner has been declared)
  const { data, error } = await supabase
    .from('bets')
    .select('bettor_name, amount, odds_at_time_of_bet, runners(name, id), races(name, winner_runner_id)')
    .not('races.winner_runner_id', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? [] as any[])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((b: any) => b.races?.winner_runner_id !== null && b.races?.winner_runner_id !== undefined)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => {
      const won = b.races.winner_runner_id === b.runners?.id
      const amount = b.amount as number
      const odds = b.odds_at_time_of_bet as number
      return {
        bettor_name: b.bettor_name as string,
        race_name: b.races.name as string,
        runner_name: b.runners.name as string,
        amount,
        odds,
        won,
        result: won ? parseFloat((amount * odds).toFixed(2)) : -amount,
      }
    })
    .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.result - a.result)
}

// ─── Odds recalculation ───────────────────────────────────────────────────────

export async function recalculateOdds(raceId: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.rpc('recalculate_odds', { p_race_id: raceId })
  if (error) throw new Error(error.message)
}
