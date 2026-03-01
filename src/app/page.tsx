'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Hub } from '@/types/hub'
import HubCard from '@/components/HubCard'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import AIRecommender from '@/components/AIRecommender'
import { trackFilter, db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const HubMap = dynamic(() => import('@/components/HubMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-surface-border bg-surface-card flex items-center justify-center" style={{ height: '480px' }}>
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-sm font-body">Loading map...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [hubs, setHubs] = useState<Hub[]>([])
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<{ cities: string[], focusAreas: string[] }>({ cities: [], focusAreas: [] })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/hubs')
        const data = await res.json()
        if (data.hubs) setHubs(data.hubs)
        if (data.metadata) setMetadata(data.metadata)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const allTags = useMemo(() => metadata.focusAreas.length > 0 ? metadata.focusAreas : Array.from(new Set(hubs.flatMap(h => h.tags))).sort(), [hubs, metadata.focusAreas])
  const allCities = useMemo(() => metadata.cities.length > 0 ? metadata.cities : Array.from(new Set(hubs.map(h => h.city))).sort(), [hubs, metadata.cities])

  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('All')
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null)
  const [showMap, setShowMap] = useState(true)

  // AI state
  const [aiMatchIds, setAiMatchIds] = useState<string[]>([])
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({})
  const [aiMode, setAiMode] = useState(false)

  function handleAIResults(hubIds: string[], reasons: Record<string, string>) {
    setAiMatchIds(hubIds)
    setAiReasons(reasons)
    setAiMode(true)
    // Reset manual filters so AI results show cleanly
    setCityFilter('All')
    setTagFilter('All')
    setSearch('')
  }

  function handleAIClear() {
    setAiMatchIds([])
    setAiReasons({})
    setAiMode(false)
  }

  const filteredHubs = useMemo(() => {
    // In AI mode — show matched hubs first, then rest dimmed; no filter applied
    if (aiMode && aiMatchIds.length) {
      const matched = aiMatchIds.map(id => hubs.find(h => h.id === id)).filter(Boolean) as Hub[]
      const unmatched = hubs.filter(h => !aiMatchIds.includes(h.id))
      return [...matched, ...unmatched]
    }

    return hubs.filter(hub => {
      const matchesCity = cityFilter === 'All' || hub.city === cityFilter

      const matchesTag = tagFilter === 'All' || hub.tags.includes(tagFilter)

      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        hub.name.toLowerCase().includes(q) ||
        hub.city.toLowerCase().includes(q) ||
        hub.description.toLowerCase().includes(q) ||
        hub.tags.some(t => t.toLowerCase().includes(q)) ||
        hub.neighborhood.toLowerCase().includes(q)

      return matchesCity && matchesTag && matchesSearch
    })
  }, [hubs, search, cityFilter, tagFilter, aiMode, aiMatchIds])

  const displayedHubs = aiMode
    ? filteredHubs
    : filteredHubs

  // Deselect hub if filtered out
  useEffect(() => {
    if (selectedHub && !filteredHubs.find(h => h.id === selectedHub.id)) {
      setSelectedHub(null)
    }
  }, [filteredHubs, selectedHub])

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="ghana-bar" />

      {/* Header */}
      <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col h-5 w-8 rounded overflow-hidden flex-shrink-0">
              <div className="flex-1 bg-ghana-red" />
              <div className="flex-1 bg-ghana-gold flex items-center justify-center">
                <div className="w-2 h-2 bg-black" style={{
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                }} />
              </div>
              <div className="flex-1 bg-ghana-green" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-white leading-none truncate" style={{ fontFamily: 'var(--font-syne)' }}>
                Hub Map GH
              </h1>
              <p className="hidden xs:block text-[10px] text-zinc-500 font-body leading-none mt-1 truncate">Ghana's Tech Ecosystem Directory</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowMap(v => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium font-body
                         bg-surface-card border border-surface-border text-zinc-400 hover:text-zinc-200
                         transition-all duration-200 sm:hidden"
            >
              {showMap ? 'List' : 'Map'}
            </button>
            <Link
              href="/submit"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold font-body
                         bg-ghana-gold/10 border border-ghana-gold/30 text-ghana-gold hover:bg-ghana-gold/20
                         transition-all duration-200 whitespace-nowrap"
            >
              Submit <span className="hidden xs:inline">a Hub</span>
            </Link>
            <a
              href="https://github.com/Grandkojo/hubmapgh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-medium font-body px-2 py-1 rounded-full bg-ghana-gold/10 text-ghana-gold border border-ghana-gold/20">
              🇬🇭 Made in Ghana
            </span>
            <span className="text-[10px] sm:text-xs font-body text-zinc-600">
              {hubs.filter(h => h.verified).length} verified · {hubs.length} total
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'var(--font-syne)' }}>
            Find Your{' '}
            <span className="text-ghana-gold">Tech Hub</span>
            <br />Across Ghana
          </h2>
          <p className="text-zinc-400 font-body text-sm sm:text-base leading-relaxed">
            The definitive directory of tech spaces powering Ghana's innovation ecosystem.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-5">

        {/* AI Recommender */}
        <AIRecommender onResults={handleAIResults} onClear={handleAIClear} />

        {/* Search + Filters — only show when not in AI mode */}
        {!aiMode && (
          <>
            <SearchBar
              value={search}
              onChange={v => { setSearch(v); trackFilter('search', v) }}
            />
            <FilterBar
              selectedCity={cityFilter}
              onCityChange={v => { setCityFilter(v); trackFilter('city', v) }}
              selectedTag={tagFilter}
              onTagChange={v => { setTagFilter(v); trackFilter('tag', v) }}
              allTags={allTags}
              allCities={allCities}
              resultCount={filteredHubs.length}
              totalCount={hubs.length}
            />
          </>
        )}

        {/* AI mode result summary bar */}
        {aiMode && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-ghana-gold/5 border border-ghana-gold/15">
            <div className="flex items-center gap-2 text-sm font-body text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-ghana-gold animate-pulse" />
              Showing <span className="text-ghana-gold font-medium">{aiMatchIds.length} AI-matched</span> hubs first
            </div>
            <button
              onClick={handleAIClear}
              className="text-xs text-zinc-500 hover:text-ghana-gold transition-colors font-body"
            >
              Back to full directory →
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Cards */}
          <div className={`space-y-3 sm:block`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-surface-border rounded-xl bg-surface-card">
                <div className="w-8 h-8 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-500 text-sm font-body">Fetching latest ecosystem data...</p>
              </div>
            ) : displayedHubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-surface-border rounded-xl bg-surface-card">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-white font-semibold mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
                  No hubs found
                </h3>
                <p className="text-zinc-500 text-sm font-body">Try adjusting your search or filters</p>
              </div>
            ) : (
              displayedHubs.map((hub, i) => {
                const isAIMatch = aiMode && aiMatchIds.includes(hub.id)
                const aiRank = isAIMatch ? aiMatchIds.indexOf(hub.id) + 1 : undefined
                return (
                  <div
                    key={hub.id}
                    className={!isAIMatch && aiMode ? 'opacity-40 hover:opacity-70 transition-opacity' : ''}
                  >
                    <HubCard
                      hub={hub}
                      index={i}
                      onSelect={setSelectedHub}
                      isSelected={selectedHub?.id === hub.id}
                      aiReason={isAIMatch ? aiReasons[hub.id] : undefined}
                      aiRank={aiRank}
                    />
                  </div>
                )
              })
            )}
          </div>

          {/* Map — sticky on desktop */}
          <div className={`${showMap ? 'block' : 'hidden'} sm:block`}>
            <div className="lg:sticky lg:top-24">
              <HubMap
                hubs={aiMode ? hubs.filter(h => aiMatchIds.includes(h.id)) : filteredHubs}
                selectedHub={selectedHub}
                onSelectHub={setSelectedHub}
              />
              {selectedHub && (
                <div className="mt-3 p-3 rounded-xl border border-ghana-gold/30 bg-ghana-gold/5 text-sm font-body text-zinc-300">
                  <span className="text-ghana-gold font-medium">{selectedHub.name}</span>
                  {' '}— {selectedHub.neighborhood}, {selectedHub.city}
                  <button onClick={() => setSelectedHub(null)} className="ml-2 text-zinc-600 hover:text-zinc-400">✕</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 text-center">
        <div className="ghana-bar mb-6" />
        <p className="text-zinc-600 text-sm font-body">
          Built for the{' '}
          <a href="https://dev.to/challenges/weekend-2026-02-28" target="_blank" rel="noopener noreferrer" className="text-ghana-gold hover:text-amber-300 transition-colors">
            DEV Weekend Challenge
          </a>
          {' '}by{' '}
          <a href="https://portfolio.grandkojo.my" target="_blank" rel="noopener noreferrer" className="text-ghana-gold hover:text-amber-300 transition-colors">
            Ernest Kojo Owusu Essien
          </a>
        </p>
        <p className="text-zinc-700 text-xs font-body mt-1">Data is community-maintained. Last verified: 2026.</p>
      </footer>
    </div>
  )
}
