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
    evolutionQuiz: [],
    statsParPeriode: { '7j': null, '15j': null, '30j': null, '90j': null },
    questionsRepond usMois: 0,
    joursConnectesSuite: 0,
    calendrierConnexions: [],
    prochainRevisions: [],
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      await enregistrerConnexion(user.id)
      await chargerStats(user.id)
      setLoading(false)
    }
    getUser()
  }, [])

  const enregistrerConnexion = async (userId) => {
    await supabase.from('connexions').upsert(
      { user_id: userId, date: new Date().toISOString().split('T')[0] },
      { onConflict: 'user_id,date' }
    )
  }

  const chargerStats = async (userId) => {
    const maintenant = new Date()

    // Flashcards
    const { data: flashcards } = await supabase
      .from('flashcards').select('*').eq('user_id', userId)

    // Quiz
    const { data: quizResults } = await supabase
      .from('quiz_resultats').select('*').eq('user_id', userId)
      .order('created_at', { ascending: true })

    // Connexions (90 derniers jours)
    const il90jours = new Date(); il90jours.setDate(il90jours.getDate() - 90)
    const { data: connexions } = await supabase
      .from('connexions').select('date').eq('user_id', userId)
      .gte('date', il90jours.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // --- Calculs flashcards ---
    const aReviser = flashcards?.filter(fc => new Date(fc.prochaine_revision) <= maintenant).length || 0
    const niveaux = { 0: 0, 1: 0, 2: 0, 3: 0 }
    flashcards?.forEach(fc => { const n = Math.min(fc.niveau || 0, 3); niveaux[n]++ })

    // Prochaines révisions (7 prochains jours)
    const dans7jours = new Date(); dans7jours.setDate(dans7jours.getDate() + 7)
    const prochainRevisions = []
    for (let i = 0; i <= 7; i++) {
      const jour = new Date(); jour.setDate(jour.getDate() + i)
      const jourStr = jour.toISOString().split('T')[0]
      const count = flashcards?.filter(fc => {
        const rev = new Date(fc.prochaine_revision).toISOString().split('T')[0]
        return rev === jourStr
      }).length || 0
      prochainRevisions.push({ date: jourStr, count, label: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : jour.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }) })
    }

    // --- Calculs quiz ---
    const calculerStatsPeriode = (jours) => {
      const debut = new Date(); debut.setDate(debut.getDate() - jours)
      const filtered = quizResults?.filter(q => new Date(q.created_at) >= debut) || []
      if (filtered.length === 0) return null
      const moy = Math.round(filtered.reduce((acc, q) => acc + q.pourcentage, 0) / filtered.length)
      const questions = filtered.reduce((acc, q) => acc + q.total, 0)
      return { moyenne: moy, count: filtered.length, questions }
    }

    // Évolution 30 derniers jours (groupé par semaine)
    const evolutionQuiz = []
    for (let i = 3; i >= 0; i--) {
      const debut = new Date(); debut.setDate(debut.getDate() - (i + 1) * 7)
      const fin = new Date(); fin.setDate(fin.getDate() - i * 7)
      const filtered = quizResults?.filter(q => {
        const d = new Date(q.created_at)
        return d >= debut && d < fin
      }) || []
      const moy = filtered.length > 0 ? Math.round(filtered.reduce((acc, q) => acc + q.pourcentage, 0) / filtered.length) : null
      evolutionQuiz.push({
        label: `S-${i === 0 ? 'cette sem.' : i}`,
        moyenne: moy,
        count: filtered.length
      })
    }

    // Questions répondues ce mois
    const debutMois = new Date(); debutMois.setDate(1); debutMois.setHours(0,0,0,0)
    const quizMois = quizResults?.filter(q => new Date(q.created_at) >= debutMois) || []
    const questionsMois = quizMois.reduce((acc, q) => acc + q.total, 0)

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

    // --- Calculs connexions ---
    const datesConnexions = new Set(connexions?.map(c => c.date) || [])
    let joursConnectesSuite = 0
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (datesConnexions.has(ds)) joursConnectesSuite++
      else break
    }

    // Calendrier 30 derniers jours
    const calendrier = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      calendrier.push({ date: ds, connecte: datesConnexions.has(ds) })
    }

    setStats({
      flashcardsTotal: flashcards?.length || 0,
      flashcardsAReviser: aReviser,
      quizTotal: quizResults?.length || 0,
      quizMoyenne: calculerStatsPeriode(9999)?.moyenne || 0,
      meilleureMatiere,
      flashcardsNiveau: niveaux,
      derniersQuiz: [...(quizResults || [])].reverse().slice(0, 5),
      evolutionQuiz,
      statsParPeriode: {
        '7j': calculerStatsPeriode(7),
        '15j': calculerStatsPeriode(15),
        '30j': calculerStatsPeriode(30),
        '90j': calculerStatsPeriode(90),
      },
      questionsMois,
      joursConnectesSuite,
      calendrierConnexions: calendrier,
      prochainRevisions,
    })
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
  const maxEvolution = Math.max(...stats.evolutionQuiz.map(e => e.moyenne || 0), 1)

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
            <h1 className="text-2xl font-bold text-[#1a2e5a]">Ravi de te revoir, {prenom} ! 👋</h1>
            <p className="text-gray-400 text-sm mt-1">
              {stats.joursConnectesSuite > 1
                ? `🔥 ${stats.joursConnectesSuite} jours de suite — continuez comme ça !`
                : "Votre parcours d'apprentissage se poursuit"}
            </p>
          </div>
          {stats.flashcardsAReviser > 0 && (
            <a href="/flashcards" className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center gap-2">
              🔔 {stats.flashcardsAReviser} carte{stats.flashcardsAReviser > 1 ? 's' : ''} à réviser
            </a>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

        {/* STATS GLOBALES */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{stats.flashcardsTotal}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Flashcards créées</div>
            <div className="text-xs text-gray-400">{stats.flashcardsAReviser > 0 ? `${stats.flashcardsAReviser} à réviser aujourd'hui` : '✓ Tout est à jour'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{stats.quizTotal}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Quiz complétés</div>
            <div className="text-xs text-gray-400">{stats.questionsMois} questions ce mois</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`text-3xl font-bold mb-1 ${stats.quizMoyenne >= 80 ? 'text-green-500' : stats.quizMoyenne >= 50 ? 'text-[#d4af37]' : 'text-[#1a2e5a]'}`}>
              {stats.quizMoyenne > 0 ? `${stats.quizMoyenne}%` : '-'}
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Score moyen</div>
            <div className="text-xs text-gray-400">{stats.meilleureMatiere !== '-' ? `🏆 ${stats.meilleureMatiere}` : 'Aucun quiz encore'}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{stats.joursConnectesSuite}</div>
            <div className="text-sm font-medium text-gray-600 mb-1">Jours consécutifs</div>
            <div className="text-xs text-gray-400">{stats.joursConnectesSuite >= 7 ? '🔥 En feu !' : stats.joursConnectesSuite >= 3 ? '💪 Bonne série !' : 'Revenez chaque jour'}</div>
          </div>
        </div>

        {/* ÉVOLUTION + CALENDRIER */}
        <div className="grid grid-cols-2 gap-6">

          {/* Évolution taux de réussite */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">📈 Évolution du taux de réussite</h3>
            {stats.evolutionQuiz.every(e => e.moyenne === null) ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Faites des quiz pour voir votre progression</div>
            ) : (
              <div className="flex items-end gap-3 h-32">
                {stats.evolutionQuiz.map((sem, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-[#1a2e5a]">{sem.moyenne !== null ? `${sem.moyenne}%` : '-'}</span>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: sem.moyenne !== null ? `${Math.max((sem.moyenne / 100) * 96, 8)}px` : '8px',
                        backgroundColor: sem.moyenne !== null
                          ? sem.moyenne >= 80 ? '#22c55e' : sem.moyenne >= 50 ? '#d4af37' : '#1a2e5a'
                          : '#e5e7eb'
                      }}>
                    </div>
                    <span className="text-xs text-gray-400 text-center">{sem.label}</span>
                    {sem.count > 0 && <span className="text-xs text-gray-300">{sem.count} quiz</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendrier connexions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">📅 Jours de connexion (30 derniers jours)</h3>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {stats.calendrierConnexions.map((jour, i) => (
                <div key={i}
                  title={jour.date}
                  className={`w-6 h-6 rounded-sm ${jour.connecte ? 'bg-[#1a2e5a]' : 'bg-gray-100'}`}>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-gray-100"></div> Absent</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#1a2e5a]"></div> Connecté</div>
            </div>
          </div>
        </div>

        {/* STATS QCM PAR PÉRIODE */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">🎯 Performances QCM par période</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '7 derniers jours', key: '7j' },
              { label: '15 derniers jours', key: '15j' },
              { label: '30 derniers jours', key: '30j' },
              { label: '90 derniers jours', key: '90j' },
            ].map(({ label, key }) => {
              const s = stats.statsParPeriode[key]
              return (
                <div key={key} className="border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400 mb-2">{label}</div>
                  {s ? (
                    <>
                      <div className={`text-2xl font-bold mb-1 ${s.moyenne >= 80 ? 'text-green-500' : s.moyenne >= 50 ? 'text-[#d4af37]' : 'text-red-500'}`}>
                        {s.moyenne}%
                      </div>
                      <div className="text-xs text-gray-400">{s.count} quiz · {s.questions} questions</div>
                    </>
                  ) : (
                    <div className="text-gray-300 text-sm mt-2">—</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RAPPELS RÉVISIONS FLASHCARDS */}
        {stats.flashcardsTotal > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">🔔 Planning de révision des flashcards</h3>
            <p className="text-xs text-gray-400 mb-4">Basé sur l'algorithme de répétition espacée (SM-2)</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stats.prochainRevisions.map((jour, i) => (
                <div key={i} className={`flex-shrink-0 text-center rounded-xl p-4 min-w-16 border ${
                  i === 0 && jour.count > 0 ? 'bg-[#d4af37] border-[#d4af37] text-white' :
                  jour.count > 0 ? 'bg-[#eef1f8] border-[#1a2e5a]' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-xl font-bold ${i === 0 && jour.count > 0 ? 'text-white' : jour.count > 0 ? 'text-[#1a2e5a]' : 'text-gray-300'}`}>
                    {jour.count}
                  </div>
                  <div className={`text-xs mt-1 ${i === 0 && jour.count > 0 ? 'text-white' : 'text-gray-400'}`}>
                    {jour.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Intervalles : 1j → 3j → 7j → 14j → 1 mois → 3 mois
            </div>
          </div>
        )}

        {/* MAÎTRISE FLASHCARDS */}
        {stats.flashcardsTotal > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">🃏 Maîtrise des flashcards</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'À apprendre', color: 'bg-gray-300', count: stats.flashcardsNiveau[0] },
                { label: 'Débutant', color: 'bg-blue-400', count: stats.flashcardsNiveau[1] },
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

        {/* DERNIERS QUIZ */}
        {stats.derniersQuiz.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">📝 Derniers quiz</h3>
            <div className="space-y-3">
              {stats.derniersQuiz.map(q => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-[#1a2e5a]">{q.matiere}</div>
                    <div className="text-xs text-gray-400">
                      {q.mode === 'examen' ? '🎓 Mode examen' : '📝 Entraînement'} · {new Date(q.created_at).toLocaleDateString('fr-FR')} · {q.total} questions
                    </div>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${q.pourcentage >= 80 ? 'bg-green-100 text-green-600' : q.pourcentage >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'}`}>
                    {q.pourcentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCÈS RAPIDE */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Accès rapide</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '⚖️', title: 'Assistant ORTHOS', desc: "Posez vos questions juridiques, structurez vos dissertations et commentaires d'arrêt.", cta: 'Ouvrir le chat', href: '/chat', color: 'bg-[#eef1f8]' },
              { icon: '🃏', title: 'Flashcards', desc: 'Révisez les notions clés avec des flashcards interactives basées sur la répétition espacée.', cta: 'Commencer', href: '/flashcards', color: 'bg-[#f0fdf4]' },
              { icon: '🎯', title: 'Quiz', desc: "Testez vos connaissances avec des QCM générés par l'IA et suivez votre progression.", cta: 'Faire un quiz', href: '/quiz', color: 'bg-[#fefce8]' },
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
        </div>

      </div>
    </main>
  )
}