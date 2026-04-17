'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Runner } from '@/lib/types'

export function RunnersTable({
  initialRunners,
  raceId,
}: {
  initialRunners: Runner[]
  raceId: string
}) {
  const [runners, setRunners] = useState(initialRunners)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`race-${raceId}-runners`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'runners',
          filter: `race_id=eq.${raceId}`,
        },
        (payload) => {
          setRunners((prev) =>
            prev.map((r) =>
              r.id === payload.new.id ? { ...r, ...(payload.new as Runner) } : r
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [raceId])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Runner</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Starting Odds</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Current Odds</th>
          </tr>
        </thead>
        <tbody>
          {runners.map((runner) => (
            <tr key={runner.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{runner.name}</td>
              <td className="py-3 px-4 text-right text-gray-500">{runner.starting_odds}x</td>
              <td className="py-3 px-4 text-right font-bold text-emerald-700">
                {runner.current_odds}x
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
