import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: logs } = await supabaseAdmin
      .from('admin_logs')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(100)

    const userIds = Array.from(new Set((logs || []).filter((l: any) => l.targetUserId).map((l: any) => l.targetUserId)))

    let usersById: any = {}
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users').select('id, username, email').in('id', userIds)
      usersById = Object.fromEntries((users || []).map((u: any) => [u.id, u]))
    }

    const logsWithUser = (logs || []).map((l: any) => ({
      ...l,
      targetUser: l.targetUserId ? usersById[l.targetUserId] || null : null,
    }))

    return NextResponse.json({ logs: logsWithUser })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
