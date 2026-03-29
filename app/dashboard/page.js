'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    flashcardsTotal: 0,
    flashcardsAReviser: 0,
    quizTotal: 0,
    quizMoyenne: 0,
    meilleureMatiere: '-',
    flashcardsNiveau: { 0: 0, 1: 0, 2: 0, 3: 0 },
    derniersQuiz: [],
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth')
      else {
        setUser(user)
        await chargerStats(user.id)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const chargerStats = async (userId) => {
    // Flashcards
    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)

    // Quiz
    const { data: quizResults } = await supabase
      .from('quiz_resultats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (flashcards) {
      const aReviser = flashcards.filter(fc => new Date(fc.prochaine_revision) <= new Date()).length
      const niveaux = { 0: 0, 1: 0, 2: 0, 3: 0 }
      flashcards.forEach(fc => {
        const n = Math.min(fc.niveau || 0, 3)
        niveaux[n]++
      })

      const quizMoyenne = quizResults?.length > 0
        ? Math.round(quizResults.reduce((acc, q) => acc + q.pourcentage, 0) / quizResults.length)
        : 0

      // Meilleure matière
      let meilleureMatiere = '-'
      if (quizResults?.length > 0) {
        const parMatiere = {}
        quizResults.forEach(q => {
          if (!parMatiere[q.matiere]) parMatiere[q.matiere] = []
          parMatiere[q.matiere].push(q.pourcentage)
        })
        let meilleur = 0
        Object.entries(parMatiere).forEach(([mat, scores]) => {
          const moy = scores.reduce((a, b) => a + b, 0) / scores.length
          if (moy > meilleur) { meilleur = moy; meilleureMatiere = mat }
        })
      }

      setStats({
        flashcardsTotal: flashcards.length,
        flashcardsAReviser: aReviser,
        quizTotal: quizResults?.length || 0,
        quizMoyenne,
        meilleureMatiere,
        flashcardsNiveau: niveaux,
        derniersQuiz: quizResults?.slice(0, 5) || [],
      })
    }
  }

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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a2e5a]">Ravi de te revoir, {prenom} !</h1>
            <p className="text-gray-400 text-sm mt-1">Votre parcours d'apprentissage se poursuit</p>
          </div>
          {stats.flashcardsAReviser > 0 && (
            <a href="/flashcards" className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center gap-2">
              🔔 {stats.flashcardsAReviser} carte{stats.flashcardsAReviser > 1 ? 's' : ''} à réviser
            </a>
          )}
        </div>
      </section>

      {/* STATS AVANCÉES */}
      <section className="px-8 py-8 max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Vos progrès</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{stats.flashcardsTotal}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Flashcards créées</div>
            <div className="text-xs text-gray-400">{stats.flashcardsAReviser > 0 ? `${stats.flashcardsAReviser} à réviser aujourd'hui` : 'Tout est à jour ✓'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{stats.quizTotal}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Quiz complétés</div>
            <div className="text-xs text-gray-400">{stats.quizTotal > 0 ? 'Continuez !' : 'Faites votre premier quiz'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`text-3xl font-bold mb-1 ${stats.quizMoyenne >= 80 ? 'text-green-500' : stats.quizMoyenne >= 50 ? 'text-[#d4af37]' : 'text-[#1a2e5a]'}`}>
              {stats.quizMoyenne > 0 ? `${stats.quizMoyenne}%` : '-'}
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Moyenne aux quiz</div>
            <div className="text-xs text-gray-400">{stats.quizMoyenne >= 80 ? 'Excellent niveau !' : stats.quizMoyenne >= 50 ? 'Bon niveau' : 'En progression'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-lg font-bold text-[#1a2e5a] mb-1 truncate">{stats.meilleureMatiere}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Meilleure matière</div>
            <div className="text-xs text-gray-400">Basé sur vos quiz</div>
          </div>
        </div>

        {/* Progression flashcards par niveau */}
        {stats.flashcardsTotal > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Maîtrise des flashcards (répétitions espacées)</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'À apprendre', color: 'bg-gray-200', count: stats.flashcardsNiveau[0] },
                { label: 'Débutant', color: 'bg-blue-200', count: stats.flashcardsNiveau[1] },
                { label: 'Intermédiaire', color: 'bg-[#d4af37]', count: stats.flashcardsNiveau[2] },
                { label: 'Maîtrisé', color: 'bg-green-400', count: stats.flashcardsNiveau[3] },
              ].map(n => (
                <div key={n.label} className="text-center">
                  <div className={`${n.color} rounded-lg p-3 mb-2`}>
                    <div className="text-xl font-bold text-white">{n.count}</div>
                  </div>
                  <div className="text-xs text-gray-500">{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Derniers quiz */}
        {stats.derniersQuiz.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Derniers quiz</h3>
            <div className="space-y-3">
              {stats.derniersQuiz.map(q => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-[#1a2e5a]">{q.matiere}</div>
                    <div className="text-xs text-gray-400">{q.mode === 'examen' ? '🎓 Mode examen' : '📝 Entraînement'} · {new Date(q.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${q.pourcentage >= 80 ? 'bg-green-100 text-green-600' : q.pourcentage >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'}`}>
                    {q.pourcentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

    </main>
  )
}