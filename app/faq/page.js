export default function FAQ() {
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
          <a href="/faq" className="text-sm text-[#1a2e5a] font-medium">FAQ</a>
          <a href="/apropos" className="text-sm text-gray-500 hover:text-[#1a2e5a]">À propos</a>
          <a href="/chat" className="bg-[#1a2e5a] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#f4f5f7] px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#1a2e5a] mb-4">Questions fréquentes</h1>
          <p className="text-gray-500 leading-relaxed">
            Tout ce que vous devez savoir sur ORTHOS. Vous ne trouvez pas votre réponse ? Contactez-nous à <span className="text-[#1a2e5a] font-medium">contact@orthos.fr</span>
          </p>
        </div>
      </section>

      {/* FAQ SECTIONS */}
      <section className="px-8 py-20 max-w-3xl mx-auto">

        {[
          {
            category: "Sur ORTHOS",
            items: [
              { q: "Qu'est-ce qu'ORTHOS exactement ?", a: "ORTHOS est un assistant juridique intelligent spécialisé en droit français, conçu pour les étudiants en faculté de droit. Il combine l'intelligence artificielle avec une expertise juridique pour vous aider à comprendre vos cours, structurer vos exercices et réviser efficacement." },
              { q: "ORTHOS est-il fiable pour le droit français ?", a: "Oui. ORTHOS est spécialement calibré pour le droit français. Il maîtrise le Code civil, le Code pénal, le droit administratif, le droit constitutionnel et la méthodologie juridique française, notamment les plans en I/II, les commentaires d'arrêt et les cas pratiques." },
              { q: "ORTHOS remplace-t-il mon professeur ?", a: "Non, et ce n'est pas son objectif. ORTHOS est un outil de compréhension et de préparation. Il complète votre travail personnel et les cours de vos professeurs, mais ne les remplace pas. Nous vous recommandons toujours de vérifier les informations importantes dans les sources primaires." },
              { q: "Pour quelles années d'études est conçu ORTHOS ?", a: "ORTHOS est adapté à toutes les années de la licence et du master de droit (L1 à M2). Le niveau de réponse s'adapte automatiquement selon la complexité de votre question." },
            ]
          },
          {
            category: "Fonctionnalités",
            items: [
              { q: "Comment fonctionne l'upload de fichiers ?", a: "Vous pouvez déposer un arrêt, un cours ou un TD directement dans le chat en cliquant sur l'icône trombone. ORTHOS analysera le document et vous proposera un commentaire, un plan ou un résumé selon votre besoin. Les formats acceptés sont PDF et TXT." },
              { q: "Quels sont les différents modes disponibles ?", a: "ORTHOS propose 6 modes spécialisés : Question libre, Dissertation (avec problématique et plan I/II), Commentaire d'arrêt, Fiche de révision, Cas pratique, et Explication de concept. Chaque mode adapte la réponse à l'exercice demandé." },
              { q: "Mon historique de conversations est-il sauvegardé ?", a: "Dans la version actuelle, l'historique est conservé pendant votre session. La sauvegarde permanente entre les sessions sera disponible avec le système de compte utilisateur dans la prochaine version." },
              { q: "Puis-je utiliser ORTHOS sur mobile ?", a: "Oui, ORTHOS est accessible depuis n'importe quel navigateur sur mobile, tablette ou ordinateur. Une application mobile dédiée est prévue dans les prochaines versions." },
            ]
          },
          {
            category: "Abonnement & paiement",
            items: [
              { q: "Le plan gratuit est-il vraiment gratuit ?", a: "Oui, sans carte bancaire requise. Vous avez accès aux fonctionnalités de base indéfiniment, avec une limite de 5 QCM et 5 flashcards par semaine." },
              { q: "Puis-je résilier mon abonnement à tout moment ?", a: "Oui, vous pouvez résilier à tout moment depuis votre tableau de bord. Vous conservez l'accès aux fonctionnalités premium jusqu'à la fin de la période payée." },
              { q: "Y a-t-il une garantie satisfait ou remboursé ?", a: "Oui. Si ORTHOS ne vous convient pas dans les 7 premiers jours suivant votre abonnement, nous vous remboursons intégralement. Sans question." },
              { q: "Y a-t-il des tarifs groupés pour les associations étudiantes ?", a: "Oui, nous proposons des tarifs spéciaux pour les associations d'étudiants en droit et les facultés. Contactez-nous à contact@orthos.fr pour discuter de votre projet." },
            ]
          },
        ].map((section) => (
          <div key={section.category} className="mb-14">
            <h2 className="text-xl font-bold text-[#1a2e5a] mb-6 pb-3 border-b border-gray-200">
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.q} className="bg-[#f4f5f7] rounded-xl p-6 hover:bg-[#eef1f8] transition">
                  <h3 className="font-semibold text-[#1a2e5a] mb-2">{item.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

      </section>

      {/* CONTACT */}
      <section className="bg-[#f4f5f7] px-8 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-[#1a2e5a] mb-3">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-gray-500 mb-6">Notre équipe est disponible pour répondre à toutes vos questions.</p>
          <a href="mailto:contact@orthos.fr" className="inline-block bg-[#1a2e5a] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition">
            Nous contacter →
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