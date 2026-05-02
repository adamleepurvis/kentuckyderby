'use server'

import { requireAdmin } from '@/lib/admin-auth'
import { clearAllData } from '@/lib/data'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function clearAllDataAction(): Promise<void> {
  await requireAdmin()
  await clearAllData()
  revalidatePath('/admin')
  revalidatePath('/races')
  revalidatePath('/leaderboard')
  redirect('/admin')
}
