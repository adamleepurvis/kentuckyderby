export type RaceStatus = 'upcoming' | 'open' | 'closed' | 'finished'

export interface Race {
  id: string
  name: string
  status: RaceStatus
  created_at: string
}

export interface Runner {
  id: string
  race_id: string
  name: string
  starting_odds: number
  current_odds: number
  created_at: string
}

export interface Bet {
  id: string
  runner_id: string
  race_id: string
  bettor_name: string
  amount: number
  odds_at_time_of_bet: number
  created_at: string
}

export interface RunnerWithBets extends Runner {
  total_bets: number
  bet_count: number
}
