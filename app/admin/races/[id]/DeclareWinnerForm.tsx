'use client'

import { useActionState } from 'react'
import { declareWinnerAction } from './actions'
import type { Runner } from '@/lib/types'

type State = { error?: string; success?: boolean } | null

export function DeclareWinnerForm({
  raceId,
  runners,
  currentWinnerId,
}: {
  raceId: string
  runners: Runner[]
  currentWinnerId: string | null
}) {
  const [state, formAction, isPending] = useActionState(declareWinnerAction, null)

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="race_id" value={raceId} />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Winning Runner</label>
        <select
          name="winner_runner_id"
          defaultValue={currentWinnerId ?? ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select winner...</option>
          {runners.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-yellow-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {isPending ? 'Saving...' : 'Declare Winner'}
      </button>
      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.success && <p className="text-emerald-600 text-sm">Winner declared!</p>}
    </form>
  )
}
