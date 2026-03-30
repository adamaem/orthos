'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const MODES = {
  libre: { label: 'Question libre', placeholder: 'Posez votre question juridique…', instruction: '' },
  dissertation: { label: 'Dissertation', placeholder: 'Donnez votre sujet de dissertation…', instruction: 'MODE DISSERTATION : Propose une problématique percutante puis un plan détaillé I./II. avec A./B., arguments et références pour chaque partie.' },
  arret: { label: "Commentaire d'arrêt", placeholder: "Collez l'arrêt ou décrivez-le…", instruction: "MODE COMMENTAIRE D'ARRÊT : 1) Résumé des faits et solution 2) Problème juridique 3) Plan de commentaire I./II. avec A./B." },
  fiche: { label: 'Fiche de révision', placeholder: 'Sur quel thème souhaitez-vous une fiche ?', instruction: 'MODE FICHE : Présente de façon synthétique : définition, fondements textuels, conditions, effets, exceptions, arrêts clés.' },
  cas: { label: 'Cas pratique', placeholder: 'Décrivez les faits de votre cas pratique…', instruction: 'MODE CAS PRATIQUE : Qualification des faits, règle de droit applicable, application au cas, solution.' },
  concept: { label: 'Expliquer un concept', placeholder: 'Quel concept juridique souhaitez-vous comprendre ?', instruction: 'MODE CONCEPT : Définition simple, fondement légal, conditions, effets, exemple concret, distinctions avec notions voisines.' },
}

export default function Chat() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('libre')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [conversations, setConversations] = useState([])
  const [convActuelle, setConvActuelle] = useState(null)
  const [chargementConvs, setChargementConvs] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        chargerConversations(data.user.id)
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Charger toutes les conversations de l'utilisateur
  const chargerConversations = async (userId) => {
    setChargementConvs(true)
    const { data } = await supabase
      .from('conversations')
      .select('id, titre, mode, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(30)
    if (data) setConversations(data)
    setChargementConvs(false)
  }

  // Ouvrir une conversation existante
  const ouvrirConversation = async (convId) => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .single()
    if (data) {
      setMessages(data.messages || [])
      setMode(data.mode || 'libre')
      setConvActuelle(data.id)
    }
  }

  // Sauvegarder ou mettre à jour la conversation
  const sauvegarderConversation = async (nouveauxMessages, modeActuel) => {
    if (!user) return

    const titre = nouveauxMessages.find(m => m.role === 'user')?.content?.substring(0, 50) || 'Nouvelle conversation'

    if (convActuelle) {
      // Mettre à jour la conversation existante
      await supabase.from('conversations').update({
        messages: nouveauxMessages,
        updated_at: new Date().toISOString(),
      }).eq('id', convActuelle)
    } else {
      // Créer une nouvelle conversation
      const { data } = await supabase.from('conversations').insert({
        user_id: user.id,
        titre,
        mode: modeActuel,
        messages: nouveauxMessages,
      }).select().single()
      if (data) setConvActuelle(data.id)
    }

    // Rafraîchir la liste
    chargerConversations(user.id)
  }

  // Supprimer une conversation
  const supprimerConversation = async (convId, e) => {
    e.stopPropagation()
    await supabase.from('conversations').delete().eq('id', convId)
    if (convActuelle === convId) nouvelleConversation()
    chargerConversations(user.id)
  }

  const nouvelleConversation = () => {
    setMessages([])
    setConvActuelle(null)
    setInput('')
    setFileName('')
    setFileContent('')
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    if (file.type === 'application/pdf') {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      setFileContent(data.text || '')
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => setFileContent(ev.target.result)
      reader.readAsText(file)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    const fullText = fileContent
      ? userText + '\n\n[Fichier joint : ' + fileName + ']\n' + fileContent.substring(0, 3000)
      : userText

    const nouveauxMessages = [...messages, { role: 'user', content: userText, file: fileName || null }]
    setMessages(nouveauxMessages)
    setInput('')
    setFileContent('')
    setFileName('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: fullText }],
          modeInstruction: MODES[mode].instruction
        })
      })
      const data = await res.json()
      const messagesFinaux = [...nouveauxMessages, { role: 'assistant', content: data.reply }]
      setMessages(messagesFinaux)
      await sauvegarderConversation(messagesFinaux, mode)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur s'est produite. Veuillez réessayer." }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return 'Hier'
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex flex-col h-screen bg-[#f4f5f7]">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center flex-shrink-0">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-8">
          <a href="/" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Accueil</a>
          <a href="/flashcards" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Flashcards</a>
          <a href="/quiz" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Quiz</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

          {/* Nouvelle conversation */}
          <div className="p-3 border-b border-gray-100">
            <button onClick={nouvelleConversation}
              className="w-full bg-[#1a2e5a] text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition">
              <span className="text-lg">+</span> Nouvelle conversation
            </button>
          </div>

          {/* Modes */}
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Modes</p>
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} onClick={() => setMode(key)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 transition-colors ${mode === key ? 'bg-[#eef1f8] text-[#1a2e5a] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                {val.label}
              </button>
            ))}
          </div>

          {/* Historique conversations */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Historique {!user && <span className="normal-case font-normal">(connectez-vous)</span>}
            </p>

            {!user && (
              <a href="/auth" className="block text-xs text-center text-[#d4af37] border border-[#d4af37] rounded-lg px-3 py-2 hover:bg-amber-50 transition">
                🔒 Se connecter pour sauvegarder
              </a>
            )}

            {chargementConvs && (
              <div className="text-xs text-gray-400 text-center py-4">Chargement…</div>
            )}

            {conversations.length === 0 && user && !chargementConvs && (
              <div className="text-xs text-gray-400 px-2">Aucune conversation sauvegardée</div>
            )}

            {conversations.map(conv => (
              <div key={conv.id}
                onClick={() => ouvrirConversation(conv.id)}
                className={`group relative flex flex-col px-3 py-2 rounded-lg mb-1 cursor-pointer transition ${convActuelle === conv.id ? 'bg-[#eef1f8]' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-sm truncate flex-1 ${convActuelle === conv.id ? 'text-[#1a2e5a] font-medium' : 'text-gray-600'}`}>
                    {conv.titre}
                  </span>
                  <button
                    onClick={(e) => supprimerConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-xs flex-shrink-0 ml-1">
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{formatDate(conv.updated_at)}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{MODES[conv.mode]?.label || conv.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT ZONE */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <img src="/logo.png" alt="Orthos" className="h-16 w-16 object-contain mb-4 opacity-80" />
                <h2 className="text-2xl font-semibold text-[#1a2e5a] mb-2">Bonjour, je suis ORTHOS</h2>
                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                  Assistant juridique spécialisé en droit français. Choisissez un mode ou posez directement votre question.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                  {[
                    { label: 'Concept', text: 'Explique-moi la responsabilité civile délictuelle' },
                    { label: 'Dissertation', text: 'Fais-moi un plan sur la séparation des pouvoirs' },
                    { label: 'Distinction', text: 'Différence entre nullité absolue et nullité relative' },
                    { label: 'Fiche', text: 'Génère une fiche de révision sur le contrat de vente' },
                  ].map((s) => (
                    <button key={s.text} onClick={() => setInput(s.text)}
                      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1a2e5a] transition-colors">
                      <span className="text-xs font-semibold text-[#1a2e5a] uppercase tracking-wide block mb-1">{s.label}</span>
                      <span className="text-sm text-gray-500">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200 text-[#1a2e5a]' : 'bg-[#1a2e5a] text-[#d4af37]'}`}>
                  {msg.role === 'user' ? 'SA' : 'OR'}
                </div>
                <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1a2e5a] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                  {msg.file && <div className="text-xs opacity-60 mb-2">📎 {msg.file}</div>}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a2e5a] flex items-center justify-center text-xs font-semibold text-[#d4af37] flex-shrink-0">OR</div>
                <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="bg-white border-t border-gray-200 p-4">
            {fileName && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-sm text-green-700">
                📎 {fileName}
                <button onClick={() => { setFileName(''); setFileContent('') }} className="ml-auto text-green-500 hover:text-green-700">×</button>
              </div>
            )}
            <div className="flex gap-3 items-end">
              <label className="cursor-pointer text-gray-400 hover:text-[#1a2e5a] flex-shrink-0 pb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFile} />
              </label>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={MODES[mode].placeholder} rows={1}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1a2e5a] text-gray-800"
                style={{ maxHeight: '120px' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="bg-[#1a2e5a] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-30 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}