import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { shortenUrl, SHORTLINK_PROVIDERS } from '@/lib/shortlink-providers'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url, provider } = await req.json()

    if (!url || !provider) {
      return NextResponse.json({ error: 'Missing url or provider' }, { status: 400 })
    }

    if (!SHORTLINK_PROVIDERS[provider as keyof typeof SHORTLINK_PROVIDERS]) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const shortenedUrl = await shortenUrl(url, provider as keyof typeof SHORTLINK_PROVIDERS)

    return NextResponse.json({ shortenedUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
