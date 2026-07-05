'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { User, Shield, Trophy, Calendar, Edit2, CheckCircle } from 'lucide-react'
import { formatCrypto, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editUsername, setEditUsername] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const [usernameForm, setUsernameForm] = useState({ username: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/user/profile')
      setProfile(res.data.user)
      setUsernameForm({ username: res.data.user.username })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    setError(null)
    try {
      const res = await axios.patch('/api/user/profile', {
        username: usernameForm.username,
      })
      setSuccess(res.data.message)
      setEditUsername(false)
      fetchProfile()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setSuccess(null)
    setError(null)
    try {
      const res = await axios.patch('/api/user/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setSuccess(res.data.message)
      setEditPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  const xpProgress = (profile.xp % (profile.level * 100)) / (profile.level * 100) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="text-blue-400" size={24} />
          Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Avatar + Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-400">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{profile.username}</p>
            <p className="text-gray-400 text-sm">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                Level {profile.level}
              </span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-gray-400 text-sm">{profile.xp} XP</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Level {profile.level}</span>
            <span>Level {profile.level + 1}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{profile._count.claims}</p>
          <p className="text-gray-500 text-xs mt-1">Total Claims</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{profile._count.referralEarnings}</p>
          <p className="text-gray-500 text-xs mt-1">Referrals</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-white">{profile._count.withdrawals}</p>
          <p className="text-gray-500 text-xs mt-1">Withdrawals</p>
        </div>
      </div>

      {/* Balances */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4">Current Balances</h2>
        <div className="space-y-3">
          {[
            { label: 'Bitcoin', value: formatCrypto(profile.balanceBtc, 'BTC'), color: 'text-yellow-400' },
            { label: 'Litecoin', value: formatCrypto(profile.balanceLtc, 'LTC'), color: 'text-blue-400' },
            { label: 'Dogecoin', value: formatCrypto(profile.balanceDoge, 'DOGE'), color: 'text-orange-400' },
          ].map((b) => (
            <div key={b.label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <span className="text-gray-400 text-sm">{b.label}</span>
              <span className={`${b.color} font-bold text-sm`}>{b.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Username */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Edit2 size={16} className="text-gray-400" />
            Username
          </h2>
          <button
            onClick={() => { setEditUsername(!editUsername); setError(null) }}
            className="text-yellow-400 text-sm hover:underline"
          >
            {editUsername ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {!editUsername ? (
          <p className="text-gray-300 text-sm bg-gray-800 px-4 py-3 rounded-lg">
            {profile.username}
          </p>
        ) : (
          <form onSubmit={handleUsernameUpdate} className="space-y-3">
            <input
              type="text"
              value={usernameForm.username}
              onChange={(e) => setUsernameForm({ username: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition text-sm"
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
            >
              {submitting ? 'Saving...' : 'Save Username'}
            </button>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            Password
          </h2>
          <button
            onClick={() => { setEditPassword(!editPassword); setError(null) }}
            className="text-yellow-400 text-sm hover:underline"
          >
            {editPassword ? 'Cancel' : 'Change'}
          </button>
        </div>

        {!editPassword ? (
          <p className="text-gray-500 text-sm bg-gray-800 px-4 py-3 rounded-lg">
            ••••••••
          </p>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition text-sm"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition text-sm"
              placeholder="New password"
              minLength={6}
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition text-sm"
              placeholder="Confirm new password"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
            >
              {submitting ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          Account Info
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Member since</span>
            <span className="text-gray-300 text-sm">
              {formatDate(new Date(profile.createdAt))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Last login</span>
            <span className="text-gray-300 text-sm">
              {profile.lastLoginAt ? formatDate(new Date(profile.lastLoginAt)) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Referral code</span>
            <span className="text-purple-400 font-bold text-sm tracking-wider">
              {profile.referralCode}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
