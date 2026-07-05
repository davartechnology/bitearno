'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link2, Plus, Trash2, CheckCircle, Wand2 } from 'lucide-react'
import { formatCrypto } from '@/lib/utils'

const PROVIDERS = [
  { id: 'fclc', name: 'Fc.lc' },
  { id: 'exeio', name: 'Exe.io' },
  { id: 'shrinkme', name: 'Shrinkme.io' },
  { id: 'adfly', name: 'Adfly' },
]

export default function AdminShortlinksPage() {
  const [shortlinks, setShortlinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    url: '',
    reward: '',
    currency: 'BTC',
    provider: 'fclc',
  })
  const [submitting, setSubmitting] = useState(false)
  const [shortening, setShortening] = useState(false)
  const [shortenedUrl, setShortenedUrl] = useState('')

  const fetchShortlinks = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/shortlinks')
      setShortlinks(res.data.shortlinks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShortlinks()
  }, [])

  const handleShorten = async () => {
    if (!form.url) return
    setShortening(true)
    try {
      const res = await axios.post('/api/admin/shortlinks/shorten', {
        url: form.url,
        provider: form.provider,
      })
      setShortenedUrl(res.data.shortenedUrl)
      setForm({ ...form, url: res.data.shortenedUrl })
    } catch {
      alert('Failed to shorten URL')
    } finally {
      setShortening(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    try {
      await axios.post('/api/admin/shortlinks', {
        title: form.title,
        url: form.url,
        reward: parseFloat(form.reward),
        currency: form.currency,
        isActive: true,
      })
      setSuccess('Shortlink added successfully')
      setForm({ title: '', url: '', reward: '', currency: 'BTC', provider: 'fclc' })
      setShortenedUrl('')
      fetchShortlinks()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await axios.delete('/api/admin/shortlinks', { data: { id } })
    fetchShortlinks()
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Link2 className="text-blue-400" size={24} />
          Shortlinks Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Add shortlinks via Fc.lc, Exe.io, Shrinkme.io or Adfly
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={14} />
          {success}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Plus size={16} className="text-green-400" />
          Add New Shortlink
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition text-sm"
                placeholder="Visit Crypto News"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm mb-2 block">Original URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition text-sm"
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  onClick={handleShorten}
                  disabled={shortening || !form.url}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-3 rounded-lg transition disabled:opacity-50 text-sm"
                >
                  <Wand2 size={15} />
                  {shortening ? 'Shortening...' : 'Shorten'}
                </button>
              </div>
              {shortenedUrl && (
                <p className="text-green-400 text-xs mt-2">
                  ✅ Shortened: {shortenedUrl}
                </p>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Reward</label>
              <input
                type="number"
                step="0.00000001"
                value={form.reward}
                onChange={(e) => setForm({ ...form, reward: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition text-sm"
                placeholder="0.00000100"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition text-sm"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="LTC">Litecoin (LTC)</option>
                <option value="DOGE">Dogecoin (DOGE)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} />
            {submitting ? 'Adding...' : 'Add Shortlink'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Title</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">URL</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Reward</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Visits</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : shortlinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No shortlinks yet — add one above
                  </td>
                </tr>
              ) : shortlinks.map((link) => (
                <tr key={link.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{link.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:underline truncate max-w-40 block"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-yellow-400 font-bold text-sm">
                      {formatCrypto(link.reward, link.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{link.totalVisits}</span>
                  </td>
                  <td className="px-4 py-3">
                    {link.isActive ? (
                      <span className="bg-green-400/10 text-green-400 border border-green-400/20 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-400/10 text-gray-400 border border-gray-400/20 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
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
