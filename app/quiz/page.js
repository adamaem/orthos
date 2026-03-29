'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const QUIZ_DEFAULT = {
  'Droit civil': [
    { q: "Quel article du Code civil définit la responsabilité délictuelle ?", choices: ["Art. 1240", "Art. 1103", "Art. 1353", "Art. 1217"], answer: 0, explication: "L'article 1240 du Code civil dispose que 'tout fait quelconque de l'homme, qui cause à autrui un dommage, oblige celui par la faute duquel il est arrivé à le réparer'." },
    { q: "Quels sont les vices du consentement en droit des contrats ?", choices: ["L'erreur, le dol et la violence", "L'erreur, la lésion et le dol", "Le dol, la fraude et la violence", "L'erreur, l'incapacité et la violence"], answer: 0, explication: "Les trois vices du consentement sont l'erreur (art. 1132), le dol (art. 1137) et la violence (art. 1140) du Code civil." },
    { q: "Quelle est la durée de la prescription de droit commun en matière civile ?", choices: ["5 ans", "10 ans", "20 ans", "30 ans"], answer: 0, explication: "Depuis la loi du 17 juin 2008, la prescription de droit commun est de 5 ans (art. 2224 C.civ)." },
    { q: "Qu'est-ce que la nullité relative ?", choices: ["Elle protège un intérêt privé et seule la partie protégée peut l'invoquer", "Elle sanctionne l'ordre public et tout intéressé peut l'invoquer", "Elle est prononcée d'office par le juge", "Elle rend le contrat inexistant"], answer: 0, explication: "La nullité relative protège un intérêt privé. Seule la partie que la loi entend protéger peut l'invoquer." },
    { q: "Quelle condition n'est PAS requise pour la force majeure ?", choices: ["La prévisibilité", "L'irrésistibilité", "L'extériorité", "L'imprévisibilité"], answer: 0, explication: "La force majeure requiert l'imprévisibilité, l'irrésistibilité et l'extériorité." },
  ],
  'Droit constitutionnel': [
    { q: "En quelle année a été adoptée la Constitution française actuelle ?", choices: ["1958", "1946", "1789", "1962"], answer: 0, explication: "La Constitution de la Ve République a été adoptée le 4 octobre 1958." },
    { q: "Qu'est-ce que le bloc de constitutionnalité ?", choices: ["La Constitution de 1958, la DDHC de 1789, le Préambule de 1946 et la Charte de l'environnement", "Uniquement la Constitution de 1958", "La Constitution et les lois organiques", "La Constitution et les traités internationaux"], answer: 0, explication: "Le bloc de constitutionnalité regroupe toutes les normes de valeur constitutionnelle." },
    { q: "Qui peut saisir le Conseil constitutionnel pour un contrôle a priori ?", choices: ["Le Président, le Premier ministre, les présidents des assemblées ou 60 parlementaires", "Tout citoyen français", "Uniquement le Président de la République", "Les juridictions ordinaires"], answer: 0, explication: "Depuis 1974, 60 députés ou 60 sénateurs peuvent saisir le Conseil constitutionnel." },
    { q: "Qu'est-ce que la QPC ?", choices: ["Question Prioritaire de Constitutionnalité", "Question Préalable de Constitutionnalité", "Question Principale de Constitutionnalité", "Question Particulière de Constitutionnalité"], answer: 0, explication: "La QPC permet à tout justiciable de contester la constitutionnalité d'une loi lors d'un procès." },
  ],
  'Droit pénal': [
    { q: "Quel est le principe fondamental du droit pénal concernant les infractions ?", choices: ["Nullum crimen, nulla poena sine lege", "Nemo censetur ignorare legem", "In dubio pro reo", "Actus reus"], answer: 0, explication: "Le principe de légalité signifie qu'il n'y a pas d'infraction ni de peine sans texte." },
    { q: "Devant quelle juridiction sont jugés les crimes ?", choices: ["La cour d'assises", "Le tribunal correctionnel", "Le tribunal de police", "La cour d'appel"], answer: 0, explication: "Les crimes sont jugés par la cour d'assises." },
    { q: "Quels sont les éléments constitutifs d'une infraction pénale ?", choices: ["Élément légal, matériel et moral", "Élément matériel et intentionnel uniquement", "Élément légal et matériel uniquement", "Élément moral et intentionnel"], answer: 0, explication: "Toute infraction pénale nécessite trois éléments cumulatifs : légal, matériel et moral." },
  ],
  'Droit administratif': [
    { q: "Quelle est la juridiction administrative suprême en France ?", choices: ["Le Conseil d'État", "La Cour de cassation", "Le Conseil constitutionnel", "La Cour administrative d'appel"], answer: 0, explication: "Le Conseil d'État est la juridiction administrative suprême." },
    { q: "Quelles sont les lois de Rolland régissant le service public ?", choices: ["Continuité, égalité et mutabilité", "Continuité, neutralité et gratuité", "Égalité, efficacité et neutralité", "Continuité, transparence et égalité"], answer: 0, explication: "Les trois lois de Rolland sont : continuité, égalité et mutabilité." },
  ],
}

const TEMPS_PAR_QUESTION = 30 // secondes en mode examen

export default function Quiz() {
  const categories = Object.keys(QUIZ_DEFAULT)
  const [user, setUser] = useState(null)
  const [selectedCat, setSelectedCat] = useState('')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [tried, setTried] = useState(0)
  const [finished, setFinished] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genText, setGenText] = useState('')
  const [genTitle, setGenTitle] = useState('')
  const [genFileName, setGenFileName] = useState('')
  const [genFile, setGenFile] = useState('')
  const [genError, setGenError] = useState('')
  const [mode, setMode] = useState('home')
  const [modeExamen, setModeExamen] = useState(false)
  const [tempsRestant, setTempsRestant] = useState(TEMPS_PAR_QUESTION)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  // Timer mode examen
  useEffect(() => {
    if (mode === 'quiz' && modeExamen && !confirmed && !finished) {
      setTempsRestant(TEMPS_PAR_QUESTION)
      timerRef.current = setInterval(() => {
        setTempsRestant(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            // Temps écoulé → forcer la confirmation sans bonne réponse
            setConfirmed(true)
            setTried(prev => prev + 1)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [current, mode, modeExamen, confirmed, finished])

  const sauvegarderResultat = async (scoreF, totalF, pourcentageF, modeF) => {
    if (!user) return
    await supabase.from('quiz_resultats').insert({
      user_id: user.id,
      matiere: selectedCat,
      score: scoreF,
      total: totalF,
      pourcentage: pourcentageF,
      mode: modeF,
    })
  }

  const startQuiz = (cat, examen = false) => {
    setSelectedCat(cat)
    setQuestions(QUIZ_DEFAULT[cat])
    setCurrent(0)
    setSelected(null)
    setConfirmed(false)
    setScore(0)
    setTried(0)
    setFinished(false)
    setModeExamen(examen)
    setMode('quiz')
  }

  const handleAnswer = (i) => {
    if (confirmed) return
    setSelected(i)
  }

  const handleConfirm = () => {
    if (selected === null && !modeExamen) return
    clearInterval(timerRef.current)
    setConfirmed(true)
    setTried(t => t + 1)
    if (selected === questions[current].answer) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1)
      setSelected(null)
      setConfirmed(false)
    } else {
      const total = questions.length
      const pct = Math.round((score / total) * 100)
      sauvegarderResultat(score, total, pct, modeExamen ? 'examen' : 'normal')
      setFinished(true)
    }
  }

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

  const generateQuiz = async () => {
    if (!genTitle.trim()) { setGenError('Donnez un titre à votre quiz.'); return }
    const content = genFile || genText
    if (!content.trim()) { setGenError('Collez votre cours ou déposez un fichier.'); return }
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: genTitle, content: content.substring(0, 4000) })
      })
      const data = await res.json()
      if (data.questions && data.questions.length > 0) {
        setSelectedCat(genTitle)
        setQuestions(data.questions)
        setCurrent(0)
        setSelected(null)
        setConfirmed(false)
        setScore(0)
        setTried(0)
        setFinished(false)
        setModeExamen(false)
        setMode('quiz')
      } else {
        setGenError("Impossible de générer le quiz. Réessayez.")
      }
    } catch {
      setGenError("Une erreur s'est produite.")
    }
    setGenerating(false)
  }

  const question = questions[current]
  const scorePercent = tried > 0 ? Math.round((score / tried) * 100) : 0
  const timerPercent = (tempsRestant / TEMPS_PAR_QUESTION) * 100

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
          <a href="/flashcards" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Flashcards</a>
        </div>
      </nav>

      {/* HOME */}
      {mode === 'home' && (
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1a2e5a] mb-2">Quiz juridiques</h1>
            <p className="text-gray-500">Testez vos connaissances ou générez un quiz depuis votre cours.</p>
          </div>

          <div className="flex gap-3 justify-center mb-10">
            <button onClick={() => setMode('home')}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-[#1a2e5a] text-white border border-[#1a2e5a]">
              Quiz par matière
            </button>
            <button onClick={() => setMode('generate')}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-500 hover:border-[#1a2e5a] transition">
              ✨ Générer avec mon cours
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {categories.map(cat => (
              <div key={cat} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#1a2e5a] transition">
                <h3 className="font-semibold text-[#1a2e5a] text-lg mb-2">{cat}</h3>
                <p className="text-sm text-gray-400 mb-4">{QUIZ_DEFAULT[cat].length} questions</p>
                <div className="flex gap-3">
                  <button onClick={() => startQuiz(cat, false)}
                    className="flex-1 bg-[#1a2e5a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                    Entraînement
                  </button>
                  <button onClick={() => startQuiz(cat, true)}
                    className="flex-1 bg-[#d4af37] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                    🎓 Mode examen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GENERATE */}
      {mode === 'generate' && (
        <div className="max-w-2xl mx-auto px-8 py-16">
          <button onClick={() => setMode('home')} className="text-sm text-gray-400 hover:text-[#1a2e5a] mb-6 flex items-center gap-1">← Retour</button>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#1a2e5a] mb-2">Générer un quiz avec l'IA</h2>
            <p className="text-sm text-gray-400 mb-6">Collez votre cours ou déposez un fichier — ORTHOS génère un QCM personnalisé.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du quiz</label>
                <input type="text" value={genTitle} onChange={e => setGenTitle(e.target.value)}
                  placeholder="Ex: Droit des obligations L2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre cours</label>
                <textarea value={genText} onChange={e => setGenText(e.target.value)}
                  placeholder="Collez ici le contenu de votre cours…"
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
              {genError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{genError}</div>}
              <button onClick={generateQuiz} disabled={generating}
                className="w-full bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Génération en cours…</> : '✨ Générer mon quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {mode === 'quiz' && !finished && question && (
        <div className="max-w-2xl mx-auto px-8 py-12">

          {/* Bandeau mode examen */}
          {modeExamen && (
            <div className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-medium text-center mb-6 flex items-center justify-center gap-2">
              🎓 Mode Examen — Pas de feedback immédiat
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { clearInterval(timerRef.current); setMode('home') }} className="text-sm text-gray-400 hover:text-[#1a2e5a]">← Quitter</button>
            <span className="text-sm text-gray-400">Question {current + 1} / {questions.length}</span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-500 font-medium">✓ {score}</span>
              <span className="text-gray-400">/ {tried}</span>
            </div>
          </div>

          {/* Timer mode examen */}
          {modeExamen && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Temps restant</span>
                <span className={tempsRestant <= 10 ? 'text-red-500 font-bold' : ''}>{tempsRestant}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${tempsRestant <= 10 ? 'bg-red-500' : 'bg-[#d4af37]'}`}
                  style={{ width: `${timerPercent}%` }}>
                </div>
              </div>
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
            <div className="bg-[#1a2e5a] h-1.5 rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }}></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#eef1f8] text-[#1a2e5a] text-xs font-semibold px-3 py-1 rounded-full">Question {current + 1}</span>
              <span className="text-xs text-gray-400">{selectedCat}</span>
            </div>
            <h2 className="text-lg font-semibold text-[#1a2e5a] leading-relaxed">{question.q}</h2>
          </div>

          <div className="space-y-3 mb-6">
            {question.choices.map((choice, i) => {
              let style = 'bg-white border-gray-200 text-gray-700 hover:border-[#1a2e5a]'
              if (confirmed && !modeExamen) {
                if (i === question.answer) style = 'bg-green-50 border-green-400 text-green-700'
                else if (i === selected && i !== question.answer) style = 'bg-red-50 border-red-300 text-red-600'
                else style = 'bg-white border-gray-200 text-gray-400'
              } else if (confirmed && modeExamen) {
                if (i === selected) style = 'bg-[#eef1f8] border-[#1a2e5a] text-[#1a2e5a]'
                else style = 'bg-white border-gray-200 text-gray-400'
              } else if (selected === i) {
                style = 'bg-[#eef1f8] border-[#1a2e5a] text-[#1a2e5a]'
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left border-2 rounded-xl px-5 py-4 text-sm font-medium transition ${style}`}>
                  <span className="font-bold mr-3">{['A', 'B', 'C', 'D'][i]}.</span>
                  {choice}
                </button>
              )
            })}
          </div>

          {/* Feedback uniquement en mode normal */}
          {confirmed && !modeExamen && (
            <div className={`rounded-xl p-4 mb-6 ${selected === question.answer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-semibold mb-1 ${selected === question.answer ? 'text-green-700' : 'text-red-600'}`}>
                {selected === question.answer ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{question.explication}</p>
            </div>
          )}

          {confirmed && modeExamen && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center text-sm text-gray-400">
              🎓 Mode examen — Les corrections seront affichées à la fin
            </div>
          )}

          <div className="flex gap-3">
            {!confirmed ? (
              <button onClick={handleConfirm} disabled={selected === null}
                className="flex-1 bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-30">
                Valider ma réponse
              </button>
            ) : (
              <button onClick={handleNext}
                className="flex-1 bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
                {current + 1 < questions.length ? 'Question suivante →' : 'Voir mes résultats →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RÉSULTATS */}
      {mode === 'quiz' && finished && (
        <div className="max-w-xl mx-auto px-8 py-16 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-10">
            <div className="text-5xl mb-4">{scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '👍' : '📚'}</div>
            <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">Quiz terminé !</h2>
            {modeExamen && <div className="inline-block bg-[#d4af37] text-white text-xs px-3 py-1 rounded-full mb-4">🎓 Mode Examen</div>}
            <p className="text-gray-400 mb-8">{selectedCat}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#eef1f8] rounded-xl p-4">
                <div className="text-2xl font-bold text-[#1a2e5a]">{score}</div>
                <div className="text-xs text-gray-400">Correctes</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-500">{tried - score}</div>
                <div className="text-xs text-gray-400">Incorrectes</div>
              </div>
              <div className={`rounded-xl p-4 ${scorePercent >= 80 ? 'bg-green-50' : scorePercent >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className={`text-2xl font-bold ${scorePercent >= 80 ? 'text-green-600' : scorePercent >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{scorePercent}%</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
            </div>
            {user && <p className="text-xs text-green-500 mb-4">✓ Résultat sauvegardé dans votre dashboard</p>}
            <p className="text-sm text-gray-500 mb-8">
              {scorePercent >= 80 ? 'Excellent ! Vous maîtrisez bien ce chapitre.' : scorePercent >= 50 ? 'Bien ! Quelques notions à revoir.' : 'Continuez à réviser, vous progressez !'}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => startQuiz(selectedCat, modeExamen)}
                className="bg-[#1a2e5a] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
                Recommencer
              </button>
              <button onClick={() => setMode('home')}
                className="border border-gray-200 text-gray-500 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                Choisir un autre quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}