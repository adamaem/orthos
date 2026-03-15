'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nom } }
      })
      if (error) setError(error.message)
      else setMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou mot de passe incorrect.')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-sans flex flex-col">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
      </nav>

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md">

          {/* LOGO */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Orthos" className="h-14 w-14 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1a2e5a]">
              {mode === 'login' ? 'Bon retour sur ORTHOS' : 'Créer votre compte'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'login' ? 'Connectez-vous pour accéder à votre assistant juridique' : 'Rejoignez des milliers d\'étudiants en droit'}
            </p>
          </div>

          {/* TABS */}
          <div className="flex bg-[#f4f5f7] rounded-xl p-1 mb-6">
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'login' ? 'bg-white text-[#1a2e5a] shadow-sm' : 'text-gray-400'}`}>
              Connexion
            </button>
            <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'signup' ? 'bg-white text-[#1a2e5a] shadow-sm' : 'text-gray-400'}`}>
              Inscription
            </button>
          </div>

          {/* FIELDS */}
          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} onKeyDown={handleKey}
                  placeholder="Jean Dupont"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
                placeholder="jean@exemple.fr"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
            </div>
          </div>

          {/* MESSAGES */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          {/* SUBMIT */}
          <button onClick={handleSubmit} disabled={loading || !email || !password}
            className="w-full mt-6 bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-40">
            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>

          {mode === 'login' && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Pas encore de compte ?{' '}
              <button onClick={() => setMode('signup')} className="text-[#1a2e5a] font-medium hover:underline">
                S'inscrire gratuitement
              </button>
            </p>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 px-8 py-6 text-center">
        <p className="text-sm text-gray-400">© 2026 Orthos · Tous droits réservés</p>
      </footer>

    </main>
  )
}