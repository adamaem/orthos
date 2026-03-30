'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNotifPopup, setShowNotifPopup] = useState(false)
  const [stats, setStats] = useState({
    flashcardsTotal: 0,
    flashcardsAReviser: 0,
    flashcardsAReviserDetails: [],
    quizTotal: 0,
    quizMoyenne: 0,
    meilleureMatiere: '-',
    flashcardsNiveau: { 0: 0, 1: 0, 2: 0, 3: 0 },
    derniersQuiz: [],
    evolutionQuiz: [],
    statsParPeriode: { '7j': null, '15j': null, '30j': null, '90j': null },
    questionsMois: 0,
    joursConnectesSuite: 0,
    calendrierMois: [],
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

    const { data: flashcards } = await supabase
      .from('flashcards').select('*').eq('user_id', userId)

    const { data: quizResults } = await supabase
      .from('quiz_resultats').select('*').eq('user_id', userId)
      .order('created_at', { ascending: true })

    const il90jours = new Date(); il90jours.setDate(il90jours.getDate() - 90)
    const { data: connexions } = await supabase
      .from('connexions').select('date').eq('user_id', userId)
      .gte('date', il90jours.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // --- Flashcards à réviser ---
    const aReviserDetails = flashcards?.filter(fc => new Date(fc.prochaine_revision) <= maintenant) || []
    const aReviser = aReviserDetails.length

    // Afficher popup si cartes à réviser
    if (aReviser > 0) setShowNotifPopup(true)

    const niveaux = { 0: 0, 1: 0, 2: 0, 3: 0 }
    flashcards?.forEach(fc => { const n = Math.min(fc.niveau || 0, 3); niveaux[n]++ })

    // Prochaines révisions (8 prochains jours)
    const prochainRevisions = []
    for (let i = 0; i <= 7; i++) {
      const jour = new Date(); jour.setDate(jour.getDate() + i)
      const jourStr = jour.toISOString().split('T')[0]
      const count = flashcards?.filter(fc => {
        const rev = new Date(fc.prochaine_revision).toISOString().split('T')[0]
        return rev === jourStr
      }).length || 0
      prochainRevisions.push({
        date: jourStr, count,
        label: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : jour.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
      })
    }

    // --- Quiz ---
    const calculerStatsPeriode = (jours) => {
      const debut = new Date(); debut.setDate(debut.getDate() - jours)
      const filtered = quizResults?.filter(q => new Date(q.created_at) >= debut) || []
      if (filtered.length === 0) return null
      const moy = Math.round(filtered.reduce((acc, q) => acc + q.pourcentage, 0) / filtered.length)
      const questions = filtered.reduce((acc, q) => acc + q.total, 0)
      return { moyenne: moy, count: filtered.length, questions }
    }

    const evolutionQuiz = []
    for (let i = 3; i >= 0; i--) {
      const debut = new Date(); debut.setDate(debut.getDate() - (i + 1) * 7)
      const fin = new Date(); fin.setDate(fin.getDate() - i * 7)
      const filtered = quizResults?.filter(q => {
        const d = new Date(q.created_at)
        return d >= debut && d < fin
      }) || []
      const moy = filtered.length > 0 ? Math.round(filtered.reduce((acc, q) => acc + q.pourcentage, 0) / filtered.length) : null
      evolutionQuiz.push({ label: i === 0 ? 'Cette sem.' : `S-${i}`, moyenne: moy, count: filtered.length })
    }

    const debutMois = new Date(); debutMois.setDate(1); debutMois.setHours(0,0,0,0)
    const quizMois = quizResults?.filter(q => new Date(q.created_at) >= debutMois) || []
    const questionsMois = quizMois.reduce((acc, q) => acc + q.total, 0)

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

    // --- Connexions ---
    const datesConnexions = new Set(connexions?.map(c => c.date) || [])
    let joursConnectesSuite = 0
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (datesConnexions.has(ds)) joursConnectesSuite++
      else break
    }

    // Calendrier mois complet (comme Google Calendar)
    const maintenant2 = new Date()
    const annee = maintenant2.getFullYear()
    const mois = maintenant2.getMonth()
    const premierJourMois = new Date(annee, mois, 1)
    const dernierJourMois = new Date(annee, mois + 1, 0)
    // Jour de la semaine du 1er (0=dim, on veut 0=lun)
    let premierJourSemaine = premierJourMois.getDay()
    premierJourSemaine = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1

    const calendrierMois = []
    // Cases vides avant le 1er
    for (let i = 0; i < premierJourSemaine; i++) {
      calendrierMois.push({ vide: true })
    }
    // Jours du mois
    for (let j = 1; j <= dernierJourMois.getDate(); j++) {
      const d = new Date(annee, mois, j)
      const ds = d.toISOString().split('T')[0]
      const estAujourdhui = j === maintenant2.getDate()
      const estConnecte = datesConnexions.has(ds)
      // Compter flashcards à réviser ce jour
      const flashcardsJour = flashcards?.filter(fc => {
        const rev = new Date(fc.prochaine_revision).toISOString().split('T')[0]
        return rev === ds
      }).length || 0
      calendrierMois.push({ vide: false, jour: j, ds, estAujourdhui, estConnecte, flashcardsJour })
    }

    setStats({
      flashcardsTotal: flashcards?.length || 0,
      flashcardsAReviser: aReviser,
      flashcardsAReviserDetails: aReviserDetails,
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
      calendrierMois,
      prochainRevisions,
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Flammes selon la série
  const getFlammes = (jours) => {
    if (jours >= 30) return '🔥🔥🔥'
    if (jours >= 14) return '🔥🔥'
    if (jours >= 3) return '🔥'
    return '✨'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
      <div className="text-[#1a2e5a] font-medium">Chargement…</div>
    </div>
  )

  const prenom = user?.user_metadata?.full_name?.split(' ')[0] || 'Étudiant'
  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  const moisActuel = moisNoms[new Date().getMonth()]
  const anneeActuelle = new Date().getFullYear()

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-sans">

      {/* POPUP NOTIFICATION RÉVISION */}
      {showNotifPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-4xl mb-4 text-center">🔔</div>
            <h2 className="text-xl font-bold text-[#1a2e5a] text-center mb-2">
              {stats.flashcardsAReviser} flashcard{stats.flashcardsAReviser > 1 ? 's' : ''} à réviser !
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              L'algorithme de répétition espacée a sélectionné ces cartes pour maximiser votre mémorisation.
            </p>
            {/* Aperçu des matières à réviser */}
            <div className="bg-[#f4f5f7] rounded-xl p-4 mb-6 max-h-32 overflow-y-auto">
              {Object.entries(
                stats.flashcardsAReviserDetails.reduce((acc, fc) => {
                  const mat = fc.matiere || 'Mes flashcards'
                  acc[mat] = (acc[mat] || 0) + 1
                  return acc
                }, {})
              ).map(([mat, count]) => (
                <div key={mat} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{mat}</span>
                  <span className="font-semibold text-[#1a2e5a]">{count} carte{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNotifPopup(false)}
                className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Plus tard
              </button>
              <a href="/flashcards"
                className="flex-1 bg-[#d4af37] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition text-center">
                Réviser maintenant →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-40">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-6">
          <a href="/chat" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Assistant IA</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
          {/* Badge notification navbar */}
          {stats.flashcardsAReviser > 0 && (
            <button onClick={() => setShowNotifPopup(true)}
              className="relative text-gray-400 hover:text-[#1a2e5a] transition">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {stats.flashcardsAReviser > 9 ? '9+' : stats.flashcardsAReviser}
              </span>
            </button>
          )}
           <a href="/profil" className="w-8 h-8 rounded-full bg-[#1a2e5a] flex items-center justify-center text-[#d4af37] font-bold text-sm hover:opacity-80 transition">
          {prenom[0].toUpperCase()} 
          </a> 
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
                ? `${getFlammes(stats.joursConnectesSuite)} ${stats.joursConnectesSuite} jours de suite — continuez comme ça !`
                : "Votre parcours d'apprentissage se poursuit"}
            </p>
          </div>
          {stats.flashcardsAReviser > 0 && (
            <button onClick={() => setShowNotifPopup(true)}
              className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center gap-2">
              🔔 {stats.flashcardsAReviser} carte{stats.flashcardsAReviser > 1 ? 's' : ''} à réviser
            </button>
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
            <div className="text-3xl font-bold text-[#1a2e5a] mb-1">
              {getFlammes(stats.joursConnectesSuite)} {stats.joursConnectesSuite}
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Jours consécutifs</div>
            <div className="text-xs text-gray-400">{stats.joursConnectesSuite >= 30 ? '🏆 Légendaire !' : stats.joursConnectesSuite >= 14 ? '🔥🔥 En feu !' : stats.joursConnectesSuite >= 7 ? '🔥 Excellente série !' : stats.joursConnectesSuite >= 3 ? '💪 Bonne série !' : 'Revenez chaque jour'}</div>
          </div>
        </div>

        {/* ÉVOLUTION + CALENDRIER MOIS */}
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
                        height: sem.moyenne !== null ? `${Math.max((sem.moyenne / 100) * 80, 8)}px` : '8px',
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

          {/* VRAI CALENDRIER MOIS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">📅 {moisActuel} {anneeActuelle}</h3>
            <p className="text-xs text-gray-400 mb-3">Connexions et révisions du mois</p>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 mb-1">
              {['L','M','M','J','V','S','D'].map((j, i) => (
                <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{j}</div>
              ))}
            </div>

            {/* Grille calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {stats.calendrierMois.map((cell, i) => {
                if (cell.vide) return <div key={i}></div>
                return (
                  <div key={i}
                    title={cell.flashcardsJour > 0 ? `${cell.flashcardsJour} carte(s) à réviser` : ''}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition cursor-default
                      ${cell.estAujourdhui ? 'ring-2 ring-[#1a2e5a]' : ''}
                      ${cell.estConnecte ? 'bg-[#1a2e5a] text-white' : 'bg-gray-50 text-gray-500'}
                    `}>
                    <span>{cell.jour}</span>
                    {cell.estConnecte && <span className="text-xs leading-none">🔥</span>}
                    {cell.flashcardsJour > 0 && !cell.estConnecte && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#1a2e5a]"></div> Connecté 🔥</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div> Absent</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#d4af37]"></div> Révisions</div>
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

        {/* PLANNING RÉVISION FLASHCARDS */}
        {stats.flashcardsTotal > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">🔔 Planning de révision des flashcards</h3>
            <p className="text-xs text-gray-400 mb-4">Intervalles SM-2 : 1j → 3j → 7j → 14j → 1 mois → 3 mois</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stats.prochainRevisions.map((jour, i) => (
                <div key={i} className={`flex-shrink-0 text-center rounded-xl p-4 w-20 border transition ${
                  i === 0 && jour.count > 0 ? 'bg-[#d4af37] border-[#d4af37]' :
                  jour.count > 0 ? 'bg-[#eef1f8] border-[#1a2e5a]' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-xl font-bold ${
                    i === 0 && jour.count > 0 ? 'text-white' :
                    jour.count > 0 ? 'text-[#1a2e5a]' : 'text-gray-300'
                  }`}>
                    {jour.count > 0 ? jour.count : '—'}
                  </div>
                  <div className={`text-xs mt-1 leading-tight ${
                    i === 0 && jour.count > 0 ? 'text-white' : 'text-gray-400'
                  }`}>
                    {jour.label}
                  </div>
                  {i === 0 && jour.count > 0 && (
                    <div className="text-xs text-white mt-1 font-medium">À faire !</div>
                  )}
                </div>
              ))}
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