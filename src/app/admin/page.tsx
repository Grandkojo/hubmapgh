'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'filters'>('pending')
    const [pendingHubs, setPendingHubs] = useState<any[]>([])
    const [allHubs, setAllHubs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Edit Hub Modal State
    const [editingHub, setEditingHub] = useState<any | null>(null)
    const [editForm, setEditForm] = useState<any>(null)

    // Custom Confirmation State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        onConfirm: () => void
        type: 'danger' | 'success' | 'info'
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    })

    // Metadata state
    const [cities, setCities] = useState<string[]>([])
    const [focusAreas, setFocusAreas] = useState<string[]>([])
    const [newCity, setNewCity] = useState('')
    const [newFocus, setNewFocus] = useState('')
    const [metaSaving, setMetaSaving] = useState(false)
    const [renamingItem, setRenamingItem] = useState<{ type: 'city' | 'focus', oldName: string, newName: string } | null>(null)

    // Auth Redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, authLoading, router])

    // Data Subscriptions
    useEffect(() => {
        if (!user) return

        // Pending Hubs Subscription
        const qPending = query(
            collection(db, 'hubs'),
            where('verified', '==', false),
            orderBy('submittedAt', 'desc')
        )
        const unsubPending = onSnapshot(qPending, (snapshot) => {
            setPendingHubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            if (activeTab === 'pending') setLoading(false)
        })

        // All Hubs Subscription
        const qAll = query(collection(db, 'hubs'), orderBy('name', 'asc'))
        const unsubAll = onSnapshot(qAll, (snapshot) => {
            setAllHubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            if (activeTab === 'all') setLoading(false)
        })

        // Fetch metadata
        fetch('/api/admin/metadata')
            .then(res => res.json())
            .then(data => {
                setCities(data.cities || [])
                setFocusAreas(data.focusAreas || [])
            })

        return () => {
            unsubPending()
            unsubAll()
        }
    }, [user, activeTab])

    const handleVerify = async (id: string, verified: boolean) => {
        if (verified) {
            setConfirmModal({
                isOpen: true,
                title: 'Confirm Approval',
                message: `Are you sure you want to approve this hub? It will be visible to everyone on the map.`,
                type: 'success',
                onConfirm: () => executeVerify(id, true)
            })
        } else {
            executeVerify(id, false)
        }
    }

    const executeVerify = async (id: string, verified: boolean) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setActionLoading(id)
        try {
            await fetch('/api/admin/verify', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, verified }),
            })
        } catch (err) {
            console.error('Failed to verify:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Hub',
            message: 'Are you sure you want to delete this hub? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => executeDelete(id)
        })
    }

    const executeDelete = async (id: string) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setActionLoading(id)
        try {
            await fetch(`/api/admin/hubs?id=${id}`, { method: 'DELETE' })
        } catch (err) {
            console.error('Failed to delete:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const saveHubEdit = async () => {
        if (!editForm || !editingHub) return
        setActionLoading(editingHub.id)
        try {
            await fetch('/api/admin/hubs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingHub.id,
                    ...editForm,
                    coordinates: {
                        lat: parseFloat(editForm.lat) || 0,
                        lng: parseFloat(editForm.lng) || 0
                    }
                }),
            })
            setEditingHub(null)
        } catch (err) {
            console.error('Failed to update hub:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const saveMetadata = async (updatedCities: string[], updatedFocus: string[], rename?: { type: 'city' | 'focus', oldName: string, newName: string }) => {
        setMetaSaving(true)
        try {
            await fetch('/api/admin/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cities: updatedCities,
                    focusAreas: updatedFocus,
                    rename
                }),
            })
        } catch (err) {
            console.error('Failed to save metadata:', err)
        } finally {
            setMetaSaving(false)
        }
    }

    const renameMetadata = (type: 'city' | 'focus', oldName: string) => {
        setRenamingItem({ type, oldName, newName: oldName })
    }

    const confirmRename = () => {
        if (!renamingItem) return
        const { type, oldName, newName } = renamingItem
        if (!newName || newName === oldName) {
            setRenamingItem(null)
            return
        }

        if (type === 'city') {
            const updated = cities.map(c => c === oldName ? newName : c).sort()
            setCities(updated)
            saveMetadata(updated, focusAreas, { type, oldName, newName })
        } else {
            const updated = focusAreas.map(f => f === oldName ? newName : f).sort()
            setFocusAreas(updated)
            saveMetadata(cities, updated, { type, oldName, newName })
        }
        setRenamingItem(null)
    }

    const addCity = () => {
        if (!newCity || cities.includes(newCity)) return
        const updated = [...cities, newCity].sort()
        setCities(updated)
        setNewCity('')
        saveMetadata(updated, focusAreas)
    }

    const addFocus = () => {
        if (!newFocus || focusAreas.includes(newFocus)) return
        const updated = [...focusAreas, newFocus].sort()
        setFocusAreas(updated)
        setNewFocus('')
        saveMetadata(cities, updated)
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ghana-gold/20 border-t-ghana-gold rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-surface text-white flex flex-col">
            <div className="ghana-bar" />

            <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between gap-2 text-zinc-400">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex flex-col h-6 w-9 rounded overflow-hidden flex-shrink-0">
                            <div className="flex-1 bg-ghana-red" />
                            <div className="flex-1 bg-ghana-gold flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-black" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                            </div>
                            <div className="flex-1 bg-ghana-green" />
                        </div>
                        <h1 className="text-sm sm:text-xl font-bold truncate" style={{ fontFamily: 'var(--font-syne)' }}>
                            Hub Map GH <span className="hidden xs:inline text-zinc-600 ml-1 uppercase tracking-widest text-[10px]">Console</span>
                        </h1>
                    </Link>
                    <span className="hidden md:block text-[10px] text-zinc-600 font-mono translate-y-0.5">
                        {user.email}
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-[10px] sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                        ← <span className="hidden xs:inline">Map</span>
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="text-ghana-red font-bold text-[10px] sm:text-sm uppercase tracking-wider hover:opacity-80 transition-all border border-ghana-red/30 px-3 py-1.5 rounded-lg"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-16">
                <div className="flex items-center gap-2 sm:gap-6 mb-8 sm:mb-12 p-1.5 bg-surface-card border border-surface-border rounded-xl sm:rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar shadow-xl">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Pending ({pendingHubs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Directory ({allHubs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('filters')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'filters' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Filters
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-ghana-gold/20 border-t-ghana-gold rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'pending' ? (
                    <section className="space-y-6 sm:space-y-8">
                        {pendingHubs.length === 0 ? (
                            <div className="text-center py-16 sm:py-24 border-2 border-dashed border-surface-border rounded-2xl sm:rounded-3xl bg-surface-card/30">
                                <p className="text-zinc-500 font-body text-base sm:text-xl">Inbox is empty. Ready for new submissions!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6">
                                {pendingHubs.map(hub => (
                                    <AdminHubCard
                                        key={hub.id}
                                        hub={hub}
                                        onApprove={() => handleVerify(hub.id, true)}
                                        onDelete={() => handleDelete(hub.id)}
                                        onEdit={() => {
                                            setEditingHub(hub);
                                            setEditForm({
                                                ...hub,
                                                lat: hub.coordinates?.lat || '',
                                                lng: hub.coordinates?.lng || ''
                                            })
                                        }}
                                        loading={actionLoading === hub.id}
                                        type="pending"
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                ) : activeTab === 'all' ? (
                    <section className="space-y-6 sm:space-y-8">
                        <div className="grid gap-4 sm:gap-6">
                            {allHubs.map(hub => (
                                <AdminHubCard
                                    key={hub.id}
                                    hub={hub}
                                    onDelete={() => handleDelete(hub.id)}
                                    onEdit={() => {
                                        setEditingHub(hub);
                                        setEditForm({
                                            ...hub,
                                            lat: hub.coordinates?.lat || '',
                                            lng: hub.coordinates?.lng || ''
                                        })
                                    }}
                                    loading={actionLoading === hub.id}
                                    type="all"
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <MetadataColumn
                            title="Cities"
                            items={cities}
                            onAdd={addCity}
                            onRemove={(c: string) => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Remove City',
                                    message: `Are you sure you want to remove ${c}?`,
                                    type: 'danger',
                                    onConfirm: () => {
                                        const updated = cities.filter(x => x !== c)
                                        setCities(updated)
                                        saveMetadata(updated, focusAreas)
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }))
                                    }
                                })
                            }}
                            onRename={(c: string) => renameMetadata('city', c)}
                            newItem={newCity}
                            setNewItem={setNewCity}
                        />
                        <MetadataColumn
                            title="Focus Areas"
                            items={focusAreas}
                            onAdd={addFocus}
                            onRemove={(f: string) => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Remove Focus Area',
                                    message: `Are you sure you want to remove ${f}?`,
                                    type: 'danger',
                                    onConfirm: () => {
                                        const updated = focusAreas.filter(x => x !== f)
                                        setFocusAreas(updated)
                                        saveMetadata(cities, updated)
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }))
                                    }
                                })
                            }}
                            onRename={(f: string) => renameMetadata('focus', f)}
                            newItem={newFocus}
                            setNewItem={setNewFocus}
                        />
                    </section>
                )}
            </main>

            {/* Hub Edit Modal */}
            {editingHub && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-card border border-surface-border rounded-3xl sm:rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-12 shadow-2xl scale-in-center overflow-x-hidden">
                        <header className="flex items-center justify-between mb-8 sm:mb-10">
                            <h2 className="text-xl sm:text-3xl font-bold font-syne uppercase tracking-tight">Edit <span className="text-ghana-gold">Hub Profile</span></h2>
                            <button onClick={() => setEditingHub(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <div className="space-y-6 sm:space-y-8">
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Name</label>
                                <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all shadow-inner"
                                    value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">City</label>
                                    <select className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all appearance-none"
                                        value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })}>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Neighborhood</label>
                                    <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                        value={editForm.neighborhood} onChange={e => setEditForm({ ...editForm, neighborhood: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-3 p-4 sm:p-8 bg-surface border border-surface-border rounded-2xl sm:rounded-3xl shadow-inner">
                                <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 block mb-2">Map Localization (Coordinates)</label>
                                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                                    <div className="space-y-1 sm:space-y-2">
                                        <span className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold">Latitude</span>
                                        <input type="text" className="w-full bg-transparent border-b border-surface-border py-2 sm:py-4 text-base sm:text-xl font-body focus:border-ghana-gold outline-none transition-all"
                                            value={editForm.lat} onChange={e => setEditForm({ ...editForm, lat: e.target.value })} placeholder="0.000000" />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                        <span className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold">Longitude</span>
                                        <input type="text" className="w-full bg-transparent border-b border-surface-border py-2 sm:py-4 text-base sm:text-xl font-body focus:border-ghana-gold outline-none transition-all"
                                            value={editForm.lng} onChange={e => setEditForm({ ...editForm, lng: e.target.value })} placeholder="0.000000" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Description</label>
                                <textarea className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all h-32 sm:h-40 resize-none shadow-inner"
                                    value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Tags (comma separated)</label>
                                <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                    value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : ''} onChange={e => setEditForm({ ...editForm, tags: e.target.value.split(',').map(s => s.trim()) })} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pb-4">
                            <button onClick={saveHubEdit} disabled={actionLoading === editingHub.id}
                                className="flex-1 px-8 py-4 sm:py-5 bg-ghana-gold hover:bg-amber-300 text-black font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-ghana-gold/10 disabled:opacity-50 text-sm sm:text-base">
                                {actionLoading === editingHub.id ? 'Updating Database...' : 'Save Changes'}
                            </button>
                            <button onClick={() => setEditingHub(null)}
                                className="px-8 py-4 sm:py-5 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-zinc-700 transition-all text-sm sm:text-base border border-surface-border">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {renamingItem && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-surface-card border border-surface-border rounded-2xl sm:rounded-[2rem] w-full max-w-sm p-8 sm:p-10 shadow-2xl shadow-black/50">
                        <h3 className="text-xl sm:text-2xl font-black mb-6 font-syne uppercase tracking-tight">Rename <span className="text-ghana-gold">Item</span></h3>
                        <div className="space-y-6">
                            <input type="text" autoFocus className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg outline-none focus:border-ghana-gold transition-all shadow-inner"
                                value={renamingItem.newName} onChange={e => setRenamingItem({ ...renamingItem, newName: e.target.value })} onKeyDown={e => e.key === 'Enter' && confirmRename()} />
                            <div className="flex gap-3">
                                <button onClick={confirmRename} className="flex-1 bg-ghana-gold hover:bg-amber-300 text-black font-black py-3 sm:py-4 rounded-xl uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-ghana-gold/10 transition-all">Rename</button>
                                <button onClick={() => setRenamingItem(null)} className="flex-1 bg-zinc-800 text-white font-black py-3 sm:py-4 rounded-xl uppercase tracking-widest text-xs sm:text-sm transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                type={confirmModal.type}
            />
        </div>
    )
}

function AdminHubCard({ hub, onApprove, onDelete, onEdit, loading, type }: any) {
    return (
        <div className="bg-surface-card border border-surface-border p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 hover:border-ghana-gold/30 transition-all shadow-lg hover:shadow-2xl group">
            <div className="flex-1 space-y-2 sm:space-y-3">
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                    <h3 className="text-lg sm:text-2xl font-black text-white font-syne uppercase tracking-tight group-hover:text-ghana-gold transition-colors">{hub.name}</h3>
                    <div className="flex gap-1.5 sm:gap-2">
                        {type === 'pending' && (
                            <span className="text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-500/10 text-amber-500 uppercase tracking-widest border border-amber-500/10">Pending</span>
                        )}
                        {hub.verified && (
                            <span className="text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/10">Verified</span>
                        )}
                    </div>
                </div>
                <p className="text-zinc-500 text-sm sm:text-lg font-bold uppercase tracking-[0.1em]">{hub.neighborhood}, <span className="text-zinc-400">{hub.city}</span></p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2.5 mt-2 sm:mt-4">
                    {hub.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] sm:text-[11px] font-bold text-zinc-500 bg-surface px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-surface-border uppercase tracking-widest">{tag}</span>
                    ))}
                    {hub.tags?.length > 3 && <span className="text-[9px] sm:text-[11px] font-bold text-zinc-700 py-1">+ {hub.tags.length - 3} more</span>}
                </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 border-t lg:border-t-0 lg:border-l border-surface-border pt-5 sm:pt-8 lg:pt-0 lg:pl-10">
                {onApprove && (
                    <button onClick={onApprove} disabled={loading}
                        className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-ghana-green hover:bg-emerald-400 text-black text-xs sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-ghana-green/10">
                        Approve
                    </button>
                )}
                <button onClick={onEdit}
                    className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all border border-surface-border shadow-md">
                    Edit
                </button>
                <button onClick={onDelete} disabled={loading}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-ghana-red hover:bg-ghana-red/10 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all border border-ghana-red/20">
                    Delete
                </button>
            </div>
        </div>
    )
}

function MetadataColumn({ title, items, onAdd, onRemove, onRename, newItem, setNewItem }: any) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between ml-2">
                <h2 className="text-xl sm:text-2xl font-black font-syne uppercase tracking-tight">{title} <span className="text-ghana-gold text-base sm:text-lg">({items.length})</span></h2>
            </div>
            <div className="bg-surface-card border border-surface-border p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-6 sm:space-y-8 shadow-xl">
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                    <input type="text" placeholder={`Add...`} className="flex-1 bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base outline-none focus:border-ghana-gold/50 transition-all shadow-inner"
                        value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && onAdd()} />
                    <button onClick={onAdd} disabled={!newItem} className="w-full xs:w-auto px-6 py-3 sm:py-4 bg-ghana-gold hover:bg-amber-300 text-black font-black rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-ghana-gold/10 transition-all">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 max-h-[300px] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item: string) => (
                        <div key={item} className="flex items-center gap-2 sm:gap-3 bg-surface border border-surface-border px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold uppercase tracking-wider group hover:border-zinc-600 transition-all animate-in fade-in duration-300">
                            <span>{item}</span>
                            <div className="flex items-center gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onRename(item)} className="p-1 sm:p-1.5 text-zinc-500 hover:text-ghana-gold bg-zinc-800/50 rounded-lg">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button onClick={() => onRemove(item)} className="p-1 sm:p-1.5 text-zinc-500 hover:text-ghana-red bg-zinc-800/50 rounded-lg">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
