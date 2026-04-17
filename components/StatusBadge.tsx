import type { RaceStatus } from '@/lib/types'

const styles: Record<RaceStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  open: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-yellow-100 text-yellow-800',
  finished: 'bg-gray-100 text-gray-700',
}

export function StatusBadge({ status }: { status: RaceStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}
