import { getRaces } from '@/lib/data'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RacesPage() {
  const races = await getRaces()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Races</h1>
      {races.length === 0 ? (
        <p className="text-gray-500">No races yet. Check back soon!</p>
      ) : (
        <div className="grid gap-4">
          {races.map((race) => (
            <Link
              key={race.id}
              href={`/races/${race.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{race.name}</h2>
                <StatusBadge status={race.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
