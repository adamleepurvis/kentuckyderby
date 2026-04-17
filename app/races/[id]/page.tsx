import { notFound } from 'next/navigation'
import { getRace, getRunners } from '@/lib/data'
import { StatusBadge } from '@/components/StatusBadge'
import { RunnersTable } from './RunnersTable'
import { BetForm } from './BetForm'

export const dynamic = 'force-dynamic'

export default async function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [race, runners] = await Promise.all([getRace(id), getRunners(id)])

  if (!race) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{race.name}</h1>
            <StatusBadge status={race.status} />
          </div>
          <p className="text-sm text-gray-500">
            {new Date(race.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Runners & Odds</h2>
          <p className="text-xs text-gray-500 mt-0.5">Odds update live as bets come in</p>
        </div>
        {runners.length === 0 ? (
          <p className="px-6 py-4 text-gray-500 text-sm">No runners added yet.</p>
        ) : (
          <RunnersTable initialRunners={runners} raceId={race.id} />
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

      <div className="text-center">
        <a href="/races" className="text-sm text-emerald-600 hover:underline">
          &larr; Back to all races
        </a>
      </div>
    </div>
  )
}
