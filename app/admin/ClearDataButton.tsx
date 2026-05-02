'use client'

import { useState } from 'react'
import { clearAllDataAction } from './actions'

export function ClearDataButton() {
  const [confirmed, setConfirmed] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleClear() {
    setIsPending(true)
    await clearAllDataAction()
  }

  return (
    <div className="border border-red-200 rounded-lg p-5 bg-red-50 space-y-3">
      <div>
        <h3 className="font-semibold text-red-800">Danger Zone</h3>
        <p className="text-sm text-red-700 mt-0.5">
          This will permanently delete all races, horses, and bets. Cannot be undone.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-red-700 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="rounded"
        />
        I understand this will delete everything
      </label>
      <button
        onClick={handleClear}
        disabled={!confirmed || isPending}
        className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Deleting...' : 'Delete All Data'}
      </button>
    </div>
  )
}
