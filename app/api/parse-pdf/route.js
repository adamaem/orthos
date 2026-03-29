import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Extraction du texte avec unpdf
    const { text } = await extractText(buffer, { mergePages: true });

    if (!text || text.trim().length < 20) {
      return NextResponse.json({
        error: 'Ce PDF est scanné (image). Essayez un PDF avec du texte sélectionnable.'
      }, { status: 422 });
    }

    // Groq convertit en Markdown propre
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant qui convertit du texte brut extrait de PDF en Markdown propre et structuré. Tu retranscris fidèlement le contenu sans résumer ni commenter.',
        },
        {
          role: 'user',
          content: `Convertis ce texte brut en Markdown bien structuré :\n\n${text}`,
        },
      ],
    });

    const markdown = response.choices[0].message.content;
    return NextResponse.json({ text: markdown });

  } catch (error) {
    console.error('Erreur parse-pdf:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture du PDF' }, { status: 500 });
  }
}