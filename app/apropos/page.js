export default function Apropos() {
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
          <a href="/tarifs" className="text-sm text-gray-500 hover:text-[#1a2e5a]">Tarifs</a>
          <a href="/faq" className="text-sm text-gray-500 hover:text-[#1a2e5a]">FAQ</a>
          <a href="/apropos" className="text-sm text-[#1a2e5a] font-medium">À propos</a>
          <a href="/chat" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-[#f4f5f7] px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#1a2e5a] mb-6">Notre mission</h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Rendre l'excellence juridique accessible à tous les étudiants en droit, peu importe leur origine ou leurs moyens.
          </p>
        </div>
      </section>

      {/* HISTOIRE */}
      <section className="px-8 py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-6">Pourquoi ORTHOS ?</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              ORTHOS est né d'un constat simple : les étudiants en droit manquent d'accompagnement personnalisé. Les cours magistraux ne laissent pas de place aux questions individuelles, et les outils IA généralistes ne comprennent pas les spécificités du droit français.
            </p>
            <p className="text-gray-500 leading-relaxed mb-4">
              La méthodologie juridique française — dissertations en I/II, commentaires d'arrêt, cas pratiques — est exigeante et précise. Elle s'apprend, mais elle nécessite un accompagnement adapté que beaucoup d'étudiants n'ont pas les moyens de se payer.
            </p>
            <p className="text-gray-500 leading-relaxed">
              ORTHOS est la réponse à ce problème : un assistant juridique intelligent, disponible 24h/24, spécialisé en droit français, et accessible au plus grand nombre.
            </p>
          </div>
          <div className="bg-[#f4f5f7] rounded-2xl p-10 text-center">
            <img src="/logo.png" alt="Orthos" className="h-24 w-24 object-contain mx-auto mb-6" />
            <div className="text-2xl font-bold text-[#1a2e5a] mb-2">ORTHOS</div>
            <div className="text-sm text-gray-400 mb-6">Du grec ancien — "correct", "juste", "droit"</div>
            <div className="text-sm text-gray-500 italic leading-relaxed">
              "Le droit est la plus puissante des écoles de l'imagination. Jamais poète n'a interprété la nature aussi librement qu'un juriste la réalité."
            </div>
            <div className="text-xs text-gray-400 mt-3">— Jean Giraudoux</div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="bg-[#f4f5f7] px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a2e5a] text-center mb-12">Nos valeurs</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Rigueur', desc: "Les réponses d'ORTHOS respectent la méthodologie juridique française. Chaque plan, chaque analyse suit les standards de la faculté de droit." },
              { icon: '📖', title: 'Pédagogie', desc: "ORTHOS explique, il ne récite pas. Chaque réponse est construite pour que l'étudiant comprenne vraiment, pas seulement pour qu'il copie." },
              { icon: '🤝', title: 'Accessibilité', desc: "L'excellence juridique ne doit pas être réservée à ceux qui peuvent se payer des cours particuliers. ORTHOS démocratise l'accès à un accompagnement de qualité." },
              { icon: '🔒', title: 'Fiabilité', desc: "Toutes les informations juridiques fournies par ORTHOS sont basées sur le droit positif français en vigueur, la jurisprudence et la doctrine reconnue." },
              { icon: '⚡', title: 'Efficacité', desc: "Le temps des étudiants est précieux. ORTHOS va droit au but, avec des réponses structurées et directement utilisables pour vos travaux." },
              { icon: '🌱', title: 'Évolution', desc: "ORTHOS s'améliore continuellement. Vos retours et suggestions alimentent directement le développement de nouvelles fonctionnalités." },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-semibold text-[#1a2e5a] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section className="px-8 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#1a2e5a] mb-4">Une équipe passionnée</h2>
        <p className="text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
          ORTHOS est construit par des personnes qui croient que la technologie peut transformer l'éducation juridique en France.
        </p>
        <div className="grid grid-cols-3 gap-8">
          {[
            { initials: 'F', role: 'Fondateur & CEO', desc: 'Étudiant en droit, convaincu que chaque étudiant mérite un accompagnement de qualité.' },
            { initials: 'IA', role: 'Intelligence Artificielle', desc: 'Propulsé par les modèles de langage les plus avancés, spécialisés pour le droit français.' },
            { initials: 'V', role: 'Vous', desc: 'La communauté ORTHOS grandit grâce à vos retours, suggestions et votre confiance.' },
          ].map((m) => (
            <div key={m.role} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#1a2e5a] flex items-center justify-center text-[#d4af37] font-bold text-xl mb-4">
                {m.initials}
              </div>
              <div className="font-semibold text-[#1a2e5a] mb-1">{m.role}</div>
              <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-[#1a2e5a] px-8 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Envie d'en savoir plus ?</h2>
          <p className="text-blue-200 mb-8 leading-relaxed">
            Pour toute question, partenariat ou suggestion, notre équipe est à votre écoute.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="mailto:contact@orthos.fr" className="bg-[#d4af37] text-[#1a2e5a] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              contact@orthos.fr
            </a>
            <a href="/chat" className="border border-blue-300 text-white px-6 py-3 rounded-lg font-medium hover:bg-[#243a6e] transition">
              Essayer ORTHOS →
            </a>
          </div>
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