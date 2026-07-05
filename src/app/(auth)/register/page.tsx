'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/auth/register', form)
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">⚡ Bitearno</h1>
          <p className="text-gray-400 mt-2">Create your free account</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="cooluser123"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                Referral Code <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="ABC123"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
