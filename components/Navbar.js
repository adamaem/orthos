'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar({ active }) {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const prenom = user?.user_metadata?.full_name?.split(' ')[0] || null
  const initiale = prenom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()

  const links = [
    { href: '/fonctionnalites', label: 'Fonctionnalités' },
    { href: '/tarifs', label: 'Tarifs' },
    { href: '/faq', label: 'FAQ' },
    { href: '/apropos', label: 'À propos' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
      <a href="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
        <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
      </a>
      <div className="ml-auto flex items-center gap-8">
        {links.map(link => (
          <a key={link.href} href={link.href}
            className={`text-sm hover:text-[#1a2e5a] ${active === link.href ? 'text-[#1a2e5a] font-medium' : 'text-gray-500'}`}>
            {link.label}
          </a>
        ))}
        {user ? (
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Dashboard</a>
            <a href="/profil"
              className="w-8 h-8 rounded-full bg-[#1a2e5a] flex items-center justify-center text-[#d4af37] font-bold text-sm hover:opacity-80 transition">
              {initiale}
            </a>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">
              Déconnexion
            </button>
          </div>
        ) : (
          <a href="/auth" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        )}
      </div>
    </nav>
  )
}