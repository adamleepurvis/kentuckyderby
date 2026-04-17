import { requireAdmin } from '@/lib/admin-auth'
import { NewRaceForm } from './NewRaceForm'
import Link from 'next/link'

export default async function NewRacePage() {
  await requireAdmin()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Back to Admin
        </Link>
        <h1 className="text-2xl font-bold">New Race</h1>
      </div>
      <NewRaceForm />
    </div>
  )
}
