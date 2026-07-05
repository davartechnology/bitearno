'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCrypto, formatDate } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    axios.get('/api/admin/payments', { params: { status: filter } }).then((res) => {
      setWithdrawals(res.data.withdrawals)
      setLoading(false)
    })
  }, [filter])

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle size={14} className="text-green-400" />
    if (status === 'rejected') return <XCircle size={14} className="text-red-400" />
    return <Clock size={14} className="text-yellow-400" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-blue-400" size={24} />
          Payments
        </h1>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              filter === s
                ? 'bg-red-400 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Amount</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Address</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No withdrawals found</td></tr>
              ) : withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{w.user.username}</p>
                    <p className="text-gray-500 text-xs">{w.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-yellow-400 font-bold text-sm">
                      {formatCrypto(w.amount, w.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs font-mono truncate max-w-32 block">
                      {w.address}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(w.status)}
                      <span className={`text-sm capitalize font-medium ${
                        w.status === 'approved' ? 'text-green-400' :
                        w.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{formatDate(new Date(w.createdAt))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
