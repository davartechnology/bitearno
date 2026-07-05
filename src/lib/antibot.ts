import { supabaseAdmin } from '@/lib/supabase'

export async function checkClaimEligibility(
  userId: string,
  ipAddress: string
): Promise<{ eligible: boolean; minutesLeft?: number; reason?: string }> {

  const { data: config } = await supabaseAdmin
    .from('faucet_config')
    .select('*')
    .single()

  if (!config || !config.isActive) {
    return { eligible: false, reason: 'Faucet is currently disabled' }
  }

  const timerMinutes = config.timerMinutes

  const { data: lastClaim } = await supabaseAdmin
    .from('claims')
    .select('claimedAt')
    .eq('userId', userId)
    .order('claimedAt', { ascending: false })
    .limit(1)
    .single()

  if (lastClaim) {
    const nextClaim = new Date(new Date(lastClaim.claimedAt + 'Z').getTime() + timerMinutes * 60 * 1000)
    const now = new Date()
    if (now < nextClaim) {
      const minutesLeft = Math.ceil((nextClaim.getTime() - now.getTime()) / 60000)
      return { eligible: false, minutesLeft, reason: 'Timer not finished' }
    }
  }

  const since = new Date(Date.now() - timerMinutes * 60 * 1000).toISOString()
  const { data: recentIpClaim } = await supabaseAdmin
    .from('claims')
    .select('id')
    .eq('ipAddress', ipAddress)
    .neq('userId', userId)
    .gte('claimedAt', since)
    .limit(1)
    .single()

  if (recentIpClaim) {
    await supabaseAdmin.from('fraud_flags').insert({
      id: crypto.randomUUID(),
      userId,
      reason: 'Multiple accounts from same IP',
      ipAddress,
      resolved: false,
      flaggedAt: new Date().toISOString(),
    })
    return { eligible: false, reason: 'IP already used recently' }
  }

  return { eligible: true }
}

export function generateReward(min: number, max: number): number {
  const reward = Math.random() * (max - min) + min
  return Math.round(reward * 1e8) / 1e8
}
