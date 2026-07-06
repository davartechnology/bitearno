import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    let query = supabaseAdmin
      .from('withdrawals')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50)

    if (status !== 'all') query = query.eq('status', status)

    const { data: withdrawals } = await query

    const userIds = Array.from(new Set((withdrawals || []).map((w: { userId: string }) => w.userId)))
    const { data: users } = await supabaseAdmin
      .from('users').select('id, username, email').in('id', userIds)

    const usersById = Object.fromEntries((users || []).map((u: { id: string; username: string; email: string }) => [u.id, u]))

    const withdrawalsWithUser = (withdrawals || []).map((w: Record<string, unknown> & { userId: string }) => ({
      ...w,
      user: usersById[w.userId] || { username: 'Unknown', email: '' },
    }))

    return NextResponse.json({ withdrawals: withdrawalsWithUser })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
