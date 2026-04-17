'use server'

import { checkAdminPassword, setAdminCookie } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const isValid = await checkAdminPassword(password)
  if (!isValid) {
    return { error: 'Invalid password.' }
  }
  await setAdminCookie()
  redirect('/admin')
}
