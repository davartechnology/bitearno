'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
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

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <span className="text-yellow-400 font-bold md:hidden">⚡ Bitearno</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden md:block">
            👋 {session?.user?.username}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition text-sm"
          >
            <LogOut size={16} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden mt-3 flex flex-col gap-1 border-t border-gray-800 pt-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
