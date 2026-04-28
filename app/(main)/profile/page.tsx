'use client'
import { useState, useEffect } from 'react'
import { Profile } from '@/lib/types'
import { formatCurrency, formatPct, rarityColor, rarityGlow, cn, timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Share2, Flame, Trophy, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileData {
  profile: Profile
  email: string
}
interface AchievementsData {
  earned: Array<{ user_id: string; achievement_id: string; earned_at: string; achievement: { id: string; name: string; description: string; icon: string; rarity: string; points: number } }>
  all: Array<{ id: string; name: string; description: string; icon: string; rarity: string; points: number }>
}
interface ReferralData {
  referral_code: string
  referrals: Array<{ id: string; referred: { username: string; created_at: string }; bonus_amount: number }>
}
interface PortfolioStats {
  total_value: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [achievements, setAchievements] = useState<AchievementsData | null>(null)
  const [referrals, setReferrals] = useState<ReferralData | null>(null)
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/achievements').then(r => r.json()),
      fetch('/api/referrals').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
    ]).then(([profileRes, achRes, refRes, portfolioRes]) => {
      setProfileData(profileRes)
      setDisplayName(profileRes.profile?.display_name ?? '')
      setBio(profileRes.profile?.bio ?? '')
      setAchievements(achRes)
      setReferrals(refRes)
      setPortfolioStats(portfolioRes.stats)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, bio }),
    })
    if (res.ok) setEditing(false)
    setSaving(false)
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referrals?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const profile = profileData?.profile
  const earnedIds = achievements?.earned.map(e => e.achievement_id) ?? []
  const totalPoints = achievements?.earned.reduce((s, e) => s + (e.achievement?.points ?? 0), 0) ?? 0
  const totalReturn = portfolioStats ? ((portfolioStats.total_value - 10000) / 10000) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {profile?.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" label="Display name" />
                <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell traders who you are..." label="Bio" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">{profile?.display_name || profile?.username}</h1>
                  <button onClick={() => setEditing(true)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Edit</button>
                </div>
                <div className="text-sm text-zinc-500">@{profile?.username}</div>
                {profile?.bio && <p className="text-sm text-zinc-400 mt-1">{profile.bio}</p>}
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-600">
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
                  <span>·</span>
                  <span>{profile?.total_trades} trades</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {profile?.login_streak ?? 0} day streak
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-zinc-800">
          {[
            { label: 'Balance', value: formatCurrency(profile?.balance ?? 0) },
            { label: 'Total Return', value: formatPct(totalReturn, true), colored: true, val: totalReturn },
            { label: 'Achievement Points', value: `${totalPoints} pts` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={cn('text-lg font-bold', s.colored ? (s.val ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' : 'text-white')}>
                {s.value}
              </div>
              <div className="text-xs text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <h2 className="font-bold text-white">Referral Program</h2>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
            {referrals?.referrals.length ?? 0} friends invited
          </span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 mb-4">
          <code className="flex-1 text-sm text-emerald-400 font-mono">
            {typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referrals?.referral_code}` : `/signup?ref=${referrals?.referral_code}`}
          </code>
          <button onClick={copyReferralLink} className="text-zinc-500 hover:text-white transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-sm text-zinc-500 mb-4">
          Share your link and earn <strong className="text-white">$500 bonus cash</strong> for every friend who signs up. They also get $500!
        </p>

        {referrals?.referrals && referrals.referrals.length > 0 && (
          <div className="space-y-2">
            {referrals.referrals.map(ref => (
              <div key={ref.id} className="flex items-center justify-between text-sm py-1.5 border-t border-zinc-800/60">
                <span className="text-zinc-400">@{ref.referred?.username}</span>
                <span className="text-emerald-400 font-medium">+${ref.bonus_amount} bonus</span>
                <span className="text-zinc-600 text-xs">{timeAgo(ref.referred?.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white">Achievements</h2>
          <span className="text-xs text-zinc-600 ml-auto">{earnedIds.length}/{achievements?.all.length ?? 0} unlocked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {achievements?.all.map(ach => {
            const earned = earnedIds.includes(ach.id)
            const earnedAt = achievements.earned.find(e => e.achievement_id === ach.id)?.earned_at
            return (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.03 }}
                className={cn(
                  'border rounded-xl p-3 text-center transition-all',
                  earned
                    ? cn('border', rarityColor(ach.rarity), rarityGlow(ach.rarity), 'shadow-lg')
                    : 'border-zinc-800 opacity-40 grayscale'
                )}
              >
                <div className="text-2xl mb-1">{ach.icon}</div>
                <div className="text-xs font-bold text-white leading-tight">{ach.name}</div>
                <div className={cn('text-xs mt-0.5 capitalize', earned ? rarityColor(ach.rarity).split(' ')[0] : 'text-zinc-600')}>
                  {ach.rarity}
                </div>
                {earned && earnedAt && (
                  <div className="text-xs text-zinc-600 mt-0.5">{timeAgo(earnedAt)}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
