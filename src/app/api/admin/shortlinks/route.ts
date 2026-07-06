import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: shortlinks } = await supabaseAdmin
      .from('shortlinks')
      .select('*')
      .order('createdAt', { ascending: false })

    return NextResponse.json({ shortlinks: shortlinks || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

const shortlinkSchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
  reward: z.number().positive(),
  currency: z.enum(['BTC', 'LTC', 'DOGE']),
  isActive: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = shortlinkSchema.parse(await req.json())

    const { data: shortlink } = await supabaseAdmin
      .from('shortlinks')
      .insert({
        id: crypto.randomUUID(),
        ...body,
        isActive: body.isActive ?? true,
        totalVisits: 0,
        visitsRequired: 1,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single()

    return NextResponse.json({ success: true, shortlink })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()

    await supabaseAdmin
      .from('shortlinks')
      .update({ isActive: false })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
