import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req) {
  const { title, content } = await req.json()

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Tu es ORTHOS, assistant juridique spécialisé en droit français.

À partir du cours suivant intitulé "${title}", génère exactement 5 questions QCM juridiques.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, dans ce format exact :
[
  {
    "q": "Question juridique précise ?",
    "choices": ["Bonne réponse", "Mauvaise réponse 1", "Mauvaise réponse 2", "Mauvaise réponse 3"],
    "answer": 0,
    "explication": "Explication juridique de la bonne réponse."
  }
]

Cours :
${content}`
    }],
    max_tokens: 1500,
  })

  const text = completion.choices[0]?.message?.content?.replace(/\`\`\`json|\`\`\`/g, '').trim()

  try {
    const questions = JSON.parse(text)
    return Response.json({ questions })
  } catch {
    return Response.json({ questions: [] })
  }
}