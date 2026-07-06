import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { shortlinkId } = await req.json()
    if (!shortlinkId) return NextResponse.json({ error: 'Missing shortlinkId' }, { status: 400 })

    const { data: shortlink } = await supabaseAdmin
      .from('shortlinks')
      .select('*')
      .eq('id', shortlinkId)
      .single()

    if (!shortlink || !shortlink.isActive) {
      return NextResponse.json({ error: 'Shortlink not found' }, { status: 404 })
    }

    const { data: alreadyCompleted } = await supabaseAdmin
      .from('shortlink_visits')
      .select('id')
      .eq('userId', session.user.id)
      .eq('shortlinkId', shortlinkId)
      .eq('completed', true)
      .single()

    if (alreadyCompleted) {
      return NextResponse.json({ error: 'Already completed' }, { status: 429 })
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    await supabaseAdmin.from('shortlink_visits').insert({
      id: crypto.randomUUID(),
      userId: session.user.id,
      shortlinkId,
      ipAddress,
      completed: true,
      visitedAt: new Date().toISOString(),
    })

    await supabaseAdmin.from('shortlinks').update({
      totalVisits: (shortlink.totalVisits || 0) + 1,
    }).eq('id', shortlinkId)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balanceBtc, balanceLtc, balanceDoge, xp, referredBy')
      .eq('id', session.user.id)
      .single()

    if (user) {
      await supabaseAdmin.from('users').update({
        balanceBtc: shortlink.currency === 'BTC' ? (user.balanceBtc || 0) + shortlink.reward : user.balanceBtc,
        balanceLtc: shortlink.currency === 'LTC' ? (user.balanceLtc || 0) + shortlink.reward : user.balanceLtc,
        balanceDoge: shortlink.currency === 'DOGE' ? (user.balanceDoge || 0) + shortlink.reward : user.balanceDoge,
        xp: (user.xp || 0) + 5,
        updatedAt: new Date().toISOString(),
      }).eq('id', session.user.id)

      if (user.referredBy) {
        const referralBonus = Math.round(shortlink.reward * 0.2 * 1e8) / 1e8
        await supabaseAdmin.from('referral_earnings').insert({
          id: crypto.randomUUID(),
          referrerId: user.referredBy,
          referredId: session.user.id,
          amount: referralBonus,
          currency: shortlink.currency,
          source: 'shortlink',
          createdAt: new Date().toISOString(),
        })
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('balanceBtc, balanceLtc, balanceDoge')
          .eq('id', user.referredBy)
          .single()
        if (referrer) {
          await supabaseAdmin.from('users').update({
            balanceBtc: shortlink.currency === 'BTC' ? (referrer.balanceBtc || 0) + referralBonus : referrer.balanceBtc,
            balanceLtc: shortlink.currency === 'LTC' ? (referrer.balanceLtc || 0) + referralBonus : referrer.balanceLtc,
            balanceDoge: shortlink.currency === 'DOGE' ? (referrer.balanceDoge || 0) + referralBonus : referrer.balanceDoge,
            updatedAt: new Date().toISOString(),
          }).eq('id', user.referredBy)
        }
      }
    }

    return NextResponse.json({
      success: true,
      reward: shortlink.reward,
      currency: shortlink.currency,
      message: `You earned ${shortlink.reward.toFixed(8)} ${shortlink.currency}!`,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
