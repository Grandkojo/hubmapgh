'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import ConfirmModal from '@/components/ConfirmModal'
import { useAdmin } from '@/context/AdminContext'

export default function FiltersPage() {
    const { cities, setCities, focusAreas, setFocusAreas } = useAdmin()
    
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'success'|'info', onConfirm: () => void}>({isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {}})
    const [newCity, setNewCity] = useState('')
    const [newFocus, setNewFocus] = useState('')
    const [renamingItem, setRenamingItem] = useState<{ type: 'city' | 'focus', oldName: string, newName: string } | null>(null)
    const [metaSaving, setMetaSaving] = useState(false)

    const getAuthHeaders = async () => {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('Not authenticated')
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    }

    const saveMetadata = async (updatedCities: string[], updatedFocus: string[], rename?: { type: 'city' | 'focus', oldName: string, newName: string }) => {
        setMetaSaving(true)
        try {
            await fetch('/api/admin/metadata', {
                method: 'POST',
                headers: await getAuthHeaders(),
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

    return (
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
                onRename={(c: string) => setRenamingItem({ type: 'city', oldName: c, newName: c })}
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
                onRename={(f: string) => setRenamingItem({ type: 'focus', oldName: f, newName: f })}
                newItem={newFocus}
                setNewItem={setNewFocus}
            />

            {/* Rename Modal */}
            {renamingItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-card border border-surface-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl scale-in-center">
                        <h3 className="text-lg sm:text-xl font-bold font-syne uppercase tracking-tight mb-4 sm:mb-6">Rename <span className="text-ghana-gold">{renamingItem.oldName}</span></h3>
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
        </section>
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
