import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const actionSchema = z.object({
  action: z.enum(['ban', 'unban', 'suspend', 'unsuspend', 'reset_balance']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = actionSchema.parse(await req.json())
    const userId = params.id

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (action === 'ban') updateData.isBanned = true
    if (action === 'unban') updateData.isBanned = false
    if (action === 'suspend') updateData.isSuspended = true
    if (action === 'unsuspend') updateData.isSuspended = false
    if (action === 'reset_balance') {
      updateData.balanceBtc = 0
      updateData.balanceLtc = 0
      updateData.balanceDoge = 0
    }

    await supabaseAdmin.from('users').update(updateData).eq('id', userId)

    await supabaseAdmin.from('admin_logs').insert({
      id: crypto.randomUUID(),
      adminId: auth.session!.user.id,
      action,
      targetUserId: userId,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
