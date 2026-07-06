import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
      .eq('id', session.user.id)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      userId: user.id,
      offers: [
        {
          id: 'cpx',
          name: 'CPX Research',
          description: 'Complete surveys and earn crypto',
          icon: '📊',
          color: 'blue',
          url: `https://offers.cpx-research.com/index.php?app_id=YOUR_CPX_APP_ID&ext_user_id=${user.id}&username=${user.username}&email=${user.email}`,
          type: 'surveys',
        },
        {
          id: 'adgate',
          name: 'AdGate Media',
          description: 'Install apps, watch videos & more',
          icon: '🎯',
          color: 'green',
          url: `https://wall.adgaterewards.com/YOUR_ADGATE_ID/${user.id}`,
          type: 'tasks',
        },
        {
          id: 'offertoro',
          name: 'OfferToro',
          description: 'Complete offers and missions',
          icon: '🏆',
          color: 'purple',
          url: `https://www.offertoro.com/ifr/show/YOUR_OFFERTORO_ID/${user.id}/9999`,
          type: 'offers',
        },
      ],
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
