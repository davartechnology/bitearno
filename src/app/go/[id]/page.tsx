'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { ExternalLink, Shield, Clock } from 'lucide-react'

export default function RedirectPage() {
  const { id } = useParams()
  const router = useRouter()
  const { status } = useSession()
  const [seconds, setSeconds] = useState(15)
  const [shortlink, setShortlink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchShortlink()
    }
  }, [status])

  const fetchShortlink = async () => {
    try {
      const res = await axios.get('/api/shortlinks')
      const found = res.data.shortlinks.find((l: { id: string }) => l.id === id)
      if (!found) {
        setError('Shortlink not found')
        return
      }
      if (found.completed) {
        setError('You already completed this shortlink')
        return
      }
      setShortlink(found)
      window.open(found.url, '_blank')
    } catch {
      setError('Failed to load shortlink')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!shortlink || completed) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [shortlink])

  const handleComplete = async () => {
    if (completed) return
    try {
      await axios.post('/api/shortlinks/complete', { shortlinkId: id })
      setCompleted(true)
      setTimeout(() => router.push('/shortlinks'), 2000)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Something went wrong')
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/shortlinks')}
            className="bg-yellow-400 text-gray-950 font-bold px-6 py-2 rounded-lg"
          >
            Back to Shortlinks
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-yellow-400">⚡ Bitearno</h1>
          <p className="text-gray-400 text-sm mt-1">Shortlink Redirect</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-6">

          {!completed ? (
            <>
              <div className="w-20 h-20 bg-blue-400/10 border-2 border-blue-400/30 rounded-full flex items-center justify-center mx-auto">
                {seconds > 0 ? (
                  <span className="text-3xl font-bold text-blue-400">{seconds}</span>
                ) : (
                  <Clock size={36} className="text-blue-400 animate-spin" />
                )}
              </div>

              <div>
                <p className="text-white font-semibold text-lg">{shortlink?.title}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {seconds > 0
                    ? `Please wait ${seconds} seconds...`
                    : 'Validating your visit...'}
                </p>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((15 - seconds) / 15) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <span className="font-bold text-sm">
                  +{shortlink?.reward?.toFixed(8)} {shortlink?.currency}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Shield size={12} />
                <span>Link opened in new tab</span>
                <ExternalLink size={12} />
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-400/10 border-2 border-green-400/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <p className="text-green-400 font-bold text-xl">Reward Earned!</p>
                <p className="text-gray-400 text-sm mt-2">
                  +{shortlink?.reward?.toFixed(8)} {shortlink?.currency} added to your balance
                </p>
              </div>
              <p className="text-gray-500 text-sm">Redirecting to shortlinks...</p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
