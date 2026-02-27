import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import hubsData from '../../../../data/hubs.json'

export const runtime = 'nodejs'

interface RecommendationResult {
  hubId: string
  reason: string
  score: number
}

// Minimal hub context — keep token count low
const HUB_CONTEXT = hubsData.map(h => ({
  id: h.id,
  name: h.name,
  city: h.city,
  neighborhood: h.neighborhood,
  tags: h.tags,
  description: h.description,
  verified: h.verified,
}))

const SYSTEM_PROMPT = `You are a helpful assistant for Hub Map GH — a directory of Ghana's tech ecosystem.
Your job is to recommend the best matching tech hubs based on what the user is looking for.

You have access to this list of hubs:
${JSON.stringify(HUB_CONTEXT, null, 2)}

Rules:
- Return ONLY valid JSON. No markdown, no explanation outside the JSON.
- Return the best 2 matches, ranked by relevance (most relevant first).
- Each item must have: hubId (string), reason (string, max 15 words, punchy and specific), score (number 1-100).
- If the query is in Twi, Pidgin, or another Ghanaian language, understand it and still respond in English.
- If no hubs match well, return the top 2 most general options.
- Be specific in reasons — mention the city, a tag, or a unique feature.

Response format (strict JSON array):
[
  { "hubId": "...", "reason": "...", "score": 95 },
  { "hubId": "...", "reason": "...", "score": 80 }
]`

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters.' },
        { status: 400 }
      )
    }

    if (query.trim().length > 300) {
      return NextResponse.json(
        { error: 'Query too long. Keep it under 300 characters.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured. Add GEMINI_API_KEY to your .env.local' },
        { status: 503 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro-latest',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    })

    const prompt = `${SYSTEM_PROMPT}\n\nUser query: "${query.trim()}"`
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text().trim()

    // Clean up wrap just in case (Gemini sometimes wraps JSON in markdown blocks)
    let cleanedText = text
    if (cleanedText.includes('```')) {
      cleanedText = cleanedText.replace(/```json\n?|```/g, '').trim()
    }

    // Parse and validate
    let recommendations: RecommendationResult[]
    try {
      const parsed = JSON.parse(cleanedText)
      recommendations = Array.isArray(parsed) ? parsed : []
    } catch (err: any) {
      console.error('Gemini returned non-JSON:', cleanedText)
      return NextResponse.json(
        { error: 'AI returned an unexpected response format. Try again.', details: err.message },
        { status: 500 }
      )
    }

    // Validate hub IDs exist
    const validIds = new Set(hubsData.map(h => h.id))
    const validated = recommendations
      .filter(r => validIds.has(r.hubId) && r.reason && typeof r.score === 'number')
      .slice(0, 2) // Limit to top 2 matches as requested

    return NextResponse.json({ recommendations: validated })

  } catch (err: any) {
    console.error('Recommend API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
