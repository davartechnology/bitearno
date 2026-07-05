'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Copy, CheckCircle, TrendingUp, Gift } from 'lucide-react'
import { formatCrypto, formatDate } from '@/lib/utils'

export default function ReferralPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    axios.get('/api/referral').then((res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sourceLabel = (source: string) => {
    if (source === 'faucet_claim') return '⚡ Faucet'
    if (source === 'shortlink') return '🔗 Shortlink'
    if (source.startsWith('offerwall')) return '🎯 Offerwall'
    return source
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
          <Users className="text-purple-400" size={24} />
          Referral Program
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Earn 20% of every reward your referrals make
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users size={18} className="text-purple-400" />
            <span className="text-gray-400 text-sm">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-white">{data.totalReferrals}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={18} className="text-yellow-400" />
            <span className="text-gray-400 text-sm">Total Earned</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">
            {formatCrypto(data.totalEarnings, 'BTC')}
          </p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
        <h2 className="text-white font-semibold">Your Referral Link</h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={data.referralLink}
            readOnly
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-yellow-400 hover:bg-yellow-300 text-gray-950'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 bg-purple-400/5 border border-purple-400/20 rounded-lg p-3">
          <Gift size={18} className="text-purple-400 shrink-0" />
          <p className="text-gray-400 text-sm">
            Your referral code:{' '}
            <span className="text-purple-400 font-bold tracking-wider">
              {data.referralCode}
            </span>
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4">How it works</h2>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Share your referral link with friends', color: 'bg-yellow-400' },
            { step: '2', text: 'They register using your link', color: 'bg-blue-400' },
            { step: '3', text: 'Earn 20% of all their rewards automatically', color: 'bg-green-400' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-gray-950 font-bold text-sm shrink-0`}>
                {item.step}
              </div>
              <p className="text-gray-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4">Referral Earnings</h2>

        {data.earnings.length === 0 ? (
          <div className="text-center py-8">
            <Users size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No earnings yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Share your link to start earning
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.earnings.map((earning: any) => (
              <div
                key={earning.id}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {sourceLabel(earning.source)}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {formatDate(new Date(earning.createdAt))}
                  </p>
                </div>
                <span className="text-yellow-400 font-bold text-sm">
                  +{formatCrypto(earning.amount, earning.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
