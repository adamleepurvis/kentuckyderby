'use client'

import { useActionState } from 'react'
import { addRunnerAction } from './actions'

type State = { error?: string; success?: boolean } | null

export function AddRunnerForm({ raceId }: { raceId: string }) {
  const [state, formAction, isPending] = useActionState(addRunnerAction, null)

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="race_id" value={raceId} />

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Runner Name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="e.g. Secretariat"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Odds <span className="font-normal text-gray-400">(pre-bet)</span></label>
        <input
          name="starting_odds"
          type="number"
          required
          min="1.01"
          step="0.1"
          defaultValue="2.0"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {isPending ? 'Adding...' : 'Add Runner'}
      </button>

      {state?.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}
    </form>
  )
}
