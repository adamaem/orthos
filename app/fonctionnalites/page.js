export default function Fonctionnalites() {
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
          <a href="/fonctionnalites" className="text-sm text-[#1a2e5a] font-medium">Fonctionnalités</a>
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
          <a href="/faq" className="text-sm text-gray-500 hover:text-[#1a2e5a]">FAQ</a>
          <a href="/apropos" className="text-sm text-gray-500 hover:text-[#1a2e5a]">À propos</a>
          <a href="/chat" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#f4f5f7] px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#1a2e5a] mb-4">Tout ce qu'ORTHOS peut faire pour toi</h1>
          <p className="text-gray-500 leading-relaxed text-lg">
            Six modes spécialisés pour t'accompagner à chaque étape de tes études de droit.
          </p>
        </div>
      </section>

      {/* FONCTIONNALITES DETAILLEES */}
      <section className="px-8 py-20 max-w-5xl mx-auto space-y-20">

        {[
          {
            icon: '⚖️',
            title: 'Assistant IA juridique',
            tag: 'Question libre',
            desc: "Posez n'importe quelle question juridique et obtenez une réponse structurée, rigoureuse et pédagogique. ORTHOS répond comme un professeur de faculté de droit : avec des références légales, des exemples concrets et une terminologie exacte.",
            points: ['Droit civil, pénal, administratif, constitutionnel', 'Citations des articles de loi pertinents', 'Références jurisprudentielles majeures', 'Explications adaptées à votre niveau'],
            reverse: false,
          },
          {
            icon: '📝',
            title: 'Dissertation juridique',
            tag: 'Dissertation',
            desc: "Donnez votre sujet de dissertation et ORTHOS vous propose une problématique percutante ainsi qu'un plan détaillé en deux parties (I./II.) avec sous-parties (A./B.), accompagné des arguments et références pour chaque section.",
            points: ['Problématique juridique construite', 'Plan en I/II avec A/B détaillés', 'Arguments et contre-arguments', 'Références doctrinales et jurisprudentielles'],
            reverse: true,
          },
          {
            icon: '📋',
            title: "Commentaire d'arrêt",
            tag: "Commentaire d'arrêt",
            desc: "Déposez votre arrêt ou décrivez-le, et ORTHOS vous guide pas à pas : résumé des faits, identification du problème juridique, et plan de commentaire structuré selon la méthode de la faculté.",
            points: ['Résumé des faits et solution retenue', 'Identification du problème juridique', "Plan de commentaire en I/II", 'Analyse de la portée de l\'arrêt'],
            reverse: false,
          },
          {
            icon: '🃏',
            title: 'Fiche de révision',
            tag: 'Fiche de révision',
            desc: "Générez instantanément une fiche synthétique sur n'importe quel concept juridique. Définition, fondements textuels, conditions, effets, exceptions et arrêts clés — tout ce dont vous avez besoin pour réviser efficacement.",
            points: ['Définition précise du concept', 'Fondements légaux et textuels', 'Conditions et effets', 'Arrêts et exceptions clés'],
            reverse: true,
          },
          {
            icon: '🎯',
            title: 'Cas pratique',
            tag: 'Cas pratique',
            desc: "Décrivez les faits de votre cas pratique et ORTHOS applique la méthode juridique complète : qualification des faits, identification de la règle de droit applicable, application au cas d'espèce et solution motivée.",
            points: ['Qualification juridique des faits', 'Règle de droit applicable avec références', "Application au cas d'espèce", 'Solution juridiquement motivée'],
            reverse: false,
          },
          {
            icon: '💡',
            title: 'Explication de concept',
            tag: 'Concept',
            desc: "Vous ne comprenez pas un concept juridique ? ORTHOS l'explique progressivement : définition simple, fondement légal, conditions d'application, effets pratiques, exemple concret et distinctions avec les notions voisines.",
            points: ['Définition accessible et précise', 'Exemple concret tiré de la pratique', 'Distinctions avec les notions proches', 'Conseils méthodologiques'],
            reverse: true,
          },
        ].map((f) => (
          <div key={f.title} className={`grid grid-cols-2 gap-16 items-center ${f.reverse ? 'direction-rtl' : ''}`}>
            <div className={f.reverse ? 'order-2' : ''}>
              <span className="inline-block bg-[#eef1f8] text-[#1a2e5a] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {f.tag}
              </span>
              <h2 className="text-2xl font-bold text-[#1a2e5a] mb-4">{f.title}</h2>
              <p className="text-gray-500 leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-2">
                {f.points.map(p => (
                  <li key={p} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span> {p}
                  </li>
                ))}
              </ul>
              <a href="/chat" className="inline-block mt-6 bg-[#1a2e5a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                Essayer ce mode →
              </a>
            </div>
            <div className={`bg-[#f4f5f7] rounded-2xl p-10 text-center ${f.reverse ? 'order-1' : ''}`}>
              <div className="text-7xl mb-4">{f.icon}</div>
              <div className="text-lg font-semibold text-[#1a2e5a]">{f.title}</div>
            </div>
          </div>
        ))}

      </section>

      {/* UPLOAD */}
      <section className="bg-[#f4f5f7] px-8 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-4">Upload de fichiers</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Déposez directement vos arrêts, cours ou TD dans le chat. ORTHOS analyse le document et vous propose un commentaire, un plan ou un résumé selon votre besoin.
            </p>
            <ul className="space-y-2">
              {['Formats acceptés : PDF et TXT', 'Analyse complète du document', 'Commentaire d\'arrêt automatique', 'Résumé et fiche de révision générés'].map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border-2 border-dashed border-[#1a2e5a] rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">📎</div>
            <div className="font-semibold text-[#1a2e5a] mb-2">Déposer un fichier</div>
            <div className="text-sm text-gray-400">Arrêt, cours, TD… ORTHOS l'analysera</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2e5a] px-8 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à essayer ?</h2>
          <p className="text-blue-200 mb-8">Toutes ces fonctionnalités sont disponibles gratuitement dès maintenant.</p>
          <a href="/chat" className="inline-block bg-[#d4af37] text-[#1a2e5a] px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
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