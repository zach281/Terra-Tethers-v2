import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const [profileRes, referralsRes] = await Promise.all([
      service.from('profiles').select('referral_code').eq('id', user.id).single(),
      service
        .from('referrals')
        .select('*, referred:profiles!referred_id(username, created_at)')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      referral_code: profileRes.data?.referral_code,
      referrals: referralsRes.data ?? [],
    })
  } catch (err) {
    console.error('[GET /api/referrals]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { referral_code } = await req.json()
    if (!referral_code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()

    // Find referrer
    const { data: referrer } = await service
      .from('profiles')
      .select('id')
      .eq('referral_code', referral_code.toLowerCase())
      .single()

    if (!referrer || referrer.id === user.id) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Check if already referred
    const { data: existing } = await service
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already referred' }, { status: 400 })
    }

    // Create referral
    await service.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      bonus_amount: 500,
      bonus_paid: true,
    })

    // Pay bonuses: $500 to referrer, $500 to referred
    await Promise.all([
      service.rpc('increment_balance', { user_id: referrer.id, amount: 500 }),
      service.rpc('increment_balance', { user_id: user.id, amount: 500 }),
    ])

    return NextResponse.json({ success: true, bonus: 500 })
  } catch (err) {
    console.error('[POST /api/referrals]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
