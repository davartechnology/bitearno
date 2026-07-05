'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowDownToLine, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatCrypto, formatDate } from '@/lib/utils'

const CURRENCIES = ['BTC', 'LTC', 'DOGE']

const MIN_WITHDRAWAL: Record<string, number> = {
  BTC: 0.00000100,
  LTC: 0.00000100,
  DOGE: 0.00100000,
}

export default function WithdrawPage() {
  const [balances, setBalances] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    currency: 'BTC',
    address: '',
    amount: '',
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/withdraw')
      setBalances(res.data.balances)
      setWithdrawals(res.data.withdrawals)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getBalance = () => {
    if (!balances) return 0
    const map: Record<string, number> = {
      BTC: balances.balanceBtc,
      LTC: balances.balanceLtc,
      DOGE: balances.balanceDoge,
    }
    return map[form.currency] || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    setError(null)

    try {
      const res = await axios.post('/api/withdraw', {
        address: form.address,
        amount: parseFloat(form.amount),
        currency: form.currency,
      })
      setSuccess(res.data.message)
      setForm({ ...form, address: '', amount: '' })
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle size={16} className="text-green-400" />
    if (status === 'rejected') return <XCircle size={16} className="text-red-400" />
    return <Clock size={16} className="text-yellow-400" />
  }

  const statusColor = (status: string) => {
    if (status === 'approved') return 'text-green-400'
    if (status === 'rejected') return 'text-red-400'
    return 'text-yellow-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowDownToLine className="text-yellow-400" size={24} />
          Withdraw
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Send your earnings to FaucetPay instantly
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-3">
        {CURRENCIES.map((cur) => {
          const balMap: Record<string, number> = {
            BTC: balances?.balanceBtc || 0,
            LTC: balances?.balanceLtc || 0,
            DOGE: balances?.balanceDoge || 0,
          }
          return (
            <div
              key={cur}
              onClick={() => setForm({ ...form, currency: cur })}
              className={`bg-gray-900 rounded-xl border p-3 text-center cursor-pointer transition ${
                form.currency === cur
                  ? 'border-yellow-400/50 bg-yellow-400/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <p className="text-gray-400 text-xs">{cur}</p>
              <p className="text-white font-bold text-sm mt-1">
                {balMap[cur].toFixed(8)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Withdraw Form */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-5">New Withdrawal</h2>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-5 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Currency</label>
            <div className="flex gap-2">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setForm({ ...form, currency: cur })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                    form.currency === cur
                      ? 'bg-yellow-400 text-gray-950'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              FaucetPay Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition text-sm"
              placeholder="Your FaucetPay registered address"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-400 text-sm">Amount</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, amount: getBalance().toFixed(8) })}
                className="text-yellow-400 text-xs hover:underline"
              >
                Max: {formatCrypto(getBalance(), form.currency)}
              </button>
            </div>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              step="0.00000001"
              min={MIN_WITHDRAWAL[form.currency]}
              max={getBalance()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition text-sm"
              placeholder={`Min: ${MIN_WITHDRAWAL[form.currency].toFixed(8)}`}
            />
            <p className="text-gray-600 text-xs mt-1">
              Minimum: {formatCrypto(MIN_WITHDRAWAL[form.currency], form.currency)}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || getBalance() < MIN_WITHDRAWAL[form.currency]}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : `Withdraw ${form.currency}`}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4">Withdrawal History</h2>

        {withdrawals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No withdrawals yet
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {statusIcon(w.status)}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {formatCrypto(w.amount, w.currency)}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {formatDate(new Date(w.createdAt))}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium capitalize ${statusColor(w.status)}`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
        <p className="text-gray-400 text-sm font-medium">⚠️ Important</p>
        <ul className="text-gray-500 text-sm space-y-1">
          <li>• Address must be registered on FaucetPay</li>
          <li>• Payments are instant via FaucetPay</li>
          <li>• Double check your address before withdrawing</li>
        </ul>
      </div>

    </div>
  )
}
