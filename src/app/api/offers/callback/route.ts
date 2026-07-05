import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')
    const userId = searchParams.get('user_id')
    const amount = parseFloat(searchParams.get('amount') || '0')
    const transId = searchParams.get('trans_id')

    if (!provider || !userId || !amount || !transId) {
      return new NextResponse('Missing parameters', { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('users').select('id, balanceBtc, xp, referredBy').eq('id', userId).single()

    if (!user) return new NextResponse('User not found', { status: 404 })

    const rewardBtc = Math.round((amount * 0.00000100) * 1e8) / 1e8

    await supabaseAdmin.from('users').update({
      balanceBtc: (user.balanceBtc || 0) + rewardBtc,
      xp: (user.xp || 0) + 50,
      updatedAt: new Date().toISOString(),
    }).eq('id', userId)

    await supabaseAdmin.from('claims').insert({
      id: crypto.randomUUID(),
      userId,
      amount: rewardBtc,
      currency: 'BTC',
      userAgent: `offerwall:${provider}:${transId}`,
      claimedAt: new Date().toISOString(),
    })

    if (user.referredBy) {
      const referralBonus = Math.round(rewardBtc * 0.2 * 1e8) / 1e8
      await supabaseAdmin.from('referral_earnings').insert({
        id: crypto.randomUUID(),
        referrerId: user.referredBy,
        referredId: userId,
        amount: referralBonus,
        currency: 'BTC',
        source: `offerwall_${provider}`,
        createdAt: new Date().toISOString(),
      })
      const { data: referrer } = await supabaseAdmin
        .from('users').select('balanceBtc').eq('id', user.referredBy).single()
      if (referrer) {
        await supabaseAdmin.from('users').update({
          balanceBtc: (referrer.balanceBtc || 0) + referralBonus,
          updatedAt: new Date().toISOString(),
        }).eq('id', user.referredBy)
      }
    }

    return new NextResponse('1', { status: 200 })
  } catch (error) {
    return new NextResponse('ERROR', { status: 500 })
  }
}
