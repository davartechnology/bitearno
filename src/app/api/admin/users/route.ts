import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('users')
      .select('id, email, username, balanceBtc, balanceLtc, balanceDoge, xp, level, isBanned, isSuspended, isVerified, lastIp, createdAt, lastLoginAt', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: users, count } = await query

    const usersWithCounts = await Promise.all(
      (users || []).map(async (user: any) => {
        const { count: claimsCount } = await supabaseAdmin
          .from('claims').select('*', { count: 'exact', head: true })
          .eq('userId', user.id)
        const { count: withdrawalsCount } = await supabaseAdmin
          .from('withdrawals').select('*', { count: 'exact', head: true })
          .eq('userId', user.id)
        return {
          ...user,
          _count: {
            claims: claimsCount || 0,
            withdrawals: withdrawalsCount || 0,
          },
        }
      })
    )

    return NextResponse.json({
      users: usersWithCounts,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
