export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </div>
        <div className="ml-auto flex items-center gap-8">
          <a href="/fonctionnalites" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Fonctionnalités</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
          <a href="/faq" className="text-sm text-gray-500 hover:text-[#1a2e5a]">FAQ</a>
          <a href="/apropos" className="text-sm text-gray-500 hover:text-[#1a2e5a]">À propos</a>
          <a href="/auth" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-[#f4f5f7] px-8 py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#eef1f8] text-[#1a2e5a] text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Assistant IA spécialisé en droit français
          </span>
          <h1 className="text-5xl font-bold text-[#1a2e5a] leading-tight mb-6">
            Une plateforme complète pour réussir tes études de droit.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Orthos t'accompagne avec un assistant IA juridique, des fiches de révision et des quiz conçus spécialement pour les étudiants en faculté de droit.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/auth" className="bg-[#1a2e5a] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
              Découvrir gratuitement →
            </a>
            <a href="#fonctionnalites" className="border border-gray-300 text-[#1a2e5a] px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
              En savoir plus
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">Contenu adapté pour chaque année · Sans engagement</p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#1a2e5a] px-8 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#d4af37] mb-1">5</div>
            <div className="text-sm text-blue-200">Matières juridiques couvertes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#d4af37] mb-1">6</div>
            <div className="text-sm text-blue-200">Modes d'apprentissage</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#d4af37] mb-1">24/7</div>
            <div className="text-sm text-blue-200">Disponible à tout moment</div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITES */}
      <section id="fonctionnalites" className="px-8 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-4">Tout ce dont tu as besoin pour réussir</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Orthos combine intelligence artificielle et méthodologie juridique pour t'accompagner à chaque étape de tes études.</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: '⚖️', title: 'Assistant IA juridique', desc: 'Posez vos questions et obtenez des réponses structurées comme un professeur de faculté, avec plans, références et jurisprudence.' },
              { icon: '📝', title: 'Dissertation & commentaire', desc: "Structurez vos dissertations et commentaires d'arrêt avec une méthodologie rigoureuse et des plans détaillés en I/II." },
              { icon: '📋', title: 'Fiches de révision', desc: 'Générez instantanément des fiches synthétiques sur n\'importe quel concept juridique, prêtes pour vos révisions.' },
              { icon: '🎯', title: 'Cas pratiques corrigés', desc: 'Résolvez des cas pratiques avec la méthode juridique complète : qualification, règle de droit, application, solution.' },
              { icon: '🃏', title: 'Flashcards interactives', desc: 'Révisez les notions clés avec des flashcards adaptées à votre niveau et basées sur la répétition espacée.' },
              { icon: '📊', title: 'Quiz & auto-évaluation', desc: 'Testez vos connaissances avec des QCM générés par l\'IA et suivez votre progression en temps réel.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#f4f5f7] rounded-xl p-6 hover:shadow-sm transition">
                <div className="w-12 h-12 bg-[#eef1f8] rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-[#1a2e5a] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MATIERES */}
      <section className="bg-[#f4f5f7] px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-4">Toutes les matières couvertes</h2>
            <p className="text-gray-500">ORTHOS maîtrise l'ensemble du programme de licence et master de droit.</p>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Droit civil', icon: '🏛️' },
              { label: 'Droit pénal', icon: '⚖️' },
              { label: 'Droit constitutionnel', icon: '📜' },
              { label: 'Droit administratif', icon: '🏢' },
              { label: 'Droit des contrats', icon: '📋' },
            ].map((m) => (
              <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-[#1a2e5a] transition">
                <div className="text-3xl mb-3">{m.icon}</div>
                <div className="text-sm font-medium text-[#1a2e5a]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="bg-white px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-4">Tarifs — Plans Individuels</h2>
            <p className="text-gray-500">Commencez gratuitement, puis passez à un plan payant quand vous êtes prêt.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                name: 'Gratuit', price: '0€', period: '/ mois',
                cta: 'Commencer maintenant', featured: false,
                features: ['Calendrier', 'Articles méthodologiques', 'Défis Orthos', 'QCM : 5/semaine', 'Flashcards : 5/semaine', 'Statistiques limitées'],
                no: ['Mode examen', 'Classement intelligent', 'Concours blanc']
              },
              {
                name: 'Mensuel', price: '9€', period: '/ mois',
                cta: 'Commencer maintenant', featured: false,
                features: ['Tout du plan gratuit', 'QCM illimité', 'Flashcards illimitées', 'Statistiques avancées', 'Mode examen', 'Classement intelligent', 'Concours blanc'],
                no: []
              },
              {
                name: 'Annuel', price: '79€', period: '/ an (6,58€/mois)',
                cta: 'Commencer maintenant', featured: true,
                features: ['Tout du plan mensuel', 'QCM illimité', 'Flashcards illimitées', 'Statistiques avancées', 'Mode examen', 'Classement intelligent', 'Concours blanc'],
                no: []
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-6 border-2 ${plan.featured ? 'border-[#1a2e5a] bg-[#f8f9fc]' : 'border-gray-200 bg-white'}`}>
                {plan.featured && <div className="text-xs font-semibold text-[#1a2e5a] uppercase tracking-wide mb-3">⭐ Meilleure offre</div>}
                <div className="text-lg font-semibold text-[#1a2e5a] mb-1">{plan.name}</div>
                <div className="text-3xl font-bold text-[#1a2e5a] mb-1">{plan.price}</div>
                <div className="text-sm text-gray-400 mb-6">{plan.period}</div>
                <a href="/auth" className="block text-center bg-[#1a2e5a] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition mb-6">
                  {plan.cta}
                </a>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                  {plan.no.map(f => (
                    <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-red-400">✗</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#f4f5f7] px-8 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a2e5a] text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "ORTHOS est-il fiable pour le droit français ?", a: "Oui, ORTHOS est spécialement calibré pour le droit français. Il connaît le Code civil, le Code pénal, le droit administratif et constitutionnel, ainsi que la jurisprudence majeure." },
              { q: "Puis-je utiliser ORTHOS pour mes examens ?", a: "ORTHOS est un outil de préparation et de compréhension. Il t'aide à structurer ta pensée et comprendre les concepts, mais ne remplace pas le travail personnel et la lecture des sources primaires." },
              { q: "Comment fonctionne l'upload de fichiers ?", a: "Tu peux déposer un arrêt, un cours ou un TD directement dans le chat. ORTHOS analysera le document et te proposera un commentaire, un plan ou un résumé selon ton besoin." },
              { q: "Est-ce que mes conversations sont sauvegardées ?", a: "Dans la version actuelle, l'historique est conservé pendant ta session. La sauvegarde permanente sera disponible avec un compte utilisateur dans la prochaine version." },
            ].map((item) => (
              <div key={item.q} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-[#1a2e5a] mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#1a2e5a] px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à réussir tes études de droit ?</h2>
          <p className="text-blue-200 mb-8 leading-relaxed">Rejoins les étudiants qui utilisent ORTHOS pour comprendre, réviser et exceller en droit français.</p>
          <a href="/auth" className="inline-block bg-[#d4af37] text-[#1a2e5a] px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            Commencer gratuitement →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Orthos" className="h-8 w-8 object-contain" />
            <span className="text-[#1a2e5a] font-semibold">Orthos</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Orthos · Tous droits réservés</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-[#1a2e5a]">Mentions légales</a>
            <a href="#" className="text-sm text-gray-400 hover:text-[#1a2e5a]">Confidentialité</a>
            <a href="#" className="text-sm text-gray-400 hover:text-[#1a2e5a]">Contact</a>
          </div>
        </div>
      </footer>

    </main>
  )
}