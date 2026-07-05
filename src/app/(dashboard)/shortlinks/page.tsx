'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link2, CheckCircle, ExternalLink, Clock } from 'lucide-react'
import { formatCrypto } from '@/lib/utils'

interface Shortlink {
  id: string
  title: string
  url: string
  reward: number
  currency: string
  completed: boolean
}

export default function ShortlinksPage() {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([])
  const [loading, setLoading] = useState(true)
  const [visiting, setVisiting] = useState<string | null>(null)
  const [timers, setTimers] = useState<Record<string, number>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    axios.get('/api/shortlinks').then((res) => {
      setShortlinks(res.data.shortlinks)
      setLoading(false)
    })
  }, [])

  const handleVisit = async (link: Shortlink) => {
    if (link.completed || visiting === link.id) return

    setVisiting(link.id)
    setErrors((prev) => ({ ...prev, [link.id]: '' }))
    setMessages((prev) => ({ ...prev, [link.id]: '' }))

    window.open(link.url, '_blank')

    let countdown = 15
    setTimers((prev) => ({ ...prev, [link.id]: countdown }))

    const interval = setInterval(() => {
      countdown -= 1
      setTimers((prev) => ({ ...prev, [link.id]: countdown }))
      if (countdown <= 0) {
        clearInterval(interval)
        completeShortlink(link)
      }
    }, 1000)
  }

  const completeShortlink = async (link: Shortlink) => {
    try {
      const res = await axios.post('/api/shortlinks/complete', {
        shortlinkId: link.id,
      })
      setMessages((prev) => ({ ...prev, [link.id]: res.data.message }))
      setShortlinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, completed: true } : l))
      )
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [link.id]: err.response?.data?.error || 'Something went wrong',
      }))
    } finally {
      setVisiting(null)
      setTimers((prev) => ({ ...prev, [link.id]: 0 }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">Loading shortlinks...</div>
      </div>
    )
  }

  const available = shortlinks.filter((l) => !l.completed)
  const completed = shortlinks.filter((l) => l.completed)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Link2 className="text-blue-400" size={24} />
          Shortlinks
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Visit links and earn crypto rewards instantly
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{available.length}</p>
          <p className="text-gray-400 text-xs mt-1">Available</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{completed.length}</p>
          <p className="text-gray-400 text-xs mt-1">Completed</p>
        </div>
      </div>

      {/* Available Links */}
      {available.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-semibold">Available Links</h2>
          {available.map((link) => (
            <div
              key={link.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium">{link.title}</p>
                  <p className="text-yellow-400 text-sm mt-0.5">
                    +{formatCrypto(link.reward, link.currency)}
                  </p>
                </div>

                {visiting === link.id && timers[link.id] > 0 ? (
                  <div className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 text-blue-400 px-4 py-2 rounded-lg">
                    <Clock size={16} />
                    <span className="font-bold text-sm">{timers[link.id]}s</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVisit(link)}
                    disabled={!!visiting}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ExternalLink size={15} />
                    Visit
                  </button>
                )}
              </div>

              {visiting === link.id && timers[link.id] > 0 && (
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${((15 - timers[link.id]) / 15) * 100}%` }}
                  />
                </div>
              )}

              {messages[link.id] && (
                <p className="text-green-400 text-sm mt-2">{messages[link.id]}</p>
              )}
              {errors[link.id] && (
                <p className="text-red-400 text-sm mt-2">{errors[link.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Links */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-semibold">Completed</h2>
          {completed.map((link) => (
            <div
              key={link.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{link.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    +{formatCrypto(link.reward, link.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Done</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {shortlinks.length === 0 && (
        <div className="text-center py-12">
          <Link2 size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No shortlinks available right now</p>
          <p className="text-gray-600 text-sm mt-1">Check back later</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <p className="text-gray-400 text-sm font-medium mb-2">💡 How it works</p>
        <ul className="text-gray-500 text-sm space-y-1">
          <li>• Click Visit to open the link in a new tab</li>
          <li>• Wait 15 seconds for the reward to unlock</li>
          <li>• Reward is credited to your balance instantly</li>
          <li>• Each link can only be completed once</li>
        </ul>
      </div>

    </div>
  )
}

