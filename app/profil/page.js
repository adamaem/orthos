'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ANNEES = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat', 'Autre']
const UNIVERSITES = [
  'Paris I Panthéon-Sorbonne', 'Paris II Assas', 'Paris X Nanterre',
  'Aix-Marseille', 'Lyon III', 'Toulouse I Capitole', 'Bordeaux',
  'Strasbourg', 'Lille', 'Autre'
]

export default function Profil() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profil, setProfil] = useState({
    nom: '',
    universite: '',
    annee_etudes: '',
    avatar_url: '',
    abonnement: 'gratuit',
    abonnement_depuis: null,
  })
  const [stats, setStats] = useState({
    flashcards: 0,
    quiz: 0,
    jours: 0,
    moyenne: 0,
  })
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      await chargerProfil(user)
      await chargerStats(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const chargerProfil = async (user) => {
    const { data } = await supabase.from('profils').select('*').eq('id', user.id).single()
    if (data) {
      setProfil({
        nom: data.nom || user.user_metadata?.full_name || '',
        universite: data.universite || '',
        annee_etudes: data.annee_etudes || '',
        avatar_url: data.avatar_url || user.user_metadata?.avatar_url || '',
        abonnement: data.abonnement || 'gratuit',
        abonnement_depuis: data.abonnement_depuis,
      })
    } else {
      // Créer le profil s'il n'existe pas
      await supabase.from('profils').insert({
        id: user.id,
        nom: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      })
      setProfil(p => ({ ...p, nom: user.user_metadata?.full_name || '' }))
    }
  }

  const chargerStats = async (userId) => {
    const { data: flashcards } = await supabase
      .from('flashcards').select('id', { count: 'exact' }).eq('user_id', userId)
    const { data: quiz } = await supabase
      .from('quiz_resultats').select('pourcentage').eq('user_id', userId)
    const { data: connexions } = await supabase
      .from('connexions').select('date').eq('user_id', userId)

    const moyenne = quiz?.length > 0
      ? Math.round(quiz.reduce((acc, q) => acc + q.pourcentage, 0) / quiz.length)
      : 0

    setStats({
      flashcards: flashcards?.length || 0,
      quiz: quiz?.length || 0,
      jours: connexions?.length || 0,
      moyenne,
    })
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    setUploadingAvatar(true)

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = urlData.publicUrl + '?t=' + Date.now()
      setProfil(p => ({ ...p, avatar_url: avatarUrl }))
      await supabase.from('profils').update({ avatar_url: avatarUrl }).eq('id', user.id)
    }
    setUploadingAvatar(false)
  }

  const sauvegarder = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profils').upsert({
      id: user.id,
      nom: profil.nom,
      universite: profil.universite,
      annee_etudes: profil.annee_etudes,
      avatar_url: profil.avatar_url,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
      <div className="text-[#1a2e5a] font-medium">Chargement…</div>
    </div>
  )

  const abonnementLabel = {
    gratuit: { label: 'Gratuit', color: 'bg-gray-100 text-gray-600', desc: '0€/mois' },
    pro: { label: 'Pro', color: 'bg-[#d4af37] text-white', desc: '9€/mois' },
    annuel: { label: 'Annuel', color: 'bg-[#1a2e5a] text-white', desc: '79€/an' },
  }[profil.abonnement] || { label: 'Gratuit', color: 'bg-gray-100 text-gray-600', desc: '0€/mois' }

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-6">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Dashboard</a>
          <a href="/chat" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Assistant IA</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">

        {/* HEADER PROFIL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#eef1f8] border-2 border-[#1a2e5a] flex items-center justify-center">
                {profil.avatar_url ? (
                  <img src={profil.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#1a2e5a]">
                    {profil.nom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center hover:opacity-90 transition shadow-md">
                {uploadingAvatar ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="text-white text-xs">✎</span>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Infos principales */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1a2e5a]">{profil.nom || 'Mon profil'}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${abonnementLabel.color}`}>
                  {abonnementLabel.label}
                </span>
                <span className="text-xs text-gray-400">{abonnementLabel.desc}</span>
                {profil.abonnement_depuis && (
                  <span className="text-xs text-gray-400">
                    · depuis le {new Date(profil.abonnement_depuis).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>

            {/* Bouton upgrade si gratuit */}
            {profil.abonnement === 'gratuit' && (
              <a href="/tarifs"
                className="flex-shrink-0 bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
                ⭐ Passer Pro
              </a>
            )}
          </div>
        </div>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Flashcards', value: stats.flashcards, icon: '🃏' },
            { label: 'Quiz complétés', value: stats.quiz, icon: '🎯' },
            { label: 'Jours actifs', value: stats.jours, icon: '📅' },
            { label: 'Score moyen', value: stats.moyenne > 0 ? `${stats.moyenne}%` : '-', icon: '📊' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-[#1a2e5a]">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* INFORMATIONS PERSONNELLES */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-[#1a2e5a] mb-6">Informations personnelles</h2>
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={profil.nom}
                onChange={e => setProfil(p => ({ ...p, nom: e.target.value }))}
                placeholder="Votre nom complet"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
              <select
                value={profil.universite}
                onChange={e => setProfil(p => ({ ...p, universite: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800 bg-white">
                <option value="">Sélectionnez votre université</option>
                {UNIVERSITES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année d'études</label>
              <select
                value={profil.annee_etudes}
                onChange={e => setProfil(p => ({ ...p, annee_etudes: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a2e5a] text-gray-800 bg-white">
                <option value="">Sélectionnez votre année</option>
                {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button
              onClick={sauvegarder}
              disabled={saving}
              className="w-full bg-[#1a2e5a] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Sauvegarde…</>
              ) : saved ? '✓ Sauvegardé !' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </div>

        {/* ABONNEMENT */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-[#1a2e5a] mb-6">Mon abonnement</h2>
          <div className="flex items-center justify-between p-4 bg-[#f4f5f7] rounded-xl mb-4">
            <div>
              <div className="font-semibold text-[#1a2e5a]">Plan {abonnementLabel.label}</div>
              <div className="text-sm text-gray-400">{abonnementLabel.desc}</div>
              {profil.abonnement_depuis && (
                <div className="text-xs text-gray-400 mt-1">
                  Actif depuis le {new Date(profil.abonnement_depuis).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
            <span className={`text-sm font-semibold px-4 py-2 rounded-full ${abonnementLabel.color}`}>
              {abonnementLabel.label}
            </span>
          </div>

          {profil.abonnement === 'gratuit' ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Passez à un plan payant pour débloquer toutes les fonctionnalités.</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="/tarifs" className="block text-center border-2 border-[#d4af37] text-[#d4af37] py-3 rounded-xl text-sm font-medium hover:bg-amber-50 transition">
                  ⭐ Pro — 9€/mois
                </a>
                <a href="/tarifs" className="block text-center bg-[#1a2e5a] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition">
                  🏆 Annuel — 79€/an
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium">✓ Toutes les fonctionnalités sont débloquées.</p>
          )}
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white border border-red-100 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-red-500 mb-2">Zone dangereuse</h2>
          <p className="text-sm text-gray-400 mb-4">Ces actions sont irréversibles.</p>
          <button
            onClick={async () => {
              if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                await supabase.auth.signOut()
                router.push('/')
              }
            }}
            className="border border-red-200 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition">
            Se déconnecter
          </button>
        </div>

      </div>
    </main>
  )
}