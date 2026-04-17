import { getLeaderboard } from '@/lib/data'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const entries = await getLeaderboard()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Link href="/races" className="text-sm text-emerald-600 hover:underline">
          &larr; All Races
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          No winners yet. Results will appear here once a race is finished and a winner is declared.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bettor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Race</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Winner</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Bet</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Odds</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Payout</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 ${i === 0 ? 'bg-yellow-50' : ''}`}
                >
                  <td className="py-3 px-4 font-bold text-gray-500">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td className="py-3 px-4 font-semibold">{entry.bettor_name}</td>
                  <td className="py-3 px-4 text-gray-600">{entry.race_name}</td>
                  <td className="py-3 px-4 text-gray-600">{entry.runner_name}</td>
                  <td className="py-3 px-4 text-right">${entry.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{entry.odds}x</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    ${entry.payout.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
