import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: shortlinks } = await supabaseAdmin
      .from('shortlinks')
      .select('*')
      .eq('isActive', true)
      .order('reward', { ascending: false })

    const { data: visits } = await supabaseAdmin
      .from('shortlink_visits')
      .select('shortlinkId')
      .eq('userId', session.user.id)
      .eq('completed', true)

    const completedIds = new Set((visits || []).map((v: any) => v.shortlinkId))

    const result = (shortlinks || []).map((link: any) => ({
      ...link,
      completed: completedIds.has(link.id),
    }))

    return NextResponse.json({ shortlinks: result })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
