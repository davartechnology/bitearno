import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: flags } = await supabaseAdmin
      .from('fraud_flags')
      .select('*')
      .order('flaggedAt', { ascending: false })
      .limit(50)

    const userIds = Array.from(new Set((flags || []).map((f: { userId: string }) => f.userId)))
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
      .in('id', userIds)

    const usersById = Object.fromEntries((users || []).map((u: { id: string; username: string; email: string }) => [u.id, u]))

    const flagsWithUser = (flags || []).map((f: Record<string, unknown> & { userId: string }) => ({
      ...f,
      user: usersById[f.userId as string] || { username: 'Unknown', email: '' },
    }))

    return NextResponse.json({ flags: flagsWithUser })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
