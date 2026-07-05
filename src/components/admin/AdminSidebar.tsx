'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  AlertTriangle,
  Link2,
  FileText,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/faucet-config', label: 'Faucet Config', icon: Settings },
  { href: '/admin/shortlinks', label: 'Shortlinks', icon: Link2 },
  { href: '/admin/fraud', label: 'Fraud', icon: AlertTriangle },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-red-400">⚙️ Admin Panel</h1>
        <p className="text-gray-500 text-xs mt-1">Bitearno Control Center</p>
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
                  ? 'bg-red-400/10 text-red-400 border border-red-400/20'
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
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition text-sm w-full px-3 py-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
