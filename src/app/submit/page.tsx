'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import FormSelect from '@/components/FormSelect'
import FormMultiSelect from '@/components/FormMultiSelect'

export default function SubmitHubPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState('')
    const [locating, setLocating] = useState(false)

    const [allCities, setAllCities] = useState<string[]>([])
    const [allTags, setAllTags] = useState<string[]>([])

    const [currentStep, setCurrentStep] = useState(0)
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const [formData, setFormData] = useState({
        submitterEmail: '',
        name: '',
        city: '',
        region: '',
        digitalAddress: '',
        neighborhood: '',
        description: '',
        website: '',
        contact: '',
        facebook: '',
        founderName: '',
        founderEmail: '',
        founderPhone: '',
        tags: [] as string[],
        lat: '',
        lng: ''
    })

    useEffect(() => {
        async function fetchMetadata() {
            try {
                const res = await fetch('/api/hubs', { cache: 'no-store' })
                const data = await res.json()
                if (data.metadata) {
                    setAllCities(data.metadata.cities || [])
                    setAllTags(data.metadata.focusAreas || [])
                }
            } catch (err) {
                console.error('Failed to load metadata:', err)
            }
        }
        fetchMetadata()
    }, [])

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

    const handleNextStep = () => {
        const errors: { [key: string]: string } = {}
        if (currentStep === 0) {
            if (!formData.submitterEmail) errors.submitterEmail = 'Submitter Email is required'
            if (!formData.name) errors.name = 'Hub Name is required'
            if (!formData.description) errors.description = 'Description is required'
        } else if (currentStep === 1) {
            if (!formData.city) errors.city = 'City is required'
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        setFormErrors({})
        setCurrentStep(prev => prev + 1)
    }

    const handleSubmit = async () => {
        // Final validation
        if (Object.keys(formErrors).length > 0) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/hubs/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags,
                    coordinates: {
                        lat: parseFloat(formData.lat) || 0,
                        lng: parseFloat(formData.lng) || 0
                    }
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setShowSuccess(true)
                setCurrentStep(0);
                setFormData({ submitterEmail: '', name: '', city: '', region: '', digitalAddress: '', neighborhood: '', description: '', website: '', contact: '', facebook: '', founderName: '', founderEmail: '', founderPhone: '', tags: [], lat: '', lng: '' })
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

                <div className="space-y-6 sm:space-y-8 bg-surface-card border border-surface-border p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col">
                    {error && (
                        <div className="p-4 sm:p-5 rounded-xl bg-ghana-red/10 border border-ghana-red/20 text-ghana-red text-sm sm:text-base font-body text-center animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    {/* Stepper Dots */}
                    <div className="flex gap-2 mb-4">
                        {[0, 1, 2, 3].map(step => (
                            <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${currentStep >= step ? 'bg-ghana-gold' : 'bg-surface-border'}`} />
                        ))}
                    </div>

                    <div className="space-y-6 sm:space-y-8 flex-1">
                        {currentStep === 0 && (
                            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h3 className="text-lg sm:text-xl font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">1. General Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Submitter Email (Username) *</label>
                                        <input type="email" placeholder="you@example.com" className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all placeholder:text-zinc-700 ${formErrors.submitterEmail ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold/50'}`}
                                            value={formData.submitterEmail} onChange={e => setFormData({ ...formData, submitterEmail: e.target.value })} />
                                        {formErrors.submitterEmail && <p className="text-ghana-red text-[10px] ml-1">{formErrors.submitterEmail}</p>}
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Name *</label>
                                        <input type="text" placeholder="e.g. Innovation Center" className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all placeholder:text-zinc-700 ${formErrors.name ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold/50'}`}
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        {formErrors.name && <p className="text-ghana-red text-[10px] ml-1">{formErrors.name}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Description *</label>
                                    <textarea rows={4} placeholder="What does this hub offer?" className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all resize-none placeholder:text-zinc-700 ${formErrors.description ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold/50'}`}
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    {formErrors.description && <p className="text-ghana-red text-[10px] ml-1">{formErrors.description}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h3 className="text-lg sm:text-xl font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">2. Location Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2">
                                        <FormSelect label="City *" placeholder="Select a city" options={allCities} value={formData.city} onChange={val => setFormData({ ...formData, city: val })} />
                                        {formErrors.city && <p className="text-ghana-red text-[10px] ml-1">{formErrors.city}</p>}
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Region</label>
                                        <input type="text" placeholder="e.g. Greater Accra" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Neighborhood</label>
                                        <input type="text" placeholder="e.g. East Legon" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Digital Address</label>
                                        <input type="text" placeholder="e.g. GA-123-4567" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.digitalAddress} onChange={e => setFormData({ ...formData, digitalAddress: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3 p-4 sm:p-6 bg-surface border border-surface-border rounded-2xl sm:rounded-3xl">
                                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Coordinates (Lat / Lng)</label>
                                        <button type="button" onClick={detectLocation} className="text-[10px] font-bold text-ghana-gold hover:text-amber-300 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                                            <svg className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {locating ? 'Detecting...' : 'Detect location'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Latitude" className="w-full bg-transparent border-b border-surface-border px-1 py-2 sm:py-3 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                            value={formData.lat} onChange={e => setFormData({ ...formData, lat: e.target.value })} />
                                        <input type="text" placeholder="Longitude" className="w-full bg-transparent border-b border-surface-border px-1 py-2 sm:py-3 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                            value={formData.lng} onChange={e => setFormData({ ...formData, lng: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h3 className="text-lg sm:text-xl font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">3. Founder Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Name</label>
                                        <input type="text" placeholder="e.g. John Doe" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.founderName} onChange={e => setFormData({ ...formData, founderName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Email</label>
                                        <input type="email" placeholder="founder@example.com" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.founderEmail} onChange={e => setFormData({ ...formData, founderEmail: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Phone Number</label>
                                    <input type="text" placeholder="e.g. 0541234567" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.founderPhone} onChange={e => setFormData({ ...formData, founderPhone: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h3 className="text-lg sm:text-xl font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">4. Contact & Online Presence</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Contact Number</label>
                                        <input type="text" placeholder="e.g. 0241234567" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Website Address</label>
                                        <input type="url" placeholder="https://..." className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Facebook Link</label>
                                        <input type="url" placeholder="https://facebook.com/..." className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold/50 outline-none transition-all placeholder:text-zinc-700"
                                            value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} />
                                    </div>
                                    <FormMultiSelect label="Tags / Focus Areas" placeholder="Select tags" options={allTags} selected={formData.tags} onChange={tags => setFormData({ ...formData, tags })} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 border-t border-surface-border">
                        {currentStep > 0 && (
                            <button type="button" onClick={() => setCurrentStep(prev => prev - 1)}
                                className="px-6 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all text-sm border border-surface-border">
                                Previous
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button type="button" onClick={handleNextStep}
                                className="flex-1 px-8 py-4 bg-ghana-gold hover:bg-amber-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-ghana-gold/10 text-sm">
                                Next Step
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading}
                                className="flex-1 px-8 py-4 bg-ghana-gold hover:bg-amber-300 text-black font-extrabold rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-lg shadow-xl shadow-ghana-gold/10"
                                style={{ fontFamily: 'var(--font-syne)' }}>
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
                        )}
                    </div>
                </div>
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
