import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Logged as <span className="text-red-400 font-medium">{session.user.email}</span>
            </p>
            <span className="bg-red-400/10 text-red-400 border border-red-400/20 text-xs px-3 py-1 rounded-full font-medium">
              Admin
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
