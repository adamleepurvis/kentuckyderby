'use server'

import { requireAdmin } from '@/lib/admin-auth'
import {
  updateRace,
  createRunner,
  deleteRunner,
  recalculateOdds,
  declareWinner,
} from '@/lib/data'
import { revalidatePath } from 'next/cache'
import type { RaceStatus } from '@/lib/types'

export async function updateRaceAction(_prevState: unknown, formData: FormData) {
  await requireAdmin()
  const raceId = formData.get('race_id') as string
  const name = (formData.get('name') as string)?.trim()
  const status = formData.get('status') as RaceStatus

  if (!name) return { error: 'Race name is required.' }

  try {
    await updateRace(raceId, { name, status })
    revalidatePath(`/admin/races/${raceId}`)
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update race.' }
  }
}

export async function addRunnerAction(_prevState: unknown, formData: FormData) {
  await requireAdmin()
  const raceId = formData.get('race_id') as string
  const name = (formData.get('name') as string)?.trim()
  const odds = parseFloat(formData.get('starting_odds') as string)

  if (!name || isNaN(odds) || odds <= 0) {
    return { error: 'Runner name and valid odds are required.' }
  }

  try {
    await createRunner(raceId, name, odds)
    revalidatePath(`/admin/races/${raceId}`)
    revalidatePath(`/races/${raceId}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to add runner.' }
  }
}

export async function deleteRunnerAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const runnerId = formData.get('runner_id') as string
  const raceId = formData.get('race_id') as string
  await deleteRunner(runnerId)
  revalidatePath(`/admin/races/${raceId}`)
  revalidatePath(`/races/${raceId}`)
}

export async function declareWinnerAction(_prevState: unknown, formData: FormData) {
  await requireAdmin()
  const raceId = formData.get('race_id') as string
  const winnerRunnerId = formData.get('winner_runner_id') as string
  if (!winnerRunnerId) return { error: 'Please select a winner.' }
  try {
    await declareWinner(raceId, winnerRunnerId)
    revalidatePath(`/admin/races/${raceId}`)
    revalidatePath(`/races/${raceId}`)
    revalidatePath('/leaderboard')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to declare winner.' }
  }
}

export async function recalculateOddsAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const raceId = formData.get('race_id') as string
  await recalculateOdds(raceId)
  revalidatePath(`/admin/races/${raceId}`)
  revalidatePath(`/races/${raceId}`)
}
