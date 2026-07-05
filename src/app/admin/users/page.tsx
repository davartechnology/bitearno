'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Search, Ban, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/users', {
        params: { search, page },
      })
      setUsers(res.data.users)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, page])

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId + action)
    try {
      await axios.patch(`/api/admin/users/${userId}`, { action })
      fetchUsers()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-blue-400" size={24} />
          Users Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Total: {total} users
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by email or username..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition text-sm"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Balance BTC</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Claims</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Joined</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{user.username}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                    <p className="text-gray-600 text-xs">{user.lastIp}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-yellow-400 text-sm">
                      {user.balanceBtc.toFixed(8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{user._count.claims}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="bg-red-400/10 text-red-400 border border-red-400/20 text-xs px-2 py-1 rounded-full">Banned</span>
                    ) : user.isSuspended ? (
                      <span className="bg-orange-400/10 text-orange-400 border border-orange-400/20 text-xs px-2 py-1 rounded-full">Suspended</span>
                    ) : (
                      <span className="bg-green-400/10 text-green-400 border border-green-400/20 text-xs px-2 py-1 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {formatDate(new Date(user.createdAt))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!user.isBanned ? (
                        <button
                          onClick={() => handleAction(user.id, 'ban')}
                          disabled={!!actionLoading}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Ban size={12} />
                          Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, 'unban')}
                          disabled={!!actionLoading}
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <CheckCircle size={12} />
                          Unban
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user.id, 'reset_balance')}
                        disabled={!!actionLoading}
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <AlertTriangle size={12} />
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                page === p
                  ? 'bg-red-400 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
