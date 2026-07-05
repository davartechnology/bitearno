'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Zap,
  Link2,
  Gift,
  ArrowDownToLine,
  Users,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faucet', label: 'Faucet', icon: Zap },
  { href: '/shortlinks', label: 'Shortlinks', icon: Link2 },
  { href: '/offers', label: 'Offers', icon: Gift },
  { href: '/withdraw', label: 'Withdraw', icon: ArrowDownToLine },
  { href: '/referral', label: 'Referral', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-yellow-400">⚡ Bitearno</h1>
        <p className="text-gray-500 text-xs mt-1">Earn Free Crypto</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs text-center">
          © 2025 Bitearno
        </p>
      </div>
    </aside>
  )
}
