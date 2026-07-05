import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: config } = await supabaseAdmin
      .from('faucet_config').select('*').single()

    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

const configSchema = z.object({
  rewardMin: z.number().positive(),
  rewardMax: z.number().positive(),
  timerMinutes: z.number().int().positive(),
  currency: z.enum(['BTC', 'LTC', 'DOGE']),
  isActive: z.boolean(),
})

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = configSchema.parse(await req.json())

    const { data: config } = await supabaseAdmin
      .from('faucet_config').select('id').single()

    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 })

    await supabaseAdmin.from('faucet_config').update({
      ...body,
      updatedAt: new Date().toISOString(),
    }).eq('id', config.id)

    await supabaseAdmin.from('admin_logs').insert({
      id: crypto.randomUUID(),
      adminId: auth.session!.user.id,
      action: 'update_faucet_config',
      details: JSON.stringify(body),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
