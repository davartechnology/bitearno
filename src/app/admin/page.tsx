'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Users,
  Zap,
  ArrowDownToLine,
  AlertTriangle,
  TrendingUp,
  Clock,
  UserPlus,
} from 'lucide-react'
import { formatCrypto, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load stats')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-lg animate-pulse">Loading admin data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    )
  }

  const { stats, recentClaims, recentWithdrawals, recentUsers } = data

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { label: 'Active (24h)', value: stats.activeUsers24h, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
    { label: 'Claims Today', value: stats.claimsToday, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { label: 'Total Claims', value: stats.totalClaims, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { label: 'Pending Payouts', value: stats.pendingWithdrawals, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    { label: 'Fraud Flags', value: stats.unresolvedFlags, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  ]

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Bitearno Control Center</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`bg-gray-900 rounded-xl border ${card.bg} p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={card.color} />
                <span className="text-gray-400 text-sm">{card.label}</span>
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-1">
          <ArrowDownToLine size={16} className="text-purple-400" />
          <span className="text-gray-400 text-sm">Total Payouts Sent</span>
        </div>
        <p className="text-2xl font-bold text-purple-400">
          {formatCrypto(stats.totalPayouts, 'BTC')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            Recent Claims
          </h2>
          <div className="space-y-3">
            {recentClaims.length === 0 ? (
              <p className="text-gray-500 text-sm">No claims yet</p>
            ) : recentClaims.map((claim: any) => (
              <div key={claim.id} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">
                    {claim.user?.username || 'Unknown'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(new Date(claim.claimedAt))}
                  </p>
                </div>
                <span className="text-yellow-400 text-sm font-bold">
                  +{claim.amount?.toFixed(8)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ArrowDownToLine size={16} className="text-blue-400" />
            Recent Withdrawals
          </h2>
          <div className="space-y-3">
            {recentWithdrawals.length === 0 ? (
              <p className="text-gray-500 text-sm">No withdrawals yet</p>
            ) : recentWithdrawals.map((w: any) => (
              <div key={w.id} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">
                    {w.user?.username || 'Unknown'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(new Date(w.createdAt))}
                  </p>
                </div>
                <span className={`text-sm font-bold ${
                  w.status === 'approved' ? 'text-green-400' :
                  w.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-green-400" />
            New Users
          </h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users yet</p>
            ) : recentUsers.map((user: any) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">{user.username}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
                <span className="text-gray-500 text-xs">
                  {formatDate(new Date(user.createdAt))}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
