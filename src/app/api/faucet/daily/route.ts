import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function getDailyReward(streak: number): number {
  const base = 0.00000100
  const bonus = Math.min(streak, 30) * 0.00000010
  return Math.round((base + bonus) * 1e8) / 1e8
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: daily } = await supabaseAdmin
      .from('daily_bonuses')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    const streak = daily?.streak || 0
    let canClaim = true
    let secondsLeft = 0

    if (daily?.lastClaim) {
      const lastClaim = new Date(daily.lastClaim)
      const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
      const now = new Date()
      if (now < nextClaim) {
        canClaim = false
        secondsLeft = Math.ceil((nextClaim.getTime() - now.getTime()) / 1000)
      }
    }

    return NextResponse.json({
      canClaim,
      secondsLeft,
      streak,
      nextReward: getDailyReward(streak),
      currency: 'BTC',
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: daily } = await supabaseAdmin
      .from('daily_bonuses')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    const now = new Date()

    if (daily?.lastClaim) {
      const lastClaim = new Date(daily.lastClaim)
      const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
      if (now < nextClaim) {
        const secondsLeft = Math.ceil((nextClaim.getTime() - now.getTime()) / 1000)
        return NextResponse.json(
          { error: 'Already claimed', secondsLeft },
          { status: 429 }
        )
      }
    }

    const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    let newStreak = 1
    if (daily?.lastClaim && new Date(daily.lastClaim) > last48h) {
      newStreak = (daily.streak || 0) + 1
    }

    const reward = getDailyReward(newStreak - 1)

    await supabaseAdmin
      .from('daily_bonuses')
      .update({
        streak: newStreak,
        lastClaim: now.toISOString(),
      })
      .eq('userId', session.user.id)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balanceBtc, xp')
      .eq('id', session.user.id)
      .single()

    if (user) {
      await supabaseAdmin.from('users').update({
        balanceBtc: (user.balanceBtc || 0) + reward,
        xp: (user.xp || 0) + 25,
        updatedAt: now.toISOString(),
      }).eq('id', session.user.id)
    }

    return NextResponse.json({
      success: true,
      reward,
      streak: newStreak,
      currency: 'BTC',
      message: `Daily bonus claimed! +${reward.toFixed(8)} BTC 🎉`,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
