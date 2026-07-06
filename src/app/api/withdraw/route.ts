import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPayment, checkAddress, MIN_WITHDRAWAL } from '@/lib/faucetpay'
import { z } from 'zod'

const withdrawSchema = z.object({
  address: z.string().min(10),
  amount: z.number().positive(),
  currency: z.enum(['BTC', 'LTC', 'DOGE']),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { address, amount, currency } = withdrawSchema.parse(body)

    const minAmount = MIN_WITHDRAWAL[currency]
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${minAmount.toFixed(8)} ${currency}` },
        { status: 400 }
      )
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balanceBtc, balanceLtc, balanceDoge')
      .eq('id', session.user.id)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const balanceMap: Record<string, number> = {
      BTC: user.balanceBtc || 0,
      LTC: user.balanceLtc || 0,
      DOGE: user.balanceDoge || 0,
    }

    if (balanceMap[currency] < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const addressCheck = await checkAddress(address, currency)
    if (!addressCheck.valid) {
      return NextResponse.json(
        { error: 'Invalid FaucetPay address.' },
        { status: 400 }
      )
    }

    const withdrawalId = crypto.randomUUID()
    await supabaseAdmin.from('withdrawals').insert({
      id: withdrawalId,
      userId: session.user.id,
      amount,
      currency,
      address,
      status: 'pending',
      fee: 0,
      createdAt: new Date().toISOString(),
    })

    await supabaseAdmin.from('users').update({
      balanceBtc: currency === 'BTC' ? (user.balanceBtc || 0) - amount : user.balanceBtc,
      balanceLtc: currency === 'LTC' ? (user.balanceLtc || 0) - amount : user.balanceLtc,
      balanceDoge: currency === 'DOGE' ? (user.balanceDoge || 0) - amount : user.balanceDoge,
      updatedAt: new Date().toISOString(),
    }).eq('id', session.user.id)

    const payment = await sendPayment(address, amount, currency)

    if (payment.success) {
      await supabaseAdmin.from('withdrawals').update({
        status: 'approved',
        txHash: payment.payoutId?.toString(),
        processedAt: new Date().toISOString(),
      }).eq('id', withdrawalId)

      return NextResponse.json({
        success: true,
        message: `Successfully sent ${amount.toFixed(8)} ${currency} to your FaucetPay account!`,
      })
    } else {
      await supabaseAdmin.from('withdrawals').update({ status: 'rejected' }).eq('id', withdrawalId)

      await supabaseAdmin.from('users').update({
        balanceBtc: currency === 'BTC' ? (user.balanceBtc || 0) : user.balanceBtc,
        balanceLtc: currency === 'LTC' ? (user.balanceLtc || 0) : user.balanceLtc,
        balanceDoge: currency === 'DOGE' ? (user.balanceDoge || 0) : user.balanceDoge,
        updatedAt: new Date().toISOString(),
      }).eq('id', session.user.id)

      return NextResponse.json({ error: `Payment failed: ${payment.message}` }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })
      .limit(20)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balanceBtc, balanceLtc, balanceDoge')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({ withdrawals: withdrawals || [], balances: user })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
