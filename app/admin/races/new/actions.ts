'use server'

import { requireAdmin } from '@/lib/admin-auth'
import { createRace, createRunner } from '@/lib/data'
import { redirect } from 'next/navigation'
import type { RaceStatus } from '@/lib/types'

export async function createRaceAction(_prevState: unknown, formData: FormData) {
  await requireAdmin()

  const name = (formData.get('name') as string)?.trim()
  const status = formData.get('status') as RaceStatus

  if (!name) return { error: 'Race name is required.' }

  // Collect runners: name_0, odds_0, name_1, odds_1, ...
  const runners: { name: string; odds: number }[] = []
  let i = 0
  while (formData.get(`runner_name_${i}`) !== null) {
    const rName = (formData.get(`runner_name_${i}`) as string)?.trim()
    const rOdds = parseFloat(formData.get(`runner_odds_${i}`) as string)
    if (rName && !isNaN(rOdds) && rOdds > 0) {
      runners.push({ name: rName, odds: rOdds })
    }
    i++
  }

  try {
    const race = await createRace(name, status || 'upcoming')
    for (const r of runners) {
      await createRunner(race.id, r.name, r.odds)
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create race.' }
  }

  redirect('/admin')
}
