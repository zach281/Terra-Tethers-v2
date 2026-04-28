'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ position?: number; error?: string; already?: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.already_registered) setResult({ already: true, position: data.position })
      else if (data.position) setResult({ position: data.position })
      else setResult({ error: data.error || 'Something went wrong' })
    } catch {
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  if (result?.position) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
        <div className="text-white font-bold">
          {result.already ? "You're already on the list!" : "You're on the list!"}
        </div>
        <div className="text-sm text-zinc-400">
          Position <strong className="text-emerald-400">#{result.position.toLocaleString()}</strong> — we'll email you when real trading goes live.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" loading={loading} size="md">
        Join
      </Button>
      {result?.error && <p className="text-xs text-red-400 mt-1">{result.error}</p>}
    </form>
  )
}
