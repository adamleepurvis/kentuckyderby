'use client'

import { useActionState, useState } from 'react'
import { createRaceAction } from './actions'

type State = { error?: string } | null

export function NewRaceForm() {
  const [state, formAction, isPending] = useActionState(createRaceAction, null)
  const [runners, setRunners] = useState([{ name: '', odds: '2.0' }])

  const addRunner = () => setRunners((prev) => [...prev, { name: '', odds: '2.0' }])
  const removeRunner = (i: number) => setRunners((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Race Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Race Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Kentucky Derby 2025"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Runners</h2>
          <button
            type="button"
            onClick={addRunner}
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            + Add Runner
          </button>
        </div>
        {runners.map((runner, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              name={`runner_name_${i}`}
              type="text"
              placeholder="Runner name"
              value={runner.name}
              onChange={(e) =>
                setRunners((prev) =>
                  prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r))
                )
              }
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              name={`runner_odds_${i}`}
              type="number"
              placeholder="Odds"
              step="0.1"
              min="1.01"
              value={runner.odds}
              onChange={(e) =>
                setRunners((prev) =>
                  prev.map((r, idx) => (idx === i ? { ...r, odds: e.target.value } : r))
                )
              }
              className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {runners.length > 1 && (
              <button
                type="button"
                onClick={() => removeRunner(i)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-emerald-600 text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Creating...' : 'Create Race'}
        </button>
        <a
          href="/admin"
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
