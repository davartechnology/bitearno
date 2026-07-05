import { getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { authorized: false, reason: 'Not authenticated' }
  }

  if (!session.user.isAdmin) {
    return { authorized: false, reason: 'Not authorized' }
  }

  return { authorized: true, session }
}
