'use client'

import { useState, useRef } from 'react'
import { Hub } from '@/types/hub'
import { trackAIQuery } from '@/lib/firebase'

interface Recommendation {
  hubId: string
  reason: string
  score: number
}

interface AIRecommenderProps {
  onResults: (hubIds: string[], reasons: Record<string, string>) => void
  onClear: () => void
}

const EXAMPLE_QUERIES = [
  "Fintech startup in Accra looking for seed funding",
  "Student in Kumasi building a hardware prototype",
]

export default function AIRecommender({ onResults, onClear }: AIRecommenderProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasResults, setHasResults] = useState(false)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(q?: string) {
    const finalQuery = (q ?? query).trim()
    if (!finalQuery || loading || usageRemaining === 0) return

    setLoading(true)
    setError('')
    setHasResults(false)

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setError(data.error)
        setUsageRemaining(0)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      const { recommendations, usageRemaining: remaining } = data as {
        recommendations: Recommendation[],
        usageRemaining?: number
      }

      if (remaining !== undefined) {
        setUsageRemaining(remaining)
      }

      if (!recommendations.length) {
        setError('No strong matches found. Try describing your needs differently.')
        return
      }

      const hubIds = recommendations.map(r => r.hubId)
      const reasons = Object.fromEntries(recommendations.map(r => [r.hubId, r.reason]))

      onResults(hubIds, reasons)
      setHasResults(true)

      // Fire analytics (non-blocking)
      trackAIQuery(finalQuery, recommendations.length)

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuery('')
    setError('')
    setHasResults(false)
    setActiveExample(null)
    onClear()
    inputRef.current?.focus()
  }

  function handleExample(example: string) {
    if (usageRemaining === 0) return
    setQuery(example)
    setActiveExample(example)
    setError('')
    handleSubmit(example)
  }

  return (
    <div className="rounded-2xl border border-ghana-gold/20 bg-gradient-to-br from-ghana-gold/5 via-surface-card to-surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-ghana-gold/10">
        <div className="w-8 h-8 rounded-lg bg-ghana-gold/15 border border-ghana-gold/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-ghana-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white font-display" style={{ fontFamily: 'var(--font-syne)' }}>
            Find My Hub — AI Recommender
          </h3>
          <p className="text-xs text-zinc-500 font-body">
            {usageRemaining !== null && usageRemaining <= 1
              ? `You have ${usageRemaining} match${usageRemaining === 1 ? '' : 'es'} left today 🇬🇭`
              : 'Describe what you need in plain English (or Twi 🇬🇭)'
            }
          </p>
        </div>
        {hasResults && (
          <button
            onClick={handleClear}
            className="ml-auto text-xs text-zinc-500 hover:text-ghana-gold transition-colors font-body flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Input */}
        <div className="relative">
          <textarea
            ref={inputRef}
            disabled={usageRemaining === 0}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={usageRemaining === 0 ? "Daily limit reached. Try again tomorrow!" : "e.g. I'm looking for a hardware hub in Kumasi..."}
            rows={2}
            className={`w-full px-4 py-3 pr-20 xs:pr-24 rounded-xl bg-surface border border-surface-border text-white
                       placeholder-zinc-600 font-body text-sm resize-none
                       focus:outline-none focus:border-ghana-gold/50 focus:ring-1 focus:ring-ghana-gold/20
                       transition-all duration-200 ${usageRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!query.trim() || loading || usageRemaining === 0}
            className={`
              absolute right-2 bottom-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium font-body
              flex items-center gap-1 sm:gap-1.5 transition-all duration-200
              ${query.trim() && !loading && usageRemaining !== 0
                ? 'bg-ghana-gold text-black hover:bg-amber-400 shadow-[0_0_12px_rgba(244,185,66,0.3)]'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                <span className="hidden xs:inline">Thinking...</span>
                <span className="xs:hidden">...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Match
              </>
            )}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-[10px] sm:text-xs font-body">
            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Example queries */}
        {!hasResults && (
          <div>
            <p className="text-[10px] sm:text-xs text-zinc-600 font-body mb-2">Try an example:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              {EXAMPLE_QUERIES.map(ex => (
                <button
                  key={ex}
                  onClick={() => handleExample(ex)}
                  disabled={loading || usageRemaining === 0}
                  className={`
                    flex-1 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border font-body transition-all duration-200 text-center
                    ${activeExample === ex
                      ? 'bg-ghana-gold/15 border-ghana-gold/40 text-ghana-gold'
                      : 'bg-surface border-surface-border text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }
                    ${loading || usageRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success state hint */}
        {hasResults && !error && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-body">
            <div className="w-1.5 h-1.5 rounded-full bg-ghana-green animate-pulse" />
            Showing AI-matched hubs below — highlighted in gold
          </div>
        )}
      </div>
    </div>
  )
}
