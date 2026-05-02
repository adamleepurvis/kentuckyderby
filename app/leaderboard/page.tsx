import { getLeaderboard, getCumulativeStandings, getOpenRacesWithBets } from '@/lib/data'
import { LeaderboardRealtime } from './LeaderboardRealtime'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const [entries, openRaces] = await Promise.all([
    getLeaderboard(),
    getOpenRacesWithBets(),
  ])
  const standings = getCumulativeStandings(entries)

  return (
    <div className="space-y-8">
      <LeaderboardRealtime />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Link href="/races" className="text-sm text-emerald-600 hover:underline">
          &larr; All Races
        </Link>
      </div>

      {/* Open races with live bets */}
      {openRaces.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Live Races</h2>
          {openRaces.map((race) => (
            <div key={race.id} className="bg-white border border-emerald-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                <span className="font-semibold text-emerald-800">{race.name}</span>
                <span className="text-sm text-emerald-700">
                  Pool: <strong>${race.total_pool.toFixed(2)}</strong> · {race.bets.length} bet{race.bets.length !== 1 ? 's' : ''}
                </span>
              </div>
              {race.bets.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500">No bets yet.</p>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-2 px-5 font-semibold text-gray-700">Bettor</th>
                      <th className="text-left py-2 px-5 font-semibold text-gray-700">Horse</th>
                      <th className="text-right py-2 px-5 font-semibold text-gray-700">Amount</th>
                      <th className="text-right py-2 px-5 font-semibold text-gray-700">Odds</th>
                      <th className="text-right py-2 px-5 font-semibold text-gray-700">Potential</th>
                    </tr>
                  </thead>
                  <tbody>
                    {race.bets.map((bet) => (
                      <tr key={bet.id} className="border-b border-gray-100">
                        <td className="py-2 px-5 font-medium">{bet.bettor_name}</td>
                        <td className="py-2 px-5 text-gray-600">{bet.runner_name}</td>
                        <td className="py-2 px-5 text-right">${bet.amount.toFixed(2)}</td>
                        <td className="py-2 px-5 text-right">{bet.odds_at_time_of_bet}x</td>
                        <td className="py-2 px-5 text-right font-medium text-emerald-700">
                          ${(bet.amount * bet.odds_at_time_of_bet).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Cumulative standings */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Overall Standings</h2>
        {standings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No results yet. Standings appear once a race is finished and a winner is declared.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bettor</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Bets</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Wins</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Wagered</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.bettor_name} className={`border-b border-gray-100 ${s.net >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <td className="py-3 px-4 font-bold text-gray-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="py-3 px-4 font-semibold">{s.bettor_name}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{s.bets}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{s.wins} / {s.bets}</td>
                    <td className="py-3 px-4 text-right text-gray-600">${s.total_wagered.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${s.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {s.net >= 0 ? `+$${s.net.toFixed(2)}` : `-$${Math.abs(s.net).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>

      {/* Per-bet results */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Race Results</h2>
        {entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No results yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bettor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Race</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Horse</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Bet</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Odds</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Result</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${entry.won ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <td className="py-3 px-4 font-semibold">{entry.bettor_name}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.race_name}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.runner_name}</td>
                    <td className="py-3 px-4 text-right">${entry.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">{entry.odds}x</td>
                    <td className={`py-3 px-4 text-right font-bold ${entry.won ? 'text-emerald-700' : 'text-red-600'}`}>
                      {entry.won ? `+$${entry.result.toFixed(2)}` : `-$${entry.amount.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
