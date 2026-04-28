import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const { data: news, error } = await supabase
      .from('news_events')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ news: news ?? [] })
  } catch (err) {
    console.error('[GET /api/news]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
