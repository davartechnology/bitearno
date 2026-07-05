'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Settings, CheckCircle } from 'lucide-react'

export default function AdminFaucetConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    axios.get('/api/admin/faucet-config').then((res) => {
      setConfig(res.data.config)
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      await axios.patch('/api/admin/faucet-config', {
        rewardMin: parseFloat(config.rewardMin),
        rewardMax: parseFloat(config.rewardMax),
        timerMinutes: parseInt(config.timerMinutes),
        currency: config.currency,
        isActive: config.isActive,
      })
      setSuccess(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-red-400 animate-pulse">Loading config...</div>
    </div>
  )

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-red-400" size={24} />
          Faucet Configuration
        </h1>
        <p className="text-gray-400 text-sm mt-1">Adjust rewards and timer in real time</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          Configuration saved successfully
        </div>
      )}

      <form onSubmit={handleSave} className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Minimum Reward</label>
          <input
            type="number"
            step="0.00000001"
            value={config.rewardMin}
            onChange={(e) => setConfig({ ...config, rewardMin: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Maximum Reward</label>
          <input
            type="number"
            step="0.00000001"
            value={config.rewardMax}
            onChange={(e) => setConfig({ ...config, rewardMax: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Timer (minutes)</label>
          <input
            type="number"
            value={config.timerMinutes}
            onChange={(e) => setConfig({ ...config, timerMinutes: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Currency</label>
          <select
            value={config.currency}
            onChange={(e) => setConfig({ ...config, currency: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="LTC">Litecoin (LTC)</option>
            <option value="DOGE">Dogecoin (DOGE)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={config.isActive}
            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            className="w-4 h-4 accent-red-400"
          />
          <label htmlFor="isActive" className="text-gray-400 text-sm">Faucet Active</label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  )
}
