'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import { TrendingUp, BarChart3, Newspaper, Trophy, User, Globe2, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

const navLinks = [
  { href: '/market', label: 'Market', icon: TrendingUp },
  { href: '/portfolio', label: 'Portfolio', icon: BarChart3 },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

interface NavbarProps {
  profile?: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-black/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Terra Tethers
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: balance + avatar */}
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
              <span className="text-xs text-zinc-500">Balance</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(profile.balance)}
              </span>
            </div>
          )}
          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white"
              >
                {profile.username[0].toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-3 py-1.5 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-zinc-800/60 bg-black">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-all',
              pathname === href ? 'text-white' : 'text-zinc-600'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
    </header>
  )
}
