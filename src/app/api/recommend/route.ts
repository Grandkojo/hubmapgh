import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
import { getCachedData, updateServerCache } from '@/lib/cache'
import crypto from 'crypto'

export const runtime = 'nodejs'

interface RecommendationResult {
  hubId: string
  reason: string
  score: number
}

export async function POST(req: NextRequest) {
  try {
    const { query: userQuery } = await req.json()

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters.' },
        { status: 400 }
      )
    }

    // Rate Limiting & Data Fetching (Concurrent)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const ipHash = crypto.createHash('md5').update(ip).digest('hex')
    const today = new Date().toISOString().split('T')[0]
    const limitDocRef = doc(db, 'usage_limits', `${ipHash}_${today}`)

    const [limitDoc, cacheStatus] = await Promise.all([
      getDoc(limitDocRef),
      getCachedData()
    ])

    const currentCount = limitDoc.exists() ? limitDoc.data().count : 0

    if (currentCount >= 3) {
      return NextResponse.json(
        { error: "Daily limit reached. You've used your 3 AI recommendations for today. Come back tomorrow!" },
        { status: 429 }
      )
    }

    if (userQuery.trim().length > 300) {
      return NextResponse.json(
        { error: 'Query too long. Keep it under 300 characters.' },
        { status: 400 }
      )
    }

    // Get hubs from cache or fetch if stale
    let hubsData: any[] = []
    if (cacheStatus && cacheStatus.fromCache) {
      hubsData = cacheStatus.hubs.map((h: any) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        neighborhood: h.neighborhood,
        tags: h.tags,
        description: h.description,
      }))
    } else {
      const hubsSnapshot = await getDocs(query(collection(db, 'hubs'), where('verified', '==', true)))
      hubsData = hubsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.get('name'),
        city: doc.get('city'),
        neighborhood: doc.get('neighborhood'),
        tags: doc.get('tags'),
        description: doc.get('description'),
      }))

      // Update cache if we have metadata
      if (cacheStatus) {
        updateServerCache(hubsData, cacheStatus.metadata, cacheStatus.currentLastUpdated!)
      }
    }

    const systemPrompt = `You are a helpful assistant for Hub Map GH — a directory of Ghana's tech ecosystem.
Your job is to recommend the best matching tech hubs based on what the user is looking for.

You have access to this list of hubs:
${JSON.stringify(hubsData, null, 2)}

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
]`;

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

    const prompt = `${systemPrompt}\n\nUser query: "${userQuery.trim()}"`
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

    // If successful, increment the usage count
    await setDoc(limitDocRef, {
      count: increment(1),
      lastUsed: serverTimestamp(),
      ipHash: ipHash,
      date: today
    }, { merge: true })

    return NextResponse.json({
      recommendations: validated,
      usageRemaining: 3 - (currentCount + 1)
    })

  } catch (err: any) {
    console.error('Recommend API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
