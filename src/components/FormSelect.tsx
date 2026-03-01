'use client'

import { useState, useRef, useEffect } from 'react'

interface FormSelectProps {
    label: string
    options: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    required?: boolean
}

export default function FormSelect({ label, options, value, onChange, placeholder, required }: FormSelectProps) {
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

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1 mb-2 block">
                {label} {required && '*'}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-body transition-all duration-300
                    border ${isOpen ? 'border-ghana-gold/50 bg-ghana-gold/5' : 'border-surface-border bg-surface'}
                    hover:border-zinc-500 outline-none
                    ${value ? 'text-white' : 'text-zinc-700'}
                `}
            >
                <span className="truncate">{value || placeholder || `Select ${label}`}</span>
                <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-ghana-gold' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-surface-card border border-surface-border rounded-xl sm:rounded-2xl shadow-2xl z-[110] backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-surface-border mb-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search..."
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
                                    onClick={() => {
                                        onChange(option)
                                        setIsOpen(false)
                                        setSearch('')
                                    }}
                                    className={`
                                        w-full text-left px-4 py-2.5 rounded-lg text-sm sm:text-base font-body transition-colors
                                        ${value === option
                                            ? 'bg-ghana-gold/10 text-ghana-gold'
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}
                                    `}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-zinc-600 text-center font-body italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
