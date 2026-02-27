'use client'

import { useState, useRef, useEffect } from 'react'

interface FilterBarProps {
  selectedCity: string
  onCityChange: (city: string) => void
  selectedTag: string
  onTagChange: (tag: string) => void
  allTags: string[]
  resultCount: number
  totalCount: number
}

const CITIES = ['All', 'Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Other']

function CustomDropdown({ label, options, selected, onSelect, icon }: {
  label: string,
  options: string[],
  selected: string,
  onSelect: (val: string) => void,
  icon?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1.5 font-body font-bold ml-1">
        {label}
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium font-body transition-all duration-300
          border ${isOpen ? 'border-ghana-gold/50 bg-ghana-gold/5' : 'border-surface-border bg-surface-card'}
          hover:border-zinc-500 text-zinc-300 group
        `}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className={selected !== 'All' && selected !== 'All Focus Areas' ? 'text-ghana-gold' : ''}>
            {selected === 'All' ? `Any ${label}` : selected}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-ghana-gold' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-surface-card border border-surface-border rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          {options.map(option => (
            <button
              key={option}
              onClick={() => {
                onSelect(option)
                setIsOpen(false)
              }}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors
                ${(selected === option || (selected === 'All' && option === 'All'))
                  ? 'bg-ghana-gold/10 text-ghana-gold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}
              `}
            >
              {option === 'All' && label === 'Focus' ? 'All Focus Areas' : option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({
  selectedCity,
  onCityChange,
  selectedTag,
  onTagChange,
  allTags,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const focusOptions = ['All', ...allTags]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomDropdown
          label="City"
          options={CITIES}
          selected={selectedCity}
          onSelect={onCityChange}
          icon={(
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        />
        <CustomDropdown
          label="Focus"
          options={focusOptions}
          selected={selectedTag}
          onSelect={onTagChange}
          icon={(
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] text-zinc-600 font-body uppercase tracking-wider">
          Found <span className="text-zinc-400 font-bold">{resultCount}</span> hubs
        </p>
        {(selectedCity !== 'All' || selectedTag !== 'All') && (
          <button
            onClick={() => { onCityChange('All'); onTagChange('All') }}
            className="text-[11px] text-ghana-gold hover:text-amber-300 transition-colors uppercase font-bold tracking-wider"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

