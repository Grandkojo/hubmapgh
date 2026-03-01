'use client'

import { Hub } from '@/types/hub'
import { trackHubView } from '@/lib/firebase'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'

interface HubCardProps {
  hub: Hub
  index: number
  onSelect: (hub: Hub) => void
  isSelected: boolean
  aiReason?: string
  aiRank?: number
}

const TAG_COLORS: Record<string, string> = {
  'Incubator': 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  'Seed Fund': 'bg-green-900/40 text-green-300 border-green-700/50',
  'Training': 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  'Co-working': 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  'Social Impact': 'bg-pink-900/40 text-pink-300 border-pink-700/50',
  'Makerspace': 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  'Hardware': 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  'AI': 'bg-violet-900/40 text-violet-300 border-violet-700/50',
  'Women in Tech': 'bg-rose-900/40 text-rose-300 border-rose-700/50',
  'Software Engineering': 'bg-sky-900/40 text-sky-300 border-sky-700/50',
  'Pan-African': 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  'default': 'bg-zinc-800/60 text-zinc-400 border-zinc-600/50',
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || TAG_COLORS['default']
}

export default function HubCard({ hub, index, onSelect, isSelected, aiReason, aiRank }: HubCardProps) {
  const [showCopyAlert, setShowCopyAlert] = useState(false)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hub.name + ' ' + hub.neighborhood + ' ' + hub.city)}&query_place_id=${hub.coordinates.lat},${hub.coordinates.lng}`
  const isAIMatch = !!aiReason

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareData = {
      title: hub.name,
      text: `Check out ${hub.name} on the Ghana Tech Hub Directory!`,
      url: hub.website && hub.website !== '#' ? hub.website : window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        setShowCopyAlert(true)
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank')
      }
    }
  }

  return (
    <>
      <div
        className="hub-card group cursor-pointer"
        style={{ animationDelay: `${index * 60}ms` }}
        onClick={() => onSelect(hub)}
      >
        <div
          className={`
          relative rounded-xl border transition-all duration-300 overflow-hidden
          ${isAIMatch
              ? 'border-ghana-gold/50 bg-ghana-gold/5 shadow-[0_0_20px_rgba(244,185,66,0.1)]'
              : isSelected
                ? 'border-ghana-gold/60 bg-surface-hover shadow-[0_0_24px_rgba(244,185,66,0.12)]'
                : 'border-surface-border bg-surface-card hover:border-zinc-600 hover:bg-surface-hover'
            }
        `}
        >
          {/* Top accent */}
          <div
            className={`h-0.5 w-full transition-all duration-500 ${isAIMatch || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`}
            style={{ background: 'linear-gradient(90deg, #CF0A0A, #F4B942, #006B3F)' }}
          />

          <div className="p-4 sm:p-5">
            {/* AI match banner */}
            {isAIMatch && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-ghana-gold/10 border border-ghana-gold/20">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {aiRank && (
                    <span className="w-5 h-5 rounded-full bg-ghana-gold text-black text-[10px] font-bold flex items-center justify-center font-display">
                      {aiRank}
                    </span>
                  )}
                  <svg className="w-3.5 h-3.5 text-ghana-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-[10px] sm:text-xs text-ghana-gold/90 font-body italic leading-tight">{aiReason}</p>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3
                    className="font-display font-semibold text-sm sm:text-base text-white truncate leading-tight"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    {hub.name}
                  </h3>
                  {hub.verified && (
                    <span
                      title="Verified — confirmed active as of 2026"
                      className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-ghana-gold/20 border border-ghana-gold/60 flex items-center justify-center"
                    >
                      <svg className="w-2 h-2 text-ghana-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-body truncate">
                  {hub.neighborhood}, {hub.city} · Est. {hub.founded}
                </p>
              </div>
              <span className="hidden xs:block flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-body">
                {hub.city}
              </span>
            </div>

            {/* Description */}
            <p className="text-[11px] sm:text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2 font-body">
              {hub.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {hub.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-[9px] sm:text-xs px-2 py-0.5 rounded-md border font-medium font-body ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col xs:flex-row gap-2 pt-3 border-t border-surface-border">
              {hub.website && hub.website !== '#' ? (
                <a
                  href={hub.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => { e.stopPropagation(); trackHubView(hub.id, hub.name) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-medium font-body
                           bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500
                           transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Site
                </a>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-body
                              bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed">
                  No Website
                </div>
              )}

              <div className="flex gap-2 flex-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-medium font-body
                           bg-ghana-gold/10 hover:bg-ghana-gold/20 text-ghana-gold hover:text-amber-300 border border-ghana-gold/30 hover:border-ghana-gold/50
                           transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Directions
                </a>

                <button
                  onClick={handleShare}
                  className="w-10 h-8 sm:h-9 flex items-center justify-center rounded-lg flex-shrink-0
                           bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-800/40 hover:border-green-600/60
                           transition-all duration-200 group/share"
                  title="Share Hub"
                >
                  <svg className="w-3.5 h-3.5 group-hover/share:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCopyAlert}
        title="Link Copied!"
        message="The hub details have been copied to your clipboard."
        confirmText="Awesome"
        onConfirm={() => setShowCopyAlert(false)}
        type="success"
      />
    </>
  )
}
