'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup' | 'magic'

export default function PortalAuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/portal'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setNotice('')
    const supabase = getSupabaseBrowserClient()
    const origin = window.location.origin

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${origin}/portal/auth/callback?next=${encodeURIComponent(next)}` },
        })
        if (error) throw error
        setNotice('Check your email for a secure sign-in link.')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${origin}/portal/auth/callback?next=${encodeURIComponent(next)}`,
          },
        })
        if (error) throw error
        setNotice('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(next)
        router.refresh()
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabBtn = (m: Mode, label: string) => (
    <button type="button" onClick={() => { setMode(m); setError(''); setNotice('') }}
      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
        mode === m ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      {label}
    </button>
  )

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">VisitPlane Portal</h1>
        <p className="text-gray-500 text-sm mt-1">Track your visa orders and documents.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl mb-5">
          {tabBtn('signin', 'Sign in')}
          {tabBtn('signup', 'Create account')}
          {tabBtn('magic', 'Email link')}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Full name" autoComplete="name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {mode !== 'magic' && (
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
          {notice && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{notice}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-medium rounded-lg py-2.5 transition-colors">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send sign-in link'}
          </button>
        </form>
      </div>

      <p className="text-center text-gray-400 text-xs mt-5">
        Your passport data is encrypted and never shared. See our{' '}
        <a href="/privacy" className="underline hover:text-gray-600">privacy policy</a>.
      </p>
    </div>
  )
}
