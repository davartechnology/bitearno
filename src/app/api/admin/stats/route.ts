import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const { count: totalUsers } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })

    const { count: activeUsers24h } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })
      .gte('lastLoginAt', last24h.toISOString())

    const { count: totalClaims } = await supabaseAdmin
      .from('claims').select('*', { count: 'exact', head: true })

    const { count: claimsToday } = await supabaseAdmin
      .from('claims').select('*', { count: 'exact', head: true })
      .gte('claimedAt', today.toISOString())

    const { count: totalWithdrawals } = await supabaseAdmin
      .from('withdrawals').select('*', { count: 'exact', head: true })

    const { count: pendingWithdrawals } = await supabaseAdmin
      .from('withdrawals').select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: unresolvedFlags } = await supabaseAdmin
      .from('fraud_flags').select('*', { count: 'exact', head: true })
      .eq('resolved', false)

    const { data: approvedWithdrawals } = await supabaseAdmin
      .from('withdrawals').select('amount')
      .eq('status', 'approved')

    const totalPayouts = (approvedWithdrawals || []).reduce(
      (sum: number, w: Record<string, unknown>) => sum + Number((w.amount as number | undefined) || 0), 0
    )

    const { data: recentClaims } = await supabaseAdmin
      .from('claims')
      .select('id, amount, currency, claimedAt, userId')
      .order('claimedAt', { ascending: false })
      .limit(5)

    const { data: recentWithdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('id, amount, currency, status, createdAt, userId')
      .order('createdAt', { ascending: false })
      .limit(5)

    const { data: recentUsers } = await supabaseAdmin
      .from('users')
      .select('id, username, email, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    const userIds = Array.from(new Set([
        ...(recentClaims || []).map((c: Record<string, unknown>) => c.userId as string),
        ...(recentWithdrawals || []).map((w: Record<string, unknown>) => w.userId as string),
      ]))

    const { data: usersMap } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .in('id', userIds)

    const usersById = Object.fromEntries((usersMap || []).map((u: { id: string; username: string }) => [u.id, u]))

    const claimsWithUser = (recentClaims || []).map((c: Record<string, unknown> & { userId?: string }) => ({
      ...c,
      user: usersById[c.userId as string] || { username: 'Unknown' },
    }))

    const withdrawalsWithUser = (recentWithdrawals || []).map((w: Record<string, unknown> & { userId?: string }) => ({
      ...w,
      user: usersById[w.userId as string] || { username: 'Unknown' },
    }))

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers24h: activeUsers24h || 0,
        totalClaims: totalClaims || 0,
        claimsToday: claimsToday || 0,
        totalWithdrawals: totalWithdrawals || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        unresolvedFlags: unresolvedFlags || 0,
        totalPayouts,
      },
      recentClaims: claimsWithUser,
      recentWithdrawals: withdrawalsWithUser,
      recentUsers: recentUsers || [],
    })
  } catch {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
