'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminFraudPage() {
  const [flags, setFlags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFlags = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/fraud')
      setFlags(res.data.flags)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  const handleResolve = async (id: string) => {
    await axios.patch(`/api/admin/fraud/${id}`, { resolved: true })
    fetchFlags()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-red-400" size={24} />
          Fraud Detection
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review and resolve suspicious activity
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Reason</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">IP</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Date</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Shield size={32} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No fraud flags</p>
                  </td>
                </tr>
              ) : flags.map((flag) => (
                <tr key={flag.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{flag.user?.username}</p>
                    <p className="text-gray-500 text-xs">{flag.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-400 text-sm">{flag.reason}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm font-mono">{flag.ipAddress}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {formatDate(new Date(flag.flaggedAt))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {flag.resolved ? (
                      <span className="bg-green-400/10 text-green-400 border border-green-400/20 text-xs px-2 py-1 rounded-full">
                        Resolved
                      </span>
                    ) : (
                      <span className="bg-red-400/10 text-red-400 border border-red-400/20 text-xs px-2 py-1 rounded-full">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!flag.resolved && (
                      <button
                        onClick={() => handleResolve(flag.id)}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        Resolve
                      </button>
                    )}
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
