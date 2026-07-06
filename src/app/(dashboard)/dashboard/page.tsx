'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { formatCrypto } from '@/lib/utils'
import {
  Zap,
  Link2,
  Gift,
  Users,
  TrendingUp,
  ArrowDownToLine,
} from 'lucide-react'
import Link from 'next/link'
import DailyBonus from '@/components/dashboard/DailyBonus'

export default function DashboardPage() {
  useSession()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/user/stats').then((res) => {
      setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  const { user, todayClaims } = stats

  const balanceCards = [
    { label: 'Bitcoin', value: formatCrypto(user.balanceBtc, 'BTC'), color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { label: 'Litecoin', value: formatCrypto(user.balanceLtc, 'LTC'), color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { label: 'Dogecoin', value: formatCrypto(user.balanceDoge, 'DOGE'), color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  ]

  const taskCards = [
    { href: '/faucet', label: 'Faucet', desc: 'Claim every hour', icon: Zap, color: 'text-yellow-400', bg: 'hover:bg-yellow-400/5' },
    { href: '/shortlinks', label: 'Shortlinks', desc: 'Visit & earn', icon: Link2, color: 'text-blue-400', bg: 'hover:bg-blue-400/5' },
    { href: '/offers', label: 'Offers', desc: 'Complete tasks', icon: Gift, color: 'text-green-400', bg: 'hover:bg-green-400/5' },
    { href: '/referral', label: 'Referral', desc: 'Invite friends', icon: Users, color: 'text-purple-400', bg: 'hover:bg-purple-400/5' },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-yellow-400">{user.username}</span> 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Level {user.level} · {user.xp} XP
        </p>
      </div>

      {/* XP Progress */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Level {user.level}</span>
          <span className="text-gray-400">Level {user.level + 1}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((user.xp % (user.level * 100)) / (user.level * 100) * 100, 100)}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">{user.xp % (user.level * 100)} / {user.level * 100} XP to next level</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balanceCards.map((card) => (
          <div key={card.label} className={`bg-gray-900 rounded-xl border ${card.bg} p-4`}>
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className={`${card.color} font-bold text-lg mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{todayClaims}</p>
          <p className="text-gray-400 text-xs mt-1">Claims Today</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{user._count.claims}</p>
          <p className="text-gray-400 text-xs mt-1">Total Claims</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{user._count.referralEarnings}</p>
          <p className="text-gray-400 text-xs mt-1">Referrals</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{user._count.withdrawals}</p>
          <p className="text-gray-400 text-xs mt-1">Withdrawals</p>
        </div>
      </div>

      <DailyBonus />

      {/* Tasks */}
      <div>
        <h2 className="text-white font-semibold mb-3">Earn More Crypto</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {taskCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col items-center text-center transition ${card.bg}`}
              >
                <Icon size={28} className={card.color} />
                <p className="text-white font-medium mt-2">{card.label}</p>
                <p className="text-gray-500 text-xs mt-1">{card.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Withdraw */}
      <Link
        href="/withdraw"
        className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-yellow-400/30 transition"
      >
        <div className="flex items-center gap-3">
          <ArrowDownToLine size={20} className="text-yellow-400" />
          <div>
            <p className="text-white font-medium">Withdraw Earnings</p>
            <p className="text-gray-400 text-sm">Send to FaucetPay instantly</p>
          </div>
        </div>
        <TrendingUp size={18} className="text-gray-500" />
      </Link>

    </div>
  )
}
