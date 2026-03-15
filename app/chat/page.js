'use client'
import { useState, useRef, useEffect } from 'react'

const MODES = {
  libre: { label: 'Question libre', placeholder: 'Posez votre question juridique…', instruction: '' },
  dissertation: { label: 'Dissertation', placeholder: 'Donnez votre sujet de dissertation…', instruction: 'MODE DISSERTATION : Propose une problématique percutante puis un plan détaillé I./II. avec A./B., arguments et références pour chaque partie.' },
  arret: { label: "Commentaire d'arrêt", placeholder: "Collez l'arrêt ou décrivez-le…", instruction: "MODE COMMENTAIRE D'ARRÊT : 1) Résumé des faits et solution 2) Problème juridique 3) Plan de commentaire I./II. avec A./B." },
  fiche: { label: 'Fiche de révision', placeholder: 'Sur quel thème souhaitez-vous une fiche ?', instruction: 'MODE FICHE : Présente de façon synthétique : définition, fondements textuels, conditions, effets, exceptions, arrêts clés.' },
  cas: { label: 'Cas pratique', placeholder: 'Décrivez les faits de votre cas pratique…', instruction: 'MODE CAS PRATIQUE : Qualification des faits, règle de droit applicable, application au cas, solution.' },
  concept: { label: 'Expliquer un concept', placeholder: 'Quel concept juridique souhaitez-vous comprendre ?', instruction: 'MODE CONCEPT : Définition simple, fondement légal, conditions, effets, exemple concret, distinctions avec notions voisines.' },
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('libre')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setFileContent(ev.target.result)
    reader.readAsText(file)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    const fullText = fileContent ? userText + '\n\n[Fichier joint : ' + fileName + ']\n' + fileContent.substring(0, 3000) : userText
    setMessages(prev => [...prev, { role: 'user', content: userText, file: fileName }])
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur s'est produite. Veuillez réessayer." }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
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
          <a href="#" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Flashcards</a>
          <a href="#" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Quiz</a>
          <a href="#" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3">
            <button onClick={() => setMessages([])} className="w-full bg-[#1a2e5a] text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90">
              + Nouvelle conversation
            </button>
          </div>
          <div className="px-3 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Modes</p>
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} onClick={() => setMode(key)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 transition-colors ${mode === key ? 'bg-[#eef1f8] text-[#1a2e5a] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                {val.label}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <div className="px-3 mt-auto pb-4 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Historique</p>
              <div className="text-xs text-gray-400 px-2 truncate">
                {messages.find(m => m.role === 'user')?.content?.substring(0, 40)}…
              </div>
            </div>
          )}
        </div>

        {/* CHAT ZONE */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <img src="/logo.png" alt="Orthos" className="h-16 w-16 object-contain mb-4 opacity-80" />
                <h2 className="text-2xl font-semibold text-[#1a2e5a] mb-2">Bonjour, je suis ORTHOS</h2>
                <p className="text-gray-400 max-w-md leading-relaxed mb-8">Assistant juridique spécialisé en droit français. Choisissez un mode ou posez directement votre question.</p>
                <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                  {[
                    { label: 'Concept', text: 'Explique-moi la responsabilité civile délictuelle' },
                    { label: 'Dissertation', text: 'Fais-moi un plan sur la séparation des pouvoirs' },
                    { label: 'Distinction', text: 'Différence entre nullité absolue et nullité relative' },
                    { label: 'Fiche', text: 'Génère une fiche de révision sur le contrat de vente' },
                  ].map((s) => (
                    <button key={s.text} onClick={() => { setInput(s.text) }}
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
                  <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a2e5a] flex items-center justify-center text-xs font-semibold text-[#d4af37] flex-shrink-0">OR</div>
                <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                  <span className="w-2 h-2 bg-[#1a2e5a] rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
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
                style={{maxHeight: '120px'}}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="bg-[#1a2e5a] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-30 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}