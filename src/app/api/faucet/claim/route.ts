import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { checkClaimEligibility, generateReward } from '@/lib/antibot'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'

    const eligibility = await checkClaimEligibility(session.user.id, ipAddress)
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason, minutesLeft: eligibility.minutesLeft },
        { status: 429 }
      )
    }

    const { data: config } = await supabaseAdmin
      .from('faucet_config')
      .select('*')
      .single()

    if (!config) return NextResponse.json({ error: 'Faucet not configured' }, { status: 500 })

    const reward = generateReward(config.rewardMin, config.rewardMax)
    const currency = config.currency
    const xpGained = 10

    await supabaseAdmin.from('claims').insert({
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: reward,
      currency,
      ipAddress,
      userAgent: req.headers.get('user-agent') || '',
      claimedAt: new Date().toISOString(),
    })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balanceBtc, balanceLtc, balanceDoge, xp, referredBy')
      .eq('id', session.user.id)
      .single()

    if (user) {
      await supabaseAdmin.from('users').update({
        balanceBtc: currency === 'BTC' ? (user.balanceBtc || 0) + reward : user.balanceBtc,
        balanceLtc: currency === 'LTC' ? (user.balanceLtc || 0) + reward : user.balanceLtc,
        balanceDoge: currency === 'DOGE' ? (user.balanceDoge || 0) + reward : user.balanceDoge,
        xp: (user.xp || 0) + xpGained,
        lastIp: ipAddress,
        updatedAt: new Date().toISOString(),
      }).eq('id', session.user.id)

      if (user.referredBy) {
        const referralBonus = Math.round(reward * 0.2 * 1e8) / 1e8
        await supabaseAdmin.from('referral_earnings').insert({
          id: crypto.randomUUID(),
          referrerId: user.referredBy,
          referredId: session.user.id,
          amount: referralBonus,
          currency,
          source: 'faucet_claim',
          createdAt: new Date().toISOString(),
        })
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('balanceBtc, balanceLtc, balanceDoge')
          .eq('id', user.referredBy)
          .single()
        if (referrer) {
          await supabaseAdmin.from('users').update({
            balanceBtc: currency === 'BTC' ? (referrer.balanceBtc || 0) + referralBonus : referrer.balanceBtc,
            balanceLtc: currency === 'LTC' ? (referrer.balanceLtc || 0) + referralBonus : referrer.balanceLtc,
            balanceDoge: currency === 'DOGE' ? (referrer.balanceDoge || 0) + referralBonus : referrer.balanceDoge,
            updatedAt: new Date().toISOString(),
          }).eq('id', user.referredBy)
        }
      }
    }

    return NextResponse.json({
      success: true,
      reward,
      currency,
      xpGained,
      message: `You earned ${reward.toFixed(8)} ${currency}!`,
    })
  } catch (error) {
    console.error('Claim error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: config } = await supabaseAdmin
      .from('faucet_config')
      .select('*')
      .single()

    if (!config) return NextResponse.json({ error: 'Faucet not configured' }, { status: 500 })

    console.log('Faucet config:', config)

    const { data: lastClaim } = await supabaseAdmin
      .from('claims')
      .select('claimedAt')
      .eq('userId', session.user.id)
      .order('claimedAt', { ascending: false })
      .limit(1)
      .single()

    console.log('Last claim:', lastClaim)

    let secondsLeft = 0
    if (lastClaim) {
      const claimedAt = new Date(lastClaim.claimedAt + 'Z')
      const nextClaim = new Date(
        claimedAt.getTime() + config.timerMinutes * 60 * 1000
      )
      const now = new Date()
      if (now < nextClaim) {
        secondsLeft = Math.ceil((nextClaim.getTime() - now.getTime()) / 1000)
      }
    }

    console.log('Seconds left:', secondsLeft)

    return NextResponse.json({
      secondsLeft,
      rewardMin: config.rewardMin,
      rewardMax: config.rewardMax,
      currency: config.currency,
      timerMinutes: config.timerMinutes,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
