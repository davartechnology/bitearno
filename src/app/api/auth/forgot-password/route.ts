import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json())

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomUUID()
    const expiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })

    await sendResetEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
