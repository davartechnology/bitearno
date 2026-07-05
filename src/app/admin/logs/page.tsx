'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/logs').then((res) => {
      setLogs(res.data.logs)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-gray-400" size={24} />
          Admin Logs
        </h1>
        <p className="text-gray-400 text-sm mt-1">All admin actions history</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Action</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Target User</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Details</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No logs yet</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <span className="bg-red-400/10 text-red-400 border border-red-400/20 text-xs px-2 py-1 rounded-full font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">
                      —
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs font-mono">
                      {log.details ? log.details.substring(0, 50) + '...' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{formatDate(new Date(log.createdAt))}</span>
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
