import axios from 'axios'

const FAUCETPAY_API_URL = 'https://faucetpay.io/api/v1'
const FAUCETPAY_API_KEY = process.env.FAUCETPAY_API_KEY!

interface FaucetPayResponse {
  status: number
  message: string
  payout_id?: number
  payout_user_hash?: string
  balance?: number
}

const CURRENCY_MAP: Record<string, string> = {
  BTC: 'BTC',
  LTC: 'LTC',
  DOGE: 'DOGE',
}

export async function sendPayment(
  address: string,
  amount: number,
  currency: string
): Promise<{ success: boolean; message: string; payoutId?: number }> {
  try {
    const currencyCode = CURRENCY_MAP[currency]
    if (!currencyCode) return { success: false, message: 'Unsupported currency' }

    const amountInSatoshi = Math.round(amount * 1e8)
    const params = new URLSearchParams()
    params.append('api_key', FAUCETPAY_API_KEY)
    params.append('to', address)
    params.append('amount', amountInSatoshi.toString())
    params.append('currency', currencyCode)
    params.append('referral', 'true')

    const response = await axios.post<FaucetPayResponse>(
      `${FAUCETPAY_API_URL}/send`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    if (response.data.status === 200) {
      return { success: true, message: response.data.message, payoutId: response.data.payout_id }
    }

    return { success: false, message: response.data.message }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return { success: false, message: error.response?.data?.message || 'Payment failed' }
  }
}

export async function checkBalance(
  currency: string
): Promise<{ success: boolean; balance?: number; message?: string }> {
  try {
    const params = new URLSearchParams()
    params.append('api_key', FAUCETPAY_API_KEY)
    params.append('currency', currency)

    const response = await axios.post<FaucetPayResponse>(
      `${FAUCETPAY_API_URL}/balance`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    if (response.data.status === 200) {
      return { success: true, balance: (response.data.balance || 0) / 1e8 }
    }

    return { success: false, message: response.data.message }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return { success: false, message: error.response?.data?.message || 'Failed to check balance' }
  }
}

export async function checkAddress(
  address: string,
  currency: string
): Promise<{ valid: boolean; message?: string }> {
  try {
    const params = new URLSearchParams()
    params.append('api_key', FAUCETPAY_API_KEY)
    params.append('address', address)
    params.append('currency', currency)

    const response = await axios.post<FaucetPayResponse>(
      `${FAUCETPAY_API_URL}/checkaddress`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    return { valid: response.data.status === 200 }
  } catch {
    return { valid: false, message: 'Address check failed' }
  }
}

export const MIN_WITHDRAWAL: Record<string, number> = {
  BTC: 0.00000100,
  LTC: 0.00000100,
  DOGE: 0.00100000,
}
