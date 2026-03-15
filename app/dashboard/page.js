'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth')
      else { setUser(user); setLoading(false) }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
      <div className="text-[#1a2e5a] font-medium">Chargement…</div>
    </div>
  )

  const prenom = user?.user_metadata?.full_name?.split(' ')[0] || 'Étudiant'

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-6">
          <a href="/chat" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Assistant IA</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
          <div className="w-8 h-8 rounded-full bg-[#1a2e5a] flex items-center justify-center text-[#d4af37] font-bold text-sm">
            {prenom[0].toUpperCase()}
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">
            Déconnexion
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-white border-b border-gray-200 px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1a2e5a]">Ravi de te revoir, {prenom} !</h1>
          <p className="text-gray-400 text-sm mt-1">Votre parcours d'apprentissage se poursuit</p>
        </div>
      </section>

      {/* STATS */}
      <section className="px-8 py-8 max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Vos progrès</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Conversations', value: '0', sub: 'Commencez à utiliser ORTHOS' },
            { label: 'Flashcards révisées', value: '0', sub: 'Révisez vos premières fiches' },
            { label: 'Quiz complétés', value: '0', sub: 'Testez vos connaissances' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{s.value}</div>
              <div className="text-sm font-medium text-gray-600 mb-1">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="px-8 pb-8 max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Accès rapide</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '⚖️', title: 'Assistant ORTHOS', desc: 'Posez vos questions juridiques, structurez vos dissertations et commentaires d\'arrêt.', cta: 'Ouvrir le chat', href: '/chat', color: 'bg-[#eef1f8]' },
            { icon: '🃏', title: 'Flashcards', desc: 'Révisez les notions clés avec des flashcards interactives basées sur la répétition espacée.', cta: 'Commencer', href: '/flashcards', color: 'bg-[#f0fdf4]' },
            { icon: '🎯', title: 'Quiz', desc: 'Testez vos connaissances avec des QCM générés par l\'IA et suivez votre progression.', cta: 'Faire un quiz', href: '/quiz', color: 'bg-[#fefce8]' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{item.icon}</div>
              <h3 className="font-semibold text-[#1a2e5a] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{item.desc}</p>
              <a href={item.href} className="mt-4 block text-center bg-[#1a2e5a] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                {item.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="px-8 pb-12 max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Par où commencer ?</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '💬', title: 'Poser une question', desc: 'Commencez par poser une question juridique à ORTHOS.', href: '/chat' },
            { icon: '📋', title: 'Générer une fiche', desc: 'Créez votre première fiche de révision sur un concept clé.', href: '/chat' },
            { icon: '🏆', title: 'Défi quotidien', desc: 'Répondez à la question juridique du jour pour garder le rythme.', href: '/quiz' },
          ].map((item) => (
            <a key={item.title} href={item.href} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1a2e5a] transition flex gap-4 items-start">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <div className="font-medium text-[#1a2e5a] text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

    </main>
  )
}