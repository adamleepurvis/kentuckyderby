'use client'

import { useActionState } from 'react'
import { updateRaceAction } from './actions'
import type { Race } from '@/lib/types'

type State = { error?: string; success?: boolean } | null

export function EditRaceForm({ race }: { race: Race }) {
  const [state, formAction, isPending] = useActionState(updateRaceAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="race_id" value={race.id} />

      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-700">
          Race updated successfully.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Race Name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={race.name}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={race.status}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
