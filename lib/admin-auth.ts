import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'admin_session'
const COOKIE_VALUE = 'authenticated'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  if (session?.value !== COOKIE_VALUE) {
    redirect('/admin/login')
  }
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD
}

export async function setAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
