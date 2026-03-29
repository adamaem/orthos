import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req) {
  const { title, content } = await req.json()

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Tu es ORTHOS, assistant juridique spécialisé en droit français.

À partir du cours suivant intitulé "${title}", génère exactement 8 flashcards de révision juridiques.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, dans ce format exact :
[
  {"q": "Question juridique précise ?", "r": "Réponse complète et rigoureuse."}
]

Cours :
${content}`
    }],
    max_tokens: 1500,
  })

  const text = completion.choices[0]?.message?.content?.replace(/\`\`\`json|\`\`\`/g, '').trim()

  try {
    const flashcards = JSON.parse(text)
    return Response.json({ flashcards })
  } catch {
    return Response.json({ flashcards: [] })
  }
}