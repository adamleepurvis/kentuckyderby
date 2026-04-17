'use client'

import { useActionState, useState } from 'react'
import { createRaceAction } from './actions'

type State = { error?: string } | null

const DEFAULT_ODDS = 2.0
const STEP = 0.5
const MIN_ODDS = 1.1

// Convert decimal odds to implied probability
const toProb = (odds: number) => 1 / odds

// Convert implied probability to decimal odds, rounded to 1dp
const toOdds = (prob: number) => Math.round((1 / prob) * 10) / 10

function adjustOdds(probs: number[], index: number, direction: 1 | -1): number[] {
  // direction 1 = up (longer odds, lower prob), -1 = down (shorter odds, higher prob)
  const probStep = direction * (STEP / (DEFAULT_ODDS * DEFAULT_ODDS)) // convert odds step to prob step at current scale

  // Work in odds-space: apply step, then rebalance others
  const currentOdds = probs.map(toOdds)
  const newOddsForRunner = Math.max(MIN_ODDS, currentOdds[index] + direction * STEP)
  const actualOddsDelta = newOddsForRunner - currentOdds[index]

  if (actualOddsDelta === 0) return probs

  const newProbForRunner = toProb(newOddsForRunner)
  const probDelta = probs[index] - newProbForRunner // how much prob was freed up or taken

  // Distribute prob delta proportionately among other runners
  const otherTotal = probs.reduce((sum, p, i) => (i !== index ? sum + p : sum), 0)
  const newProbs = probs.map((p, i) => {
    if (i === index) return newProbForRunner
    // Each other runner gets/gives a share proportional to its current probability
    const adjusted = p + probDelta * (p / otherTotal)
    return Math.max(toProb(20), adjusted) // cap at 20x max odds
  })

  return newProbs
}

function makeRunners(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    name: '',
    prob: toProb(DEFAULT_ODDS),
  }))
}

export function NewRaceForm() {
  const [state, formAction, isPending] = useActionState(createRaceAction, null)
  const [numRunners, setNumRunners] = useState(4)
  const [runners, setRunners] = useState(() => makeRunners(4))

  function handleNumRunnersChange(n: number) {
    const clamped = Math.max(2, Math.min(20, n))
    setNumRunners(clamped)
    setRunners(makeRunners(clamped))
  }

  function handleOddsAdjust(index: number, direction: 1 | -1) {
    setRunners((prev) => {
      const newProbs = adjustOdds(prev.map((r) => r.prob), index, direction)
      return prev.map((r, i) => ({ ...r, prob: newProbs[i] }))
    })
  }

  function handleNameChange(index: number, name: string) {
    setRunners((prev) => prev.map((r, i) => (i === index ? { ...r, name } : r)))
  }

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
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Number of runners:</label>
            <input
              type="number"
              min={2}
              max={20}
              value={numRunners}
              onChange={(e) => handleNumRunnersChange(parseInt(e.target.value) || 2)}
              className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 text-xs font-medium text-gray-500 px-1">
          <span className="flex-1">Runner Name</span>
          <span className="w-36 text-center">Starting Odds (pre-bet)</span>
        </div>

        {runners.map((runner, i) => {
          const odds = toOdds(runner.prob)
          return (
            <div key={i} className="flex items-center gap-3">
              {/* Hidden field with computed odds */}
              <input type="hidden" name={`runner_name_${i}`} value={runner.name} />
              <input type="hidden" name={`runner_odds_${i}`} value={odds} />

              <input
                type="text"
                placeholder={`Runner ${i + 1} name`}
                value={runner.name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-1 w-36 justify-center">
                <button
                  type="button"
                  onClick={() => handleOddsAdjust(i, -1)}
                  className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-base font-bold"
                  title="Decrease odds (more likely)"
                >
                  ↓
                </button>
                <span className="w-16 text-center font-semibold text-gray-900 text-sm">
                  {odds}x
                </span>
                <button
                  type="button"
                  onClick={() => handleOddsAdjust(i, 1)}
                  className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-base font-bold"
                  title="Increase odds (less likely)"
                >
                  ↑
                </button>
              </div>
            </div>
          )
        })}

        <p className="text-xs text-gray-400">
          ↑ longer odds (bigger payout) · ↓ shorter odds (more likely to win) · adjusting one runner rebalances the others
        </p>
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
