'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const FLASHCARDS_DEFAULT = {
  'Droit civil': [
    { q: "Qu'est-ce que la responsabilité civile délictuelle ?", r: "C'est l'obligation de réparer le dommage causé à autrui par son fait personnel, le fait des choses ou le fait d'autrui. Elle est fondée sur les articles 1240 et suivants du Code civil." },
    { q: "Quelles sont les conditions de la responsabilité civile ?", r: "Trois conditions cumulatives : un fait générateur (faute, fait de la chose ou d'autrui), un dommage (certain, direct et personnel) et un lien de causalité entre les deux." },
    { q: "Quelle est la différence entre nullité absolue et nullité relative ?", r: "La nullité absolue sanctionne la violation d'une règle d'ordre public (tout intéressé peut l'invoquer). La nullité relative protège un intérêt privé (seule la partie protégée peut l'invoquer)." },
    { q: "Qu'est-ce que le dol en droit des contrats ?", r: "Le dol est une manœuvre frauduleuse d'une partie pour obtenir le consentement de l'autre. Il constitue un vice du consentement entraînant la nullité relative du contrat (art. 1137 C.civ)." },
    { q: "Définissez la force majeure.", r: "Événement imprévisible, irrésistible et extérieur qui empêche l'exécution du contrat. Elle exonère le débiteur de sa responsabilité contractuelle (art. 1218 C.civ)." },
  ],
  'Droit constitutionnel': [
    { q: "Qu'est-ce que la séparation des pouvoirs ?", r: "Principe selon lequel les fonctions législative, exécutive et judiciaire doivent être exercées par des organes distincts pour éviter la concentration du pouvoir et garantir les libertés." },
    { q: "Qu'est-ce que le bloc de constitutionnalité ?", r: "Ensemble des normes de valeur constitutionnelle servant de référence au contrôle de constitutionnalité : la Constitution de 1958, la DDHC de 1789, le Préambule de 1946 et la Charte de l'environnement." },
    { q: "Qu'est-ce que la QPC ?", r: "La Question Prioritaire de Constitutionnalité permet à tout justiciable de contester la constitutionnalité d'une loi lors d'un procès. Introduite par la révision constitutionnelle de 2008." },
    { q: "Quel est le rôle du Conseil constitutionnel ?", r: "Il contrôle la conformité des lois à la Constitution, veille à la régularité des élections et référendums, et proclame les résultats." },
  ],
  'Droit pénal': [
    { q: "Quels sont les éléments constitutifs d'une infraction ?", r: "Trois éléments cumulatifs : l'élément légal (texte d'incrimination), l'élément matériel (acte ou omission) et l'élément moral (intention ou imprudence)." },
    { q: "Quelle est la différence entre crime, délit et contravention ?", r: "Les crimes sont jugés par la cour d'assises, les délits par le tribunal correctionnel, les contraventions par le tribunal de police." },
    { q: "Qu'est-ce que la légitime défense ?", r: "Fait justificatif exonérant de responsabilité pénale lorsqu'on répond à une atteinte injustifiée par un acte nécessaire, simultané et proportionné (art. 122-5 C.pén)." },
  ],
  'Droit administratif': [
    { q: "Qu'est-ce que le principe de légalité ?", r: "Principe selon lequel l'administration est soumise au droit. Ses actes doivent être conformes à la hiérarchie des normes : Constitution, traités, lois, règlements." },
    { q: "Qu'est-ce qu'un recours pour excès de pouvoir ?", r: "Recours contentieux permettant d'annuler un acte administratif illégal. Il peut être fondé sur l'incompétence, le vice de forme ou la violation de la loi." },
    { q: "Définissez le service public.", r: "Activité d'intérêt général assurée ou contrôlée par une personne publique. Il obéit aux lois de Rolland : continuité, égalité et adaptabilité." },
  ],
}

// Algorithme SM-2 de répétition espacée
function calculerProchainRevision(niveau, succes) {
  const maintenant = new Date()
  let joursAvant = 1
  if (succes) {
    if (niveau === 0) joursAvant = 1
    else if (niveau === 1) joursAvant = 3
    else if (niveau === 2) joursAvant = 7
    else if (niveau === 3) joursAvant = 14
    else joursAvant = 30
  } else {
    joursAvant = 1
  }
  maintenant.setDate(maintenant.getDate() + joursAvant)
  return maintenant.toISOString()
}

export default function Flashcards() {
  const [mode, setMode] = useState('browse')
  const [categories, setCategories] = useState(FLASHCARDS_DEFAULT)
  const [selectedCat, setSelectedCat] = useState(Object.keys(FLASHCARDS_DEFAULT)[0])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [known, setKnown] = useState([])
  const [toReview, setToReview] = useState([])
  const [user, setUser] = useState(null)
  const [mesFlashcards, setMesFlashcards] = useState([])
  const [chargement, setChargement] = useState(false)

  const [genText, setGenText] = useState('')
  const [genTitle, setGenTitle] = useState('')
  const [genFile, setGenFile] = useState('')
  const [genFileName, setGenFileName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        chargerMesFlashcards(data.user.id)
      }
    })
  }, [])

  // Charger les flashcards sauvegardées
  const chargerMesFlashcards = async (userId) => {
    setChargement(true)
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      // Grouper par matière
      const groupees = {}
      data.forEach(card => {
        const cat = card.matiere || 'Mes flashcards'
        if (!groupees[cat]) groupees[cat] = []
        groupees[cat].push({ q: card.question, r: card.reponse, id: card.id, niveau: card.niveau })
      })
      setCategories(prev => ({ ...groupees, ...prev }))
      setMesFlashcards(data)
    }
    setChargement(false)
  }

  // Sauvegarder une flashcard dans Supabase
  const sauvegarderFlashcard = async (question, reponse, matiere) => {
    if (!user) return null
    const { data, error } = await supabase.from('flashcards').insert({
      user_id: user.id,
      question,
      reponse,
      matiere,
      niveau: 0,
      prochaine_revision: new Date().toISOString(),
      nb_revisions: 0,
    }).select()
    if (error) console.error('Erreur sauvegarde:', error)
    return data?.[0] || null
  }

  // Mettre à jour le niveau après révision (répétition espacée)
  const mettreAJourNiveau = async (cardId, succes, niveauActuel) => {
    if (!user || !cardId) return
    const nouveauNiveau = succes ? niveauActuel + 1 : 0
    const prochaineRevision = calculerProchainRevision(niveauActuel, succes)
    await supabase.from('flashcards').update({
      niveau: nouveauNiveau,
      prochaine_revision: prochaineRevision,
      nb_revisions: (niveauActuel || 0) + 1,
    }).eq('id', cardId)
  }

  const cards = categories[selectedCat] || []
  const card = cards[index]
  const total = cards.length
  const progress = total > 0 ? Math.round((index / total) * 100) : 0

  const changeCategory = (cat) => {
    setSelectedCat(cat)
    setIndex(0)
    setRevealed(false)
    setKnown([])
    setToReview([])
  }

  const handleKnown = () => {
    if (card?.id) mettreAJourNiveau(card.id, true, card.niveau || 0)
    setKnown(prev => [...prev, index])
    next()
  }

  const handleReview = () => {
    if (card?.id) mettreAJourNiveau(card.id, false, card.niveau || 0)
    setToReview(prev => [...prev, index])
    next()
  }

  const next = () => {
    setRevealed(false)
    if (index < total - 1) setIndex(index + 1)
    else setIndex(total)
  }

  const reset = () => { setIndex(0); setRevealed(false); setKnown([]); setToReview([]) }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setGenFileName(file.name)
    if (file.type === 'application/pdf') {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      setGenFile(data.text || '')
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => setGenFile(ev.target.result)
      reader.readAsText(file)
    }
  }

  const generateFlashcards = async () => {
    if (!genTitle.trim()) { setGenError('Donnez un titre à votre set de flashcards.'); return }
    const content = genFile || genText
    if (!content.trim()) { setGenError('Collez votre cours ou déposez un fichier.'); return }
    setGenerating(true)
    setGenError('')

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: genTitle, content: content.substring(0, 4000) })
      })
      const data = await res.json()
      if (data.flashcards && data.flashcards.length > 0) {

        // Sauvegarder chaque flashcard dans Supabase si connecté
        const flashcardsAvecId = await Promise.all(
          data.flashcards.map(async (fc) => {
            const saved = await sauvegarderFlashcard(fc.q, fc.r, genTitle)
            return { ...fc, id: saved?.id, niveau: 0 }
          })
        )

        setCategories(prev => ({ [genTitle]: flashcardsAvecId, ...prev }))
        setSelectedCat(genTitle)
        setIndex(0)
        setRevealed(false)
        setKnown([])
        setToReview([])
        setMode('browse')
        setGenText('')
        setGenTitle('')
        setGenFile('')
        setGenFileName('')
      } else {
        setGenError("Impossible de générer les flashcards. Réessayez.")
      }
    } catch {
      setGenError("Une erreur s'est produite. Vérifiez votre connexion.")
    }
    setGenerating(false)
  }

  // Flashcards à réviser aujourd'hui (répétitions espacées)
  const aReviserAujourdhui = mesFlashcards.filter(fc => {
    const prochaine = new Date(fc.prochaine_revision)
    return prochaine <= new Date()
  })

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-8">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Dashboard</a>
          <a href="/chat" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Assistant IA</a>
          <a href="/quiz" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Quiz</a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#f4f5f7] px-8 py-10 text-center">
        <h1 className="text-3xl font-bold text-[#1a2e5a] mb-2">Flashcards</h1>
        <p className="text-gray-500 mb-6">Révisez les notions clés ou générez vos propres flashcards depuis votre cours.</p>

        {/* Bandeau répétitions espacées */}
        {user && aReviserAujourdhui.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-[#d4af37] text-white px-5 py-2 rounded-xl text-sm font-medium mb-4">
            🔔 {aReviserAujourdhui.length} flashcard{aReviserAujourdhui.length > 1 ? 's' : ''} à réviser aujourd'hui
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => setMode('browse')}
            className={`px-5 py-2 rounded-xl text-sm font-medium border transition ${mode === 'browse' ? 'bg-[#1a2e5a] text-white border-[#1a2e5a]' : 'bg-white border-gray-200 text-gray-500 hover:border-[#1a2e5a]'}`}>
            Réviser les flashcards
          </button>
          <button onClick={() => setMode('generate')}
            className={`px-5 py-2 rounded-xl text-sm font-medium border transition ${mode === 'generate' ? 'bg-[#1a2e5a] text-white border-[#1a2e5a]' : 'bg-white border-gray-200 text-gray-500 hover:border-[#1a2e5a]'}`}>
            ✨ Générer avec mon cours
          </button>
          {!user && (
            <a href="/auth"
              className="px-5 py-2 rounded-xl text-sm font-medium border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition">
              🔒 Connectez-vous pour sauvegarder
            </a>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-8 pb-16">

        {/* MODE GÉNÉRATION */}
        {mode === 'generate' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#1a2e5a] mb-2">Générer des flashcards avec l'IA</h2>
            <p className="text-sm text-gray-400 mb-6">Collez votre cours ou déposez un fichier — ORTHOS génère automatiquement des flashcards personnalisées.</p>
            {!user && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-4">
                ⚠️ Connectez-vous pour sauvegarder vos flashcards et bénéficier des répétitions espacées.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du set</label>
                <input type="text" value={genTitle} onChange={e => setGenTitle(e.target.value)}
                  placeholder="Ex: Contrats spéciaux L2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre cours</label>
                <textarea value={genText} onChange={e => setGenText(e.target.value)}
                  placeholder="Collez ici le contenu de votre cours, vos notes, ou le texte de votre TD…"
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
              <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${genFileName ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-[#1a2e5a]'}`}>
                <span className="text-2xl">📎</span>
                <div>
                  <div className="text-sm font-medium text-gray-700">{genFileName || 'Déposer un fichier PDF ou TXT'}</div>
                  <div className="text-xs text-gray-400">ORTHOS analysera le document</div>
                </div>
                <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFile} />
              </label>
              {genError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{genError}</div>
              )}
              <button onClick={generateFlashcards} disabled={generating}
                className="w-full bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Génération en cours…</>
                ) : '✨ Générer mes flashcards'}
              </button>
            </div>
          </div>
        )}

        {/* MODE RÉVISION */}
        {mode === 'browse' && (
          <>
            <div className="flex gap-3 mb-8 flex-wrap">
              {Object.keys(categories).map(cat => (
                <button key={cat} onClick={() => changeCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedCat === cat ? 'bg-[#1a2e5a] text-white border-[#1a2e5a]' : 'bg-white border-gray-200 text-gray-500 hover:border-[#1a2e5a]'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Carte {Math.min(index + 1, total)} sur {total}</span>
              <div className="flex gap-4 text-xs">
                <span className="text-green-500 font-medium">✓ {known.length} sus</span>
                <span className="text-orange-400 font-medium">↺ {toReview.length} à revoir</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
              <div className="bg-[#1a2e5a] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>

            {index < total ? (
              <div>
                <div onClick={() => setRevealed(!revealed)}
                  className="bg-white border border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#1a2e5a] transition min-h-64 flex flex-col items-center justify-center gap-6">
                  {!revealed ? (
                    <>
                      <div className="text-4xl">❓</div>
                      <h2 className="text-xl font-semibold text-[#1a2e5a] leading-relaxed">{card.q}</h2>
                      <p className="text-sm text-gray-400">Cliquez pour révéler la réponse</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl">💡</div>
                      <h2 className="text-lg font-semibold text-[#1a2e5a] mb-2">{card.q}</h2>
                      {card.niveau > 0 && (
                        <div className="flex gap-1">
                          {[...Array(Math.min(card.niveau, 5))].map((_, i) => (
                            <span key={i} className="text-[#d4af37] text-xs">★</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">Niveau {card.niveau}</span>
                        </div>
                      )}
                      <div className="w-full border-t border-gray-100 pt-6">
                        <p className="text-gray-700 leading-relaxed">{card.r}</p>
                      </div>
                    </>
                  )}
                </div>

                {revealed && (
                  <div className="flex gap-4 mt-6">
                    <button onClick={handleReview}
                      className="flex-1 border-2 border-orange-300 text-orange-500 py-3 rounded-xl font-medium hover:bg-orange-50 transition">
                      ↺ À revoir
                    </button>
                    <button onClick={handleKnown}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
                      ✓ Je sais
                    </button>
                  </div>
                )}

                {!revealed && (
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => index > 0 && (setIndex(index - 1), setRevealed(false))}
                      disabled={index === 0}
                      className="flex-1 border border-gray-200 text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50 transition disabled:opacity-30">
                      ← Précédente
                    </button>
                    <button onClick={() => setRevealed(true)}
                      className="flex-1 bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
                      Révéler la réponse
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">Session terminée !</h2>
                <p className="text-gray-500 mb-8">Vous avez révisé toutes les cartes de cette matière.</p>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">{known.length}</div>
                    <div className="text-sm text-green-500">Maîtrisées</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-500">{toReview.length}</div>
                    <div className="text-sm text-orange-400">À revoir</div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <button onClick={reset}
                    className="bg-[#1a2e5a] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
                    Recommencer
                  </button>
                  <button onClick={() => setMode('generate')}
                    className="border border-gray-200 text-gray-500 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                    ✨ Générer avec mon cours
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}