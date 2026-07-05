'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Gift, ExternalLink, ChevronRight } from 'lucide-react'

interface Offer {
  id: string
  name: string
  description: string
  icon: string
  color: string
  url: string
  type: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)

  useEffect(() => {
    axios.get('/api/offers').then((res) => {
      setOffers(res.data.offers)
      setLoading(false)
    })
  }, [])

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    green: 'bg-green-400/10 border-green-400/20 text-green-400',
    purple: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
  }

  const buttonMap: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-400',
    green: 'bg-green-500 hover:bg-green-400',
    purple: 'bg-purple-500 hover:bg-purple-400',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-400 text-lg animate-pulse">
          Loading offers...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gift className="text-green-400" size={24} />
          Offers
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete tasks and earn crypto rewards
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
        <p className="text-yellow-400 text-sm font-medium">💰 How earnings work</p>
        <p className="text-gray-400 text-sm mt-1">
          Complete surveys, install apps or watch videos. Rewards are credited
          automatically to your balance within minutes.
        </p>
      </div>

      {/* Offer Walls */}
      {!activeOffer ? (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${colorMap[offer.color]}`}>
                    {offer.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{offer.name}</p>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {offer.description}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-2 ${colorMap[offer.color]}`}>
                      {offer.type}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setActiveOffer(offer)}
                  className={`flex-1 ${buttonMap[offer.color]} text-white font-bold py-2.5 rounded-lg transition text-sm`}
                >
                  Open Wall
                </button>
                
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium px-4 py-2.5 rounded-lg transition text-sm"
                >
                  <ExternalLink size={14} />
                  New Tab
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">{activeOffer.name}</h2>
            <button
              onClick={() => setActiveOffer(null)}
              className="text-gray-400 hover:text-white text-sm bg-gray-800 px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <iframe
              src={activeOffer.url}
              className="w-full"
              style={{ height: '600px' }}
              frameBorder="0"
              title={activeOffer.name}
            />
          </div>

          <p className="text-gray-500 text-xs text-center">
            Rewards are credited automatically after completion
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
        <p className="text-gray-400 text-sm font-medium">💡 Tips</p>
        <ul className="text-gray-500 text-sm space-y-1">
          <li>• Use real information for surveys to qualify</li>
          <li>• App installs must stay for 24h to count</li>
          <li>• Rewards arrive within 1–5 minutes</li>
          <li>• Contact support if reward is missing after 24h</li>
        </ul>
      </div>

    </div>
  )
}
