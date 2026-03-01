'use client'

import { useState, useRef, useEffect } from 'react'

interface FormMultiSelectProps {
    label: string
    options: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
}

export default function FormMultiSelect({ label, options, selected, onChange, placeholder }: FormMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
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

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option))
        } else {
            onChange([...selected, option])
        }
    }

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1 mb-2 block">
                {label}
            </label>

            <div
                className={`
                    w-full min-h-[50px] sm:min-h-[60px] flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300
                    border ${isOpen ? 'border-ghana-gold/50 bg-ghana-gold/5' : 'border-surface-border bg-surface'}
                    hover:border-zinc-500 cursor-pointer
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected.length > 0 ? (
                    selected.map(tag => (
                        <span
                            key={tag}
                            className="bg-ghana-gold/10 text-ghana-gold px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 animate-in fade-in zoom-in duration-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleOption(tag)
                                }}
                                className="hover:text-amber-200 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-zinc-700 text-sm sm:text-lg font-body">{placeholder || `Select ${label}`}</span>
                )}

                <div className="ml-auto flex items-center gap-2">
                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange([])
                            }}
                            className="text-[10px] sm:text-xs font-bold text-zinc-600 hover:text-ghana-red transition-colors uppercase tracking-widest mr-2"
                        >
                            Clear
                        </button>
                    )}
                    <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-ghana-gold' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-surface-card border border-surface-border rounded-xl sm:rounded-2xl shadow-2xl z-[110] backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-surface-border mb-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search tags..."
                            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-ghana-gold/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleOption(option)}
                                    className={`
                                        w-full text-left px-4 py-2.5 rounded-lg text-sm sm:text-base font-body transition-colors flex items-center justify-between
                                        ${selected.includes(option)
                                            ? 'bg-ghana-gold/10 text-ghana-gold'
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}
                                    `}
                                >
                                    <span>{option}</span>
                                    {selected.includes(option) && (
                                        <svg className="w-5 h-5 text-ghana-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-zinc-600 text-center font-body italic">
                                No tags found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
