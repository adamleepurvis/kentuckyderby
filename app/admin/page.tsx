import { requireAdmin } from '@/lib/admin-auth'
import { getRaces } from '@/lib/data'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()
  const races = await getRaces()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin — Races</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/races/new"
            className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            + New Race
          </Link>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-900 underline"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {races.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No races yet.{' '}
          <Link href="/admin/races/new" className="text-emerald-600 hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Race</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {races.map((race) => (
                <tr key={race.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{race.name}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={race.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(race.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/races/${race.id}`}
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Manage
                    </Link>
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
