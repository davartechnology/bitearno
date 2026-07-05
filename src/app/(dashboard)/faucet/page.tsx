'use client'

import { useEffect, useState, useCallback } from 'react'
import { Zap, Clock, Trophy, Info } from 'lucide-react'
import axios from 'axios'
import { formatCrypto } from '@/lib/utils'

export default function FaucetPage() {
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [rewardMin, setRewardMin] = useState(0)
  const [rewardMax, setRewardMax] = useState(0)
  const [currency, setCurrency] = useState('BTC')
  const [timerMinutes, setTimerMinutes] = useState(60)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [lastReward, setLastReward] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get('/api/faucet/claim')
      setSecondsLeft(res.data.secondsLeft)
      setRewardMin(res.data.rewardMin)
      setRewardMax(res.data.rewardMax)
      setCurrency(res.data.currency)
      setTimerMinutes(res.data.timerMinutes)
    } catch {
      setError('Failed to load faucet status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
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
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  }

  const handleClaim = async () => {
    setClaiming(true)
    setError(null)
    setLastReward(null)
    try {
      const res = await axios.post('/api/faucet/claim')
      setLastReward(res.data.message)
      setSecondsLeft(timerMinutes * 60)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
      if (err.response?.data?.minutesLeft) {
        setSecondsLeft(err.response.data.minutesLeft * 60)
      }
    } finally {
      setClaiming(false)
    }
  }

  const canClaim = secondsLeft === 0 && !claiming

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">Loading faucet...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Faucet
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Claim free crypto every {timerMinutes} minutes
        </p>
      </div>

      {/* Reward Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-gray-400" />
          <span className="text-gray-400 text-sm">Reward per claim</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Minimum</p>
            <p className="text-yellow-400 font-bold">{formatCrypto(rewardMin, currency)}</p>
          </div>
          <div className="text-gray-600 text-2xl">—</div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Maximum</p>
            <p className="text-yellow-400 font-bold">{formatCrypto(rewardMax, currency)}</p>
          </div>
        </div>
      </div>

      {/* Claim Button */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
        {secondsLeft > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Clock size={20} />
              <span className="text-sm">Next claim in</span>
            </div>
            <div className="text-4xl font-bold text-yellow-400 font-mono">
              {formatTime(secondsLeft)}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, 100 - (secondsLeft / (timerMinutes * 60)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-gray-500 text-sm">Come back when the timer ends</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Zap size={40} className="text-yellow-400" />
            </div>
            <p className="text-white font-medium">Faucet is ready!</p>
            <button
              onClick={handleClaim}
              disabled={!canClaim}
              className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-gray-950 font-bold py-4 rounded-xl text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? '⏳ Claiming...' : '⚡ CLAIM NOW'}
            </button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {lastReward && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2">
          <Trophy size={18} />
          <span className="font-medium">{lastReward}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-center text-sm">
          {error}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
        <p className="text-gray-400 text-sm font-medium">💡 Tips to earn more</p>
        <ul className="text-gray-500 text-sm space-y-1">
          <li>• Complete shortlinks for bonus rewards</li>
          <li>• Invite friends to earn 20% of their claims</li>
          <li>• Come back every {timerMinutes} minutes to maximize earnings</li>
        </ul>
      </div>

    </div>
  )
}
