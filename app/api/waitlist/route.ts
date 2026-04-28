import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, referral_code } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, position')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ already_registered: true, position: existing.position })
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    const position = (count ?? 0) + 1

    await supabase.from('waitlist').insert({
      email: email.toLowerCase(),
      referral_code: referral_code ?? null,
      position,
    })

    return NextResponse.json({ success: true, position })
  } catch (err) {
    console.error('[POST /api/waitlist]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
