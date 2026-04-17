import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getRace, getRunners, getBets } from '@/lib/data'
import { StatusBadge } from '@/components/StatusBadge'
import { EditRaceForm } from './EditRaceForm'
import { AddRunnerForm } from './AddRunnerForm'
import { DeclareWinnerForm } from './DeclareWinnerForm'
import { deleteRunnerAction, recalculateOddsAction } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminRacePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const [race, runners, bets] = await Promise.all([
    getRace(id),
    getRunners(id),
    getBets(id),
  ])

  if (!race) notFound()

  const totalPool = bets.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Back
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{race.name}</h1>
          <StatusBadge status={race.status} />
        </div>
      </div>

      {/* Edit race */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Edit Race</h2>
        <EditRaceForm race={race} />
      </section>

      {/* Runners */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Runners</h2>
          <form action={recalculateOddsAction}>
            <input type="hidden" name="race_id" value={race.id} />
            <button
              type="submit"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Recalculate Odds
            </button>
          </form>
        </div>

        {runners.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">Name</th>
                <th className="text-right py-2 font-semibold text-gray-700">Starting Odds</th>
                <th className="text-right py-2 font-semibold text-gray-700">Current Odds</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {runners.map((runner) => (
                <tr key={runner.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{runner.name}</td>
                  <td className="py-2 text-right text-gray-500">{runner.starting_odds}x</td>
                  <td className="py-2 text-right font-bold text-emerald-700">{runner.current_odds}x</td>
                  <td className="py-2 text-right">
                    <form action={deleteRunnerAction} className="inline">
                      <input type="hidden" name="runner_id" value={runner.id} />
                      <input type="hidden" name="race_id" value={race.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No runners yet.</p>
        )}

        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Runner</h3>
          <AddRunnerForm raceId={race.id} />
        </div>
      </section>

      {/* Declare Winner */}
      {runners.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Declare Winner</h2>
            <p className="text-xs text-gray-500 mt-0.5">Setting a winner marks the race as finished.</p>
          </div>
          {race.winner_runner_id && (
            <p className="text-sm text-emerald-700 font-medium">
              Current winner: {runners.find(r => r.id === race.winner_runner_id)?.name}
            </p>
          )}
          <DeclareWinnerForm
            raceId={race.id}
            runners={runners}
            currentWinnerId={race.winner_runner_id}
          />
        </section>
      )}

      {/* Bets */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Bets</h2>
          <span className="text-sm text-gray-500">
            Total pool: <strong>${totalPool.toFixed(2)}</strong>
          </span>
        </div>

        {bets.length === 0 ? (
          <p className="text-gray-500 text-sm">No bets placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Bettor</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Runner</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Odds</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Potential</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Placed</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id} className="border-b border-gray-100">
                    <td className="py-2">{bet.bettor_name}</td>
                    <td className="py-2">{bet.runner_name}</td>
                    <td className="py-2 text-right">${bet.amount.toFixed(2)}</td>
                    <td className="py-2 text-right">{bet.odds_at_time_of_bet}x</td>
                    <td className="py-2 text-right text-emerald-700 font-medium">
                      ${(bet.amount * bet.odds_at_time_of_bet).toFixed(2)}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {new Date(bet.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div>
        <Link href={`/races/${race.id}`} className="text-sm text-emerald-600 hover:underline">
          View public race page &rarr;
        </Link>
      </div>
    </div>
  )
}
