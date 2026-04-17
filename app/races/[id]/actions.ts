'use server'

import { placeBet, getRunners } from '@/lib/data'
import { revalidatePath } from 'next/cache'

export async function placeBetAction(_prevState: unknown, formData: FormData) {
  const raceId = formData.get('race_id') as string
  const runnerId = formData.get('runner_id') as string
  const bettorName = (formData.get('bettor_name') as string)?.trim()
  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr)

  if (!raceId || !runnerId || !bettorName || isNaN(amount) || amount <= 0) {
    return { error: 'All fields are required and amount must be positive.' }
  }

  try {
    // Get the current odds for this runner at bet time
    const runners = await getRunners(raceId)
    const runner = runners.find((r) => r.id === runnerId)
    if (!runner) return { error: 'Runner not found.' }

    const bet = await placeBet(raceId, runnerId, bettorName, amount, runner.current_odds)
    revalidatePath(`/races/${raceId}`)
    return {
      success: true,
      bet,
      runnerName: runner.name,
      lockedOdds: runner.current_odds,
      potentialPayout: parseFloat((amount * runner.current_odds).toFixed(2)),
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to place bet.' }
  }
}
