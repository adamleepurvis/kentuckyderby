'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

type State = { error?: string } | null

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
