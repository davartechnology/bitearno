'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Gift, Flame, CheckCircle } from 'lucide-react'
import { formatCrypto } from '@/lib/utils'

export default function DailyBonus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/faucet/daily')
      setStatus(res.data)
      setSecondsLeft(res.data.secondsLeft || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          fetchStatus()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleClaim = async () => {
    setClaiming(true)
    setMessage(null)
    setError(null)
    try {
      const res = await axios.post('/api/faucet/daily')
      setMessage(res.data.message)
      setStatus((prev: any) => ({
        ...prev,
        canClaim: false,
        streak: res.data.streak,
      }))
      setSecondsLeft(24 * 60 * 60)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Something went wrong')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return null

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-purple-400" />
          <span className="text-white font-medium">Daily Bonus</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Flame size={16} />
          <span className="text-sm font-bold">{status?.streak || 0} day streak</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Today&apos;s reward</p>
          <p className="text-yellow-400 font-bold mt-1">
            {formatCrypto(status?.nextReward || 0, 'BTC')}
          </p>
        </div>

        {status?.canClaim ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim Daily'}
          </button>
        ) : (
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Claimed</span>
            </div>
            {secondsLeft > 0 && (
              <p className="text-gray-500 text-xs font-mono">
                Next in {formatTime(secondsLeft)}
              </p>
            )}
          </div>
        )}
      </div>

      {message && (
        <p className="text-green-400 text-sm mt-3 text-center">{message}</p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  )
}
