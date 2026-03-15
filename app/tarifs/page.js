export default function Tarifs() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Orthos" className="h-10 w-10 object-contain" />
          <span className="text-[#1a2e5a] font-semibold text-xl">Orthos</span>
        </a>
        <div className="ml-auto flex items-center gap-8">
          <a href="/" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Accueil</a>
          <a href="/tarifs" className="text-sm text-[#1a2e5a] font-medium">Tarifs</a>
          <a href="/faq" className="text-sm text-gray-500 hover:text-[#1a2e5a]">FAQ</a>
          <a href="/apropos" className="text-sm text-gray-500 hover:text-[#1a2e5a]">À propos</a>
          <a href="/chat" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#f4f5f7] px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#1a2e5a] mb-4">Tarifs — Plans Individuels</h1>
          <p className="text-gray-500 leading-relaxed">
            Commencez gratuitement, puis passez à un plan payant quand vous êtes prêt. Sans engagement, résiliable à tout moment.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="px-8 py-20 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
          {[
            {
              name: 'Gratuit',
              price: '0€',
              period: '/ mois',
              desc: 'Pour découvrir ORTHOS sans engagement.',
              cta: 'Commencer maintenant',
              featured: false,
              footer: 'Sans carte bancaire',
              features: [
                { label: 'Calendrier', ok: true },
                { label: 'Articles méthodologiques', ok: true },
                { label: 'Défis Orthos', ok: true },
                { label: 'Duels entre amis', ok: true },
                { label: 'Mode entraînement', ok: true },
                { label: 'Répétitions espacées', ok: true },
                { label: 'QCM : 5/semaine', ok: true },
                { label: 'Flashcards : 5/semaine', ok: true },
                { label: 'Statistiques limitées', ok: true },
                { label: 'Mode examen', ok: false },
                { label: 'Classement intelligent', ok: false },
                { label: 'Concours blanc', ok: false },
              ]
            },
            {
              name: 'Mensuel',
              price: '9€',
              period: '/ mois',
              desc: 'Accès complet, sans engagement annuel.',
              cta: 'Commencer maintenant',
              featured: false,
              footer: 'Paiement sécurisé Stripe',
              features: [
                { label: 'Calendrier', ok: true },
                { label: 'Articles méthodologiques', ok: true },
                { label: 'Défis Orthos', ok: true },
                { label: 'Duels entre amis', ok: true },
                { label: 'Mode entraînement', ok: true },
                { label: 'Répétitions espacées', ok: true },
                { label: 'QCM illimité', ok: true },
                { label: 'Flashcards illimitées', ok: true },
                { label: 'Statistiques avancées', ok: true },
                { label: 'Mode examen', ok: true },
                { label: 'Classement intelligent', ok: true },
                { label: 'Concours blanc', ok: true },
              ]
            },
            {
              name: 'Annuel',
              price: '79€',
              period: '/ an (6,58€ / mois)',
              desc: 'La meilleure offre pour toute l\'année universitaire.',
              cta: 'Commencer maintenant',
              featured: true,
              footer: 'Support client prioritaire',
              features: [
                { label: 'Calendrier', ok: true },
                { label: 'Articles méthodologiques', ok: true },
                { label: 'Défis Orthos', ok: true },
                { label: 'Duels entre amis', ok: true },
                { label: 'Mode entraînement', ok: true },
                { label: 'Répétitions espacées', ok: true },
                { label: 'QCM illimité', ok: true },
                { label: 'Flashcards illimitées', ok: true },
                { label: 'Statistiques avancées', ok: true },
                { label: 'Mode examen', ok: true },
                { label: 'Classement intelligent', ok: true },
                { label: 'Concours blanc', ok: true },
              ]
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl border-2 p-7 flex flex-col ${plan.featured ? 'border-[#1a2e5a] bg-[#f8f9fc] relative' : 'border-gray-200 bg-white'}`}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d4af37] text-[#1a2e5a] text-xs font-bold px-4 py-1 rounded-full">
                  ⭐ Meilleure offre
                </div>
              )}
              <div className="mb-6">
                <div className="text-lg font-semibold text-[#1a2e5a] mb-1">{plan.name}</div>
                <div className="text-4xl font-bold text-[#1a2e5a] mb-1">{plan.price}</div>
                <div className="text-sm text-gray-400 mb-3">{plan.period}</div>
                <p className="text-sm text-gray-500">{plan.desc}</p>
              </div>
              <a href="/chat" className="block text-center bg-[#1a2e5a] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition mb-6">
                {plan.cta}
              </a>
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f.label} className={`text-sm flex items-center gap-3 ${f.ok ? 'text-gray-700' : 'text-gray-300'}`}>
                    <span className={`text-base ${f.ok ? 'text-green-500' : 'text-red-300'}`}>{f.ok ? '✓' : '✗'}</span>
                    {f.label}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">{plan.footer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GARANTIE */}
      <section className="bg-[#f4f5f7] px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-[#1a2e5a] mb-3">Satisfait ou remboursé — 7 jours</h2>
          <p className="text-gray-500 leading-relaxed">Si ORTHOS ne vous convient pas dans les 7 premiers jours suivant votre abonnement, nous vous remboursons intégralement. Sans question.</p>
        </div>
      </section>

      {/* FAQ RAPIDE */}
      <section className="bg-white px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a2e5a] text-center mb-10">Questions sur les tarifs</h2>
          <div className="space-y-4">
            {[
              { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez upgrader ou résilier votre abonnement à tout moment depuis votre tableau de bord. Aucun engagement." },
              { q: "Le plan gratuit est-il vraiment gratuit ?", a: "Oui, sans carte bancaire requise. Vous avez accès aux fonctionnalités de base indéfiniment." },
              { q: "Comment fonctionne le paiement ?", a: "Les paiements sont sécurisés via Stripe. Nous acceptons toutes les cartes bancaires classiques." },
              { q: "Y a-t-il des réductions pour les associations étudiantes ?", a: "Oui, contactez-nous à contact@orthos.fr pour discuter de tarifs groupés pour votre association ou faculté." },
            ].map((item) => (
              <div key={item.q} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-[#1a2e5a] mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2e5a] px-8 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Commence gratuitement dès aujourd'hui</h2>
          <p className="text-blue-200 mb-6">Aucune carte bancaire requise pour le plan gratuit.</p>
          <a href="/chat" className="inline-block bg-[#d4af37] text-[#1a2e5a] px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            Découvrir ORTHOS →
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