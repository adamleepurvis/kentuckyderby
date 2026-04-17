import { notFound } from 'next/navigation'
import { getRace, getRunners, getBets } from '@/lib/data'
import { StatusBadge } from '@/components/StatusBadge'
import { RunnersTable } from './RunnersTable'
import { BetForm } from './BetForm'

export const dynamic = 'force-dynamic'

export default async function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [race, runners, bets] = await Promise.all([getRace(id), getRunners(id), getBets(id)])

  if (!race) notFound()

  const winnerRunner = race.winner_runner_id
    ? runners.find((r) => r.id === race.winner_runner_id)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{race.name}</h1>
            <StatusBadge status={race.status} />
          </div>
        </div>
      </div>

      {winnerRunner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-4">
          <p className="text-yellow-800 font-semibold text-lg">
            Winner: {winnerRunner.name}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Runners & Odds</h2>
          <p className="text-xs text-gray-500 mt-0.5">Odds update live as bets come in</p>
        </div>
        {runners.length === 0 ? (
          <p className="px-6 py-4 text-gray-500 text-sm">No runners added yet.</p>
        ) : (
          <RunnersTable initialRunners={runners} raceId={race.id} winnerId={race.winner_runner_id} />
        )}
      </div>

      {race.status === 'open' && runners.length > 0 && (
        <BetForm raceId={race.id} runners={runners} />
      )}

      {race.status !== 'open' && (
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600 text-center">
          {race.status === 'upcoming' && 'Betting is not yet open for this race.'}
          {race.status === 'closed' && 'Betting is closed for this race.'}
          {race.status === 'finished' && 'This race has finished. Betting is closed.'}
        </div>
      )}

      {/* Bets */}
      {bets.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Bets Placed</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {bets.length} bet{bets.length !== 1 ? 's' : ''} — total pool: $
              {bets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bettor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Runner</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Odds</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Potential Payout</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const isWinner = winnerRunner && bet.runner_name === winnerRunner.name
                  return (
                    <tr key={bet.id} className={`border-b border-gray-100 ${isWinner ? 'bg-yellow-50' : ''}`}>
                      <td className="py-3 px-4 font-medium">
                        {bet.bettor_name}
                        {isWinner && <span className="ml-2 text-yellow-600 text-xs font-semibold">Winner!</span>}
                      </td>
                      <td className="py-3 px-4">{bet.runner_name}</td>
                      <td className="py-3 px-4 text-right">${bet.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">{bet.odds_at_time_of_bet}x</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                        ${(bet.amount * bet.odds_at_time_of_bet).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <a href="/races" className="text-sm text-emerald-600 hover:underline">
          &larr; Back to all races
        </a>
        <a href="/leaderboard" className="text-sm text-emerald-600 hover:underline">
          Leaderboard &rarr;
        </a>
      </div>
    </div>
  )
}
