'use client'

import { useActionState } from 'react'
import { placeBetAction } from './actions'
import type { Runner } from '@/lib/types'

type State = {
  error?: string
  success?: boolean
  runnerName?: string
  lockedOdds?: number
  potentialPayout?: number
} | null

export function BetForm({ raceId, runners }: { raceId: string; runners: Runner[] }) {
  const [state, formAction, isPending] = useActionState(placeBetAction, null)

  if (state?.success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-bold text-emerald-800 text-lg mb-2">Bet Confirmed!</h3>
        <p className="text-emerald-700">
          Your bet on <strong>{state.runnerName}</strong> has been placed at{' '}
          <strong>{state.lockedOdds}x</strong> odds.
        </p>
        <p className="text-emerald-700 mt-1">
          Potential payout: <strong>${state.potentialPayout?.toFixed(2)}</strong>
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-emerald-700 underline"
        >
          Place another bet
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg">Place a Bet</h3>

      <input type="hidden" name="race_id" value={raceId} />

      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          name="bettor_name"
          type="text"
          required
          placeholder="Enter your name"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Runner</label>
        <select
          name="runner_id"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select a runner...</option>
          {runners.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.current_odds}x
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bet Amount ($)</label>
        <input
          name="amount"
          type="number"
          required
          min="0.01"
          step="0.01"
          placeholder="10.00"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Placing bet...' : 'Place Bet'}
      </button>
    </form>
  )
}
