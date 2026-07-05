import Link from 'next/link'
import { Zap, Link2, Gift, Users, ArrowRight, Shield, Clock, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">⚡ Bitearno</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-400 hover:text-white transition text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-4 py-2 rounded-lg transition text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap size={14} />
          Free Crypto Every Hour
        </div>
        <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Earn Free{' '}
          <span className="text-yellow-400">Bitcoin</span>
          <br />
          Every Hour
        </h2>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          Claim free crypto, complete shortlinks, finish offers and invite friends.
          Withdraw instantly via FaucetPay.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-8 py-4 rounded-xl text-lg transition flex items-center justify-center gap-2"
          >
            Start Earning Free
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Active Users' },
            { value: '1M+', label: 'Claims Made' },
            { value: '0.1 BTC+', label: 'Total Paid Out' },
            { value: '< 1 min', label: 'Withdrawal Time' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-yellow-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white">How it works</h3>
          <p className="text-gray-400 mt-2">Start earning in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up for free in seconds. No credit card required.',
              icon: Users,
              color: 'text-blue-400',
              bg: 'bg-blue-400/10 border-blue-400/20',
            },
            {
              step: '02',
              title: 'Complete Tasks',
              desc: 'Claim faucet, visit shortlinks, complete offers every hour.',
              icon: Zap,
              color: 'text-yellow-400',
              bg: 'bg-yellow-400/10 border-yellow-400/20',
            },
            {
              step: '03',
              title: 'Withdraw Instantly',
              desc: 'Send your earnings to FaucetPay wallet in one click.',
              icon: Trophy,
              color: 'text-green-400',
              bg: 'bg-green-400/10 border-green-400/20',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
                <div className={`w-14 h-14 rounded-xl border ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={24} className={item.color} />
                </div>
                <p className="text-gray-600 text-sm font-bold mb-2">{item.step}</p>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white">Multiple Ways to Earn</h3>
            <p className="text-gray-400 mt-2">Maximize your earnings with every feature</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: 'Hourly Faucet',
                desc: 'Claim free Bitcoin, Litecoin or Dogecoin every 60 minutes. Random rewards up to 200 satoshi per claim.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-400/10 border-yellow-400/20',
              },
              {
                icon: Link2,
                title: 'Shortlinks',
                desc: 'Visit short links and earn instant rewards. Quick 15-second timer then reward is yours.',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10 border-blue-400/20',
              },
              {
                icon: Gift,
                title: 'Offerwalls',
                desc: 'Complete surveys, install apps and finish missions on CPX Research, AdGate and OfferToro.',
                color: 'text-green-400',
                bg: 'bg-green-400/10 border-green-400/20',
              },
              {
                icon: Users,
                title: 'Referral Program',
                desc: 'Earn 20% commission on all rewards your referrals make. Unlimited referrals, unlimited earnings.',
                color: 'text-purple-400',
                bg: 'bg-purple-400/10 border-purple-400/20',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex gap-4">
                  <div className={`w-12 h-12 rounded-xl border ${feature.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={feature.color} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Supported Cryptos */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white">Supported Cryptocurrencies</h3>
          <p className="text-gray-400 mt-2">Withdraw to FaucetPay instantly</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { symbol: '₿', name: 'Bitcoin', short: 'BTC', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
            { symbol: 'Ł', name: 'Litecoin', short: 'LTC', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
            { symbol: 'Ð', name: 'Dogecoin', short: 'DOGE', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
          ].map((crypto) => (
            <div key={crypto.short} className={`bg-gray-900 rounded-2xl border ${crypto.bg} p-6 text-center`}>
              <div className={`text-5xl font-bold ${crypto.color} mb-3`}>{crypto.symbol}</div>
              <p className="text-white font-bold text-lg">{crypto.name}</p>
              <p className={`${crypto.color} text-sm font-medium mt-1`}>{crypto.short}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: 'Secure Platform', desc: 'Advanced anti-bot and fraud detection systems.' },
              { icon: Clock, title: 'Instant Payouts', desc: 'Withdrawals processed instantly via FaucetPay.' },
              { icon: Trophy, title: 'Daily Bonuses', desc: 'Login streaks and level system for extra rewards.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex flex-col items-center">
                  <Icon size={28} className="text-yellow-400 mb-3" />
                  <h4 className="text-white font-bold mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h3 className="text-4xl font-bold text-white mb-4">
          Ready to earn free crypto?
        </h3>
        <p className="text-gray-400 text-lg mb-8">
          Join thousands of users earning free Bitcoin every day.
        </p>
        <Link
          href="/register"
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-10 py-4 rounded-xl text-lg transition inline-flex items-center gap-2"
        >
          Create Free Account
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-yellow-400 font-bold">⚡ Bitearno</p>
          <p className="text-gray-500 text-sm">
            © 2025 Bitearno. Earn free crypto every hour.
          </p>
          <div className="flex gap-4 text-gray-500 text-sm">
            <Link href="/login" className="hover:text-white transition">Login</Link>
            <Link href="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
