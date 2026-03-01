'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'

export default function SubmitHubPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState('')
    const [locating, setLocating] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        neighborhood: '',
        description: '',
        website: '',
        contact: '',
        tags: '',
        lat: '',
        lng: ''
    })

    const detectLocation = () => {
        setLocating(true)
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData({
                    ...formData,
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6)
                })
                setLocating(false)
            },
            (err) => {
                setError('Could not detect location. Please enter manually.')
                setLocating(false)
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/hubs/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                    coordinates: {
                        lat: parseFloat(formData.lat) || 0,
                        lng: parseFloat(formData.lng) || 0
                    }
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setShowSuccess(true)
                setFormData({ name: '', city: '', neighborhood: '', description: '', website: '', contact: '', tags: '', lat: '', lng: '' })
            } else {
                setError(data.error || 'Something went wrong')
            }
        } catch (err) {
            setError('Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface text-white flex flex-col">
            <div className="ghana-bar" />

            <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md px-4 py-4 flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex flex-col h-6 w-9 rounded overflow-hidden flex-shrink-0">
                        <div className="flex-1 bg-ghana-red" />
                        <div className="flex-1 bg-ghana-gold flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-black" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                        </div>
                        <div className="flex-1 bg-ghana-green" />
                    </div>
                    <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ fontFamily: 'var(--font-syne)' }}>Hub Map GH</h1>
                </Link>
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-xs sm:text-base font-body whitespace-nowrap">
                    ← <span className="hidden xs:inline">Back to Map</span><span className="xs:hidden">Back</span>
                </Link>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 sm:py-16">
                <div className="mb-8 sm:mb-10 text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
                        Suggest a <span className="text-ghana-gold">Tech Hub</span>
                    </h2>
                    <p className="text-zinc-400 font-body text-base sm:text-lg max-w-xl mx-auto">
                        Help us expand the ecosystem directory. Once submitted, our admins will verify the details before it goes live.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-surface-card border border-surface-border p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-2xl">
                    {error && (
                        <div className="p-4 sm:p-5 rounded-xl bg-ghana-red/10 border border-ghana-red/20 text-ghana-red text-sm sm:text-base font-body text-center animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Name *</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Innovation Center"
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">City *</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Accra"
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Neighborhood</label>
                            <input
                                type="text"
                                placeholder="e.g. East Legon"
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.neighborhood}
                                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Website URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 sm:p-6 bg-surface border border-surface-border rounded-2xl sm:rounded-3xl">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Coordinates (Lat / Lng)</label>
                            <button
                                type="button"
                                onClick={detectLocation}
                                className="text-[10px] font-bold text-ghana-gold hover:text-amber-300 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <svg className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {locating ? 'Detecting...' : 'Detect location'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Latitude"
                                className="w-full bg-transparent border-b border-surface-border px-1 py-2 sm:py-3 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                value={formData.lat}
                                onChange={e => setFormData({ ...formData, lat: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Longitude"
                                className="w-full bg-transparent border-b border-surface-border px-1 py-2 sm:py-3 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                value={formData.lng}
                                onChange={e => setFormData({ ...formData, lng: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Description *</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="What does this hub offer?"
                            className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all resize-none placeholder:text-zinc-700"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                placeholder="Incubator, Training"
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Contact Email/Phone</label>
                            <input
                                type="text"
                                placeholder="Reach out at..."
                                className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3.5 sm:py-4 bg-ghana-gold hover:bg-amber-300 text-black font-extrabold rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-lg shadow-xl shadow-ghana-gold/10"
                        style={{ fontFamily: 'var(--font-syne)' }}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Submit Suggestion</span>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </main>

            <ConfirmModal
                isOpen={showSuccess}
                title="Success!"
                message="Your tech hub suggestion has been submitted. Our team will verify it shortly."
                confirmText="Back to Map"
                cancelText="Close"
                onConfirm={() => router.push('/')}
                onCancel={() => setShowSuccess(false)}
                type="success"
            />
        </div>
    )
}
