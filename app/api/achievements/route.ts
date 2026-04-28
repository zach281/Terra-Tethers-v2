import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkAchievements } from '@/lib/achievements'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const [userAchRes, allAchRes] = await Promise.all([
      service
        .from('user_achievements')
        .select('*, achievement:achievement_definitions(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false }),
      service.from('achievement_definitions').select('*').order('points', { ascending: false }),
    ])

    return NextResponse.json({
      earned: userAchRes.data ?? [],
      all: allAchRes.data ?? [],
    })
  } catch (err) {
    console.error('[GET /api/achievements]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const [profileRes, tradesRes, holdingsRes, achRes, referralsRes] = await Promise.all([
      service.from('profiles').select('*').eq('id', user.id).single(),
      service.from('trades').select('*').eq('user_id', user.id),
      service.from('holdings').select('*, coin:coins(current_price)').eq('user_id', user.id).gt('quantity', 0),
      service.from('user_achievements').select('achievement_id').eq('user_id', user.id),
      service.from('referrals').select('id').eq('referrer_id', user.id),
    ])

    const profile = profileRes.data
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const holdings = (holdingsRes.data ?? []).map(h => {
      const coinData = h.coin as { current_price: number } | null
      return { ...h, current_value: h.quantity * (coinData?.current_price ?? 0) }
    })
    const totalHoldingsValue = holdings.reduce((s, h) => s + h.current_value, 0)
    const portfolioValue = profile.balance + totalHoldingsValue
    const existingIds = (achRes.data ?? []).map(a => a.achievement_id)

    const newIds = checkAchievements({
      profile,
      trades: tradesRes.data ?? [],
      holdings: holdingsRes.data ?? [],
      portfolioValue,
      existingAchievements: existingIds,
      referralCount: referralsRes.data?.length ?? 0,
    })

    if (newIds.length > 0) {
      await service.from('user_achievements').insert(
        newIds.map(id => ({ user_id: user.id, achievement_id: id }))
      )
    }

    const { data: newAchievements } = await service
      .from('achievement_definitions')
      .select('*')
      .in('id', newIds)

    return NextResponse.json({ new_achievements: newAchievements ?? [], count: newIds.length })
  } catch (err) {
    console.error('[POST /api/achievements]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
