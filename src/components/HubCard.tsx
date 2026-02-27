'use client'

import { Hub } from '@/types/hub'
import { trackHubView } from '@/lib/firebase'

interface HubCardProps {
  hub: Hub
  index: number
  onSelect: (hub: Hub) => void
  isSelected: boolean
  aiReason?: string
  aiRank?: number
}

const TAG_COLORS: Record<string, string> = {
  'Incubator':          'bg-amber-900/40 text-amber-300 border-amber-700/50',
  'Seed Fund':          'bg-green-900/40 text-green-300 border-green-700/50',
  'Training':           'bg-blue-900/40 text-blue-300 border-blue-700/50',
  'Co-working':         'bg-purple-900/40 text-purple-300 border-purple-700/50',
  'Social Impact':      'bg-pink-900/40 text-pink-300 border-pink-700/50',
  'Makerspace':         'bg-orange-900/40 text-orange-300 border-orange-700/50',
  'Hardware':           'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  'AI':                 'bg-violet-900/40 text-violet-300 border-violet-700/50',
  'Women in Tech':      'bg-rose-900/40 text-rose-300 border-rose-700/50',
  'Software Engineering':'bg-sky-900/40 text-sky-300 border-sky-700/50',
  'Pan-African':        'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  'default':            'bg-zinc-800/60 text-zinc-400 border-zinc-600/50',
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || TAG_COLORS['default']
}

export default function HubCard({ hub, index, onSelect, isSelected, aiReason, aiRank }: HubCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hub.coordinates.lat},${hub.coordinates.lng}`
  const isAIMatch = !!aiReason

  return (
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
          className={`h-0.5 w-full transition-all duration-500 ${
            isAIMatch || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`}
          style={{ background: 'linear-gradient(90deg, #CF0A0A, #F4B942, #006B3F)' }}
        />

        <div className="p-5">
          {/* AI match banner */}
          {isAIMatch && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-ghana-gold/10 border border-ghana-gold/20">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {aiRank && (
                  <span className="w-5 h-5 rounded-full bg-ghana-gold text-black text-xs font-bold flex items-center justify-center font-display">
                    {aiRank}
                  </span>
                )}
                <svg className="w-3.5 h-3.5 text-ghana-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-xs text-ghana-gold/90 font-body italic">{aiReason}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3
                  className="font-display font-semibold text-base text-white truncate leading-tight"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {hub.name}
                </h3>
                {hub.verified && (
                  <span
                    title="Verified — confirmed active as of 2026"
                    className="flex-shrink-0 w-4 h-4 rounded-full bg-ghana-gold/20 border border-ghana-gold/60 flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-ghana-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-body">
                {hub.neighborhood}, {hub.city} · Est. {hub.founded}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-body">
              {hub.city}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2 font-body">
            {hub.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hub.tags.map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-md border font-medium font-body ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-surface-border">
            {hub.website && hub.website !== '#' ? (
              <a
                href={hub.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.stopPropagation(); trackHubView(hub.id, hub.name) }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-body
                           bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500
                           transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Site
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body
                              bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed">
                No Website
              </div>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-body
                         bg-ghana-gold/10 hover:bg-ghana-gold/20 text-ghana-gold hover:text-amber-300 border border-ghana-gold/30 hover:border-ghana-gold/50
                         transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Directions
            </a>

            <a
              href={`https://wa.me/?text=Check out ${hub.name}: ${hub.website !== '#' ? hub.website : 'https://ghtechhubs.vercel.app'}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0
                         bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-800/40 hover:border-green-600/60
                         transition-all duration-200"
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
