'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Globe2, CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `https://terra-tethers-v2-kss8.vercel.app/auth/callback`,
        data: { referral_code: ref ?? null },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Try to sign in directly (for email confirmation disabled setups)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        // Apply referral if present
        if (ref) {
          await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referral_code: ref }),
          })
        }
        router.push('/market')
        router.refresh()
      } else {
        setDone(true)
      }
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-zinc-400 text-sm">We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account and start trading.</p>
        <Link href="/login" className="text-sm text-emerald-400 hover:text-emerald-300">
          Back to sign in →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-white" />
          </div>
          Terra Tethers
        </Link>
        <h1 className="text-2xl font-black text-white mt-4">Start trading free</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Get $10,000 in fake money instantly{ref && ' + $500 referral bonus'}
        </p>
      </div>

      {ref && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 text-sm text-emerald-400 text-center">
          🎉 Referral code applied — you'll get <strong>$500 bonus</strong> on signup!
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <Input label="Email" type="email" placeholder="trader@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{error}</div>}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create Account → Start Trading
        </Button>

        <p className="text-center text-xs text-zinc-600">
          By signing up you agree to our Terms. Paper trading only — no real money.
        </p>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-white hover:text-zinc-200 font-medium">Sign in →</Link>
      </p>
    </>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-zinc-600 text-center">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
