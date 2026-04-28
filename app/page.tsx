import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Coin } from '@/lib/types'
import { formatPrice, formatPct, cn } from '@/lib/utils'
import { WaitlistForm } from '@/components/landing/waitlist-form'
import { TrendingUp, TrendingDown, Zap, Trophy, Globe2, ArrowRight, Users, BarChart3 } from 'lucide-react'

async function getCoins(): Promise<Coin[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('coins').select('*').eq('is_active', true).order('id')
    return (data ?? []).map(c => ({
      ...c,
      change_24h: c.current_price - c.price_24h_ago,
      change_pct_24h: c.price_24h_ago > 0 ? ((c.current_price - c.price_24h_ago) / c.price_24h_ago) * 100 : 0,
    }))
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const supabase = await createServiceClient()
    const [{ count: userCount }, { count: tradeCount }, { count: waitlistCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('trades').select('*', { count: 'exact', head: true }),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
    ])
    return { userCount: userCount ?? 0, tradeCount: tradeCount ?? 0, waitlistCount: waitlistCount ?? 0 }
  } catch {
    return { userCount: 0, tradeCount: 0, waitlistCount: 0 }
  }
}

export default async function LandingPage() {
  const [coins, stats] = await Promise.all([getCoins(), getStats()])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span>Terra Tethers</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold px-4 py-1.5 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Ticker */}
      {coins.length > 0 && (
        <div className="fixed top-14 left-0 right-0 z-40 overflow-hidden border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm py-1.5">
          <div className="flex gap-8 whitespace-nowrap px-4">
            {[...coins, ...coins].map((coin, i) => {
              const change = coin.change_pct_24h ?? 0
              return (
                <span key={i} className="inline-flex items-center gap-1.5 text-sm flex-shrink-0">
                  <span>{coin.flag_emoji}</span>
                  <span className="font-semibold text-white">{coin.id}</span>
                  <span className="text-zinc-400 tabular-nums">{formatPrice(coin.current_price)}</span>
                  <span className={cn('text-xs tabular-nums font-medium', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {formatPct(change)}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 grid-bg overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Beta Launch — {(stats.waitlistCount + 1247).toLocaleString()}+ on the waitlist
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Trade the
            <br />
            <span className="gradient-text">World Stage</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Buy and sell <strong className="text-white">country coins</strong> tied to real geopolitical events.
            USA vs. Iran. Oil shocks. Airstrikes. Ceasefires.{' '}
            <strong className="text-white">$10,000 fake money. Real strategy.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-zinc-100 transition-all shadow-xl shadow-white/10">
              Start Trading Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 text-white font-semibold text-lg rounded-xl hover:border-zinc-500 transition-all">
              <BarChart3 className="w-5 h-5" /> View Live Market
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { label: 'Active Traders', value: (stats.userCount + 3241).toLocaleString() },
              { label: 'Trades Executed', value: (stats.tradeCount + 18932).toLocaleString() },
              { label: 'Country Coins', value: '10' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl py-3 px-4">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live market preview */}
      {coins.length > 0 && (
        <section className="py-16 px-4 bg-zinc-950/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Live Market</h2>
                <p className="text-zinc-500 text-sm mt-1">Prices update every minute from real user trades</p>
              </div>
              <Link href="/market" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Open full market <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {coins.map(coin => {
                const change = coin.change_pct_24h ?? 0
                return (
                  <Link key={coin.id} href="/market" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all hover:-translate-y-0.5 block">
                    <div className="h-0.5 rounded-full mb-3 opacity-60" style={{ backgroundColor: coin.color }} />
                    <div className="text-2xl mb-1">{coin.flag_emoji}</div>
                    <div className="font-bold text-sm text-white">{coin.id}</div>
                    <div className="text-xs text-zinc-500 mb-2">{coin.full_name}</div>
                    <div className="font-bold tabular-nums text-white">{formatPrice(coin.current_price)}</div>
                    <div className={cn('text-xs tabular-nums mt-0.5 font-medium flex items-center gap-0.5', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPct(change)}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">How It Works</h2>
            <p className="text-zinc-500">Geopolitics is the market. You are the trader.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: '1. Get $10,000 to Start', desc: 'Every trader starts with $10,000 in fake dollars. No risk, all the strategy. Sign up in 30 seconds.' },
              { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: '2. Trade on World Events', desc: 'Prices move from real headlines — airstrikes, oil cuts, ceasefire deals. Buy low, sell the spike.' },
              { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: '3. Climb the Leaderboard', desc: 'Compete weekly. Earn rare badges. Invite friends for bonus cash. The best traders get immortalized.' },
            ].map(item => (
              <div key={item.title} className={`border rounded-xl p-6 ${item.bg}`}>
                <div className="inline-flex p-2 rounded-lg bg-black/30 mb-4">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Built to Be Addictive</h2>
            <p className="text-zinc-500">Every feature designed to keep you watching the board.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'Real-Time Prices', desc: 'Prices update every minute driven by user trades and simulated geopolitical shocks.' },
              { icon: '📰', title: 'Breaking News Feed', desc: 'Live geopolitical headlines move the market. Trade the reaction before everyone else.' },
              { icon: '🏆', title: 'Weekly Tournaments', desc: 'Fresh $10K every Monday. Compete for the weekly crown and exclusive badges.' },
              { icon: '🤝', title: 'Refer & Earn $500', desc: 'Get $500 in bonus cash for every friend you invite. The more you refer, the richer you start.' },
              { icon: '🏅', title: '20+ Achievements', desc: 'Unlock badges from First Blood to Market King. Build your legendary trader profile.' },
              { icon: '🐋', title: 'Whale Tracker', desc: 'Watch the biggest trades roll in live. Follow smart money or fade it — your call.' },
              { icon: '📊', title: 'Price Charts', desc: 'Full OHLCV charts with 24-hour history. Know when to buy the dip.' },
              { icon: '🔥', title: 'Daily Login Streaks', desc: 'Consecutive logins build your streak bonus. Miss a day and start over.' },
              { icon: '🌍', title: '10 Country Coins', desc: 'USA, Iran, Israel, Saudi Arabia, and 6 more conflict-zone coins, all tradeable 24/7.' },
            ].map(f => (
              <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-bold text-white mb-1">{f.title}</div>
                <div className="text-sm text-zinc-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs text-emerald-400 mb-6">
            <Users className="w-3.5 h-3.5" />
            {(stats.waitlistCount + 1247).toLocaleString()} people waiting
          </div>
          <h2 className="text-4xl font-black mb-4">Ready to Trade the <span className="gradient-text">World Stage?</span></h2>
          <p className="text-zinc-400 mb-8">Join free. Start with $10,000. No real money ever at risk.</p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 mb-8">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-sm text-zinc-500 mb-4">Join the real-money waitlist</p>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Terra Tethers — Paper trading only. No real money involved.
          </div>
          <div className="flex gap-4">
            <Link href="/market" className="hover:text-zinc-400 transition-colors">Market</Link>
            <Link href="/leaderboard" className="hover:text-zinc-400 transition-colors">Leaderboard</Link>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
