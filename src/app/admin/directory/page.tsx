'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import AdminHubCard from '@/components/AdminHubCard'
import ConfirmModal from '@/components/ConfirmModal'
import FormSelect from '@/components/FormSelect'
import FormMultiSelect from '@/components/FormMultiSelect'
import { useAdmin } from '@/context/AdminContext'
import * as XLSX from 'xlsx'

export default function DirectoryPage() {
    const { allHubs, cities, focusAreas } = useAdmin()
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'success'|'info', onConfirm: () => void}>({isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {}})

    // Modal State
    const [modalConfig, setModalConfig] = useState<{isOpen: boolean, mode: 'add' | 'edit', data: any}>({isOpen: false, mode: 'add', data: null})
    const [editForm, setEditForm] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)

    const getAuthHeaders = async () => {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('Not authenticated')
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setActionLoading('importing')
        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase()
            let mappedHubs: any[] = []

            if (fileExtension === 'json') {
                const text = await file.text()
                const jsonData = JSON.parse(text)
                const sourceArray = Array.isArray(jsonData) ? jsonData : (jsonData.hubs || [])
                
                mappedHubs = sourceArray.map((row: any) => ({
                    name: row.name || row['Hub Bio'] || row['Hub Name'] || '',
                    description: row.description || row['What you do (Bio)'] || row['Description'] || 'No description provided.',
                    city: row.city || row['Which city/town is your Hub located'] || row['City'] || '',
                    region: row.region || row['Which Region is your Hub located'] || row['Region'] || '',
                    neighborhood: row.neighborhood || row['Location of Hub'] || row['Neighborhood'] || '',
                    digitalAddress: row.digitalAddress || row['What is the Digital Address of your hub'] || row['Digital Address'] || '',
                    submitterEmail: row.submitterEmail || row['Username'] || row['Submitter Email'] || '',
                    founderName: row.founderName || row['Founder'] || row['Founder Name'] || '',
                    founderEmail: row.founderEmail || row["Founder's Email"] || row['Founder Email'] || '',
                    founderPhone: row.founderPhone || row["Founder's Phone number"] || row['Founder Phone'] || '',
                    contact: row.contact || row["Hub's Contact Number"] || row['Hub Contact Number'] || '',
                    website: row.website || row['Website Address'] || row['Website URL'] || '',
                    facebook: row.facebook || row['Facebook Link'] || '',
                    tags: Array.isArray(row.tags) ? row.tags : (row['Column 1'] ? String(row['Column 1']).split(',').map((t: string) => t.trim()) : []),
                    lat: row.lat || row['Latitude'] || '',
                    lng: row.lng || row['Longitude'] || ''
                }))
            } else {
                const data = await file.arrayBuffer()
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" })

                // Map the data
                mappedHubs = rawJson.map((row: any) => ({
                    name: row['Hub Bio'] || row['Hub Name'] || '',
                    description: row['What you do (Bio)'] || row['Description'] || 'No description provided.',
                    city: row['Which city/town is your Hub located'] || row['City'] || '',
                    region: row['Which Region is your Hub located'] || row['Region'] || '',
                    neighborhood: row['Location of Hub'] || row['Neighborhood'] || '',
                    digitalAddress: row['What is the Digital Address of your hub'] || row['Digital Address'] || '',
                    submitterEmail: row['Username'] || row['Submitter Email'] || '',
                    founderName: row['Founder'] || row['Founder Name'] || '',
                    founderEmail: row["Founder's Email"] || row['Founder Email'] || '',
                    founderPhone: row["Founder's Phone number"] || row['Founder Phone'] || '',
                    contact: row["Hub's Contact Number"] || row['Hub Contact Number'] || '',
                    website: row['Website Address'] || row['Website URL'] || '',
                    facebook: row['Facebook Link'] || '',
                    tags: row['Column 1'] ? String(row['Column 1']).split(',').map((t: string) => t.trim()) : [],
                    lat: row['Latitude'] || '',
                    lng: row['Longitude'] || ''
                }))
            }

            // Validate frontend
            const invalidRows = mappedHubs.filter((h: any) => !h.name || !h.city)
            if (invalidRows.length > 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Validation Error',
                    message: `${invalidRows.length} out of ${mappedHubs.length} rows are missing required fields (Hub Name or City). Please fix the Excel file and try again.`,
                    type: 'danger',
                    onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                })
                return
            }

            // Send to backend
            const headers = await getAuthHeaders()
            const res = await fetch('/api/admin/hubs/bulk', {
                method: 'POST',
                headers,
                body: JSON.stringify({ hubs: mappedHubs })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed to import')

            setConfirmModal({
                isOpen: true,
                title: 'Import Successful',
                message: result.message,
                type: 'success',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
            })

        } catch (err: any) {
            console.error(err)
            setConfirmModal({
                isOpen: true,
                title: 'Import Failed',
                message: err.message || 'Could not parse Excel file',
                type: 'danger',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
            })
        } finally {
            setActionLoading(null)
            if (e.target) e.target.value = ''
        }
    }

    const openAddModal = () => {
        setModalConfig({ isOpen: true, mode: 'add', data: null })
        setEditForm({ submitterEmail: '', name: '', city: '', region: '', digitalAddress: '', neighborhood: '', description: '', website: '', contact: '', facebook: '', founderName: '', founderEmail: '', founderPhone: '', tags: [], lat: '', lng: '', logo: '' })
        setCurrentStep(0)
        setFormErrors({})
    }

    const openEditModal = (hub: any) => {
        setModalConfig({ isOpen: true, mode: 'edit', data: hub })
        setEditForm({
            ...hub,
            lat: hub.coordinates?.lat || '',
            lng: hub.coordinates?.lng || ''
        })
        setCurrentStep(0)
        setFormErrors({})
    }

    const handleNextStep = () => {
        const errors: { [key: string]: string } = {}
        if (currentStep === 0) {
            if (!editForm?.name) errors.name = 'Hub Name is required'
            if (!editForm?.description) errors.description = 'Description is required'
            if (!editForm?.submitterEmail && modalConfig.mode === 'add') errors.submitterEmail = 'Submitter Email is required'
        } else if (currentStep === 1) {
            if (!editForm?.city) errors.city = 'City is required'
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        setFormErrors({})
        setCurrentStep(prev => prev + 1)
    }

    const saveHubEdit = async () => {
        if (!editForm) return
        setActionLoading('saving')
        try {
            const url = '/api/admin/hubs'
            const method = modalConfig.mode === 'add' ? 'POST' : 'PATCH'
            const payload = modalConfig.mode === 'add' 
                ? { ...editForm, coordinates: { lat: parseFloat(editForm.lat) || 0, lng: parseFloat(editForm.lng) || 0 } }
                : { id: modalConfig.data.id, ...editForm, coordinates: { lat: parseFloat(editForm.lat) || 0, lng: parseFloat(editForm.lng) || 0 } }

            const res = await fetch(url, {
                method,
                headers: await getAuthHeaders(),
                body: JSON.stringify(payload),
            })
            
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save hub')
            }

            setModalConfig({ isOpen: false, mode: 'add', data: null })
        } catch (err) {
            console.error('Failed to update hub:', err)
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
            await fetch(`/api/admin/hubs?id=${id}`, { method: 'DELETE', headers: await getAuthHeaders() })
        } catch (err) {
            console.error('Failed to delete:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredHubs = allHubs.filter(hub => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            hub.name?.toLowerCase().includes(q) ||
            hub.city?.toLowerCase().includes(q) ||
            hub.founderName?.toLowerCase().includes(q) ||
            hub.description?.toLowerCase().includes(q) ||
            hub.region?.toLowerCase().includes(q)
        );
    });

    return (
        <section className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black font-syne uppercase tracking-tight">Ecosystem <span className="text-ghana-gold">Directory</span></h2>
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl border border-surface-border transition-all">
                        {actionLoading === 'importing' ? 'Importing...' : 'Bulk Import (.xlsx, .json)'}
                        <input type="file" accept=".xlsx, .xls, .csv, .json" className="hidden" onChange={handleFileUpload} disabled={actionLoading === 'importing'} />
                    </label>
                    <button onClick={openAddModal} className="px-5 py-2.5 bg-ghana-gold hover:bg-amber-300 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl shadow-lg shadow-ghana-gold/20 transition-all">
                        + Add Hub
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search hubs by name, city, or founder..."
                    className="w-full bg-surface-card border border-surface-border rounded-xl pl-11 pr-4 py-3 sm:py-4 text-sm font-body focus:border-ghana-gold outline-none transition-colors shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {allHubs.length === 0 ? (
                <div className="bg-surface-card border border-surface-border p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
                    <p className="text-zinc-500 font-body text-xs sm:text-base">No hubs in the directory.</p>
                </div>
            ) : filteredHubs.length === 0 ? (
                <div className="bg-surface-card border border-surface-border p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
                    <p className="text-zinc-500 font-body text-xs sm:text-base">No hubs match your search.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6">
                    {filteredHubs.map(hub => (
                        <AdminHubCard
                            key={hub.id}
                            hub={hub}
                            onDelete={() => handleDelete(hub.id)}
                            onEdit={() => openEditModal(hub)}
                            loading={actionLoading === hub.id}
                            type="directory"
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-card border border-surface-border rounded-3xl sm:rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-12 shadow-2xl scale-in-center overflow-x-hidden flex flex-col">
                        <header className="flex items-center justify-between mb-8 sm:mb-10">
                            <h2 className="text-xl sm:text-3xl font-bold font-syne uppercase tracking-tight">{modalConfig.mode === 'add' ? 'Add' : 'Edit'} <span className="text-ghana-gold">Hub Profile</span></h2>
                            <button onClick={() => setModalConfig({ isOpen: false, mode: 'add', data: null })} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        {/* Stepper Dots */}
                        <div className="flex gap-2 mb-8">
                            {[0, 1, 2, 3].map(step => (
                                <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${currentStep >= step ? 'bg-ghana-gold' : 'bg-surface-border'}`} />
                            ))}
                        </div>

                        <div className="space-y-6 sm:space-y-8 flex-1">
                            {currentStep === 0 && (
                                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <h3 className="text-sm font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">General Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Submitter Email {modalConfig.mode === 'add' && '*'}</label>
                                            <input type="email" className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all shadow-inner ${formErrors.submitterEmail ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold'}`}
                                                value={editForm.submitterEmail || ''} onChange={e => setEditForm({ ...editForm, submitterEmail: e.target.value })} />
                                            {formErrors.submitterEmail && <p className="text-ghana-red text-[10px] ml-1">{formErrors.submitterEmail}</p>}
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Name *</label>
                                            <input type="text" className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all shadow-inner ${formErrors.name ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold'}`}
                                                value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                            {formErrors.name && <p className="text-ghana-red text-[10px] ml-1">{formErrors.name}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Description *</label>
                                        <textarea className={`w-full bg-surface border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body outline-none transition-all h-24 sm:h-32 resize-none shadow-inner ${formErrors.description ? 'border-ghana-red focus:border-ghana-red' : 'border-surface-border focus:border-ghana-gold'}`}
                                            value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                        {formErrors.description && <p className="text-ghana-red text-[10px] ml-1">{formErrors.description}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <h3 className="text-sm font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Location Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <FormSelect label="City *" options={cities} value={editForm.city || ''} onChange={val => setEditForm({ ...editForm, city: val })} />
                                            {formErrors.city && <p className="text-ghana-red text-[10px] ml-1">{formErrors.city}</p>}
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Region</label>
                                            <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.region || ''} onChange={e => setEditForm({ ...editForm, region: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Neighborhood</label>
                                            <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.neighborhood || ''} onChange={e => setEditForm({ ...editForm, neighborhood: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Digital Address</label>
                                            <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.digitalAddress || ''} onChange={e => setEditForm({ ...editForm, digitalAddress: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4 sm:p-6 bg-surface border border-surface-border rounded-2xl sm:rounded-3xl shadow-inner">
                                        <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 block mb-2">Map Localization (Coordinates)</label>
                                        <div className="grid grid-cols-2 gap-4 sm:gap-8">
                                            <div className="space-y-1 sm:space-y-2">
                                                <span className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold">Latitude</span>
                                                <input type="text" className="w-full bg-transparent border-b border-surface-border py-2 sm:py-4 text-base sm:text-xl font-body focus:border-ghana-gold outline-none transition-all"
                                                    value={editForm.lat || ''} onChange={e => setEditForm({ ...editForm, lat: e.target.value })} placeholder="0.000000" />
                                            </div>
                                            <div className="space-y-1 sm:space-y-2">
                                                <span className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold">Longitude</span>
                                                <input type="text" className="w-full bg-transparent border-b border-surface-border py-2 sm:py-4 text-base sm:text-xl font-body focus:border-ghana-gold outline-none transition-all"
                                                    value={editForm.lng || ''} onChange={e => setEditForm({ ...editForm, lng: e.target.value })} placeholder="0.000000" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <h3 className="text-sm font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Founder Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Name</label>
                                            <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.founderName || ''} onChange={e => setEditForm({ ...editForm, founderName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Email</label>
                                            <input type="email" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.founderEmail || ''} onChange={e => setEditForm({ ...editForm, founderEmail: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Founder Phone</label>
                                        <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                            value={editForm.founderPhone || ''} onChange={e => setEditForm({ ...editForm, founderPhone: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <h3 className="text-sm font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Contact & Online Presence</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Hub Contact Number</label>
                                            <input type="text" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.contact || ''} onChange={e => setEditForm({ ...editForm, contact: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Website URL</label>
                                            <input type="url" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Facebook Link</label>
                                            <input type="url" className="w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                value={editForm.facebook || ''} onChange={e => setEditForm({ ...editForm, facebook: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <label className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Logo URL</label>
                                            <div className="flex gap-2">
                                                <input type="url" className="flex-1 w-full bg-surface border border-surface-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-body focus:border-ghana-gold outline-none transition-all"
                                                    value={editForm.logo || ''} onChange={e => setEditForm({ ...editForm, logo: e.target.value })} placeholder="https://..." />
                                                <label className={`cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <span className="text-xs font-bold uppercase">{isUploadingLogo ? '...' : 'Upload'}</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUploadingLogo(true);
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                            const data = await res.json();
                                                            if (data.url) setEditForm({ ...editForm, logo: data.url });
                                                        } catch (err) {
                                                            console.error('Upload failed', err);
                                                        } finally {
                                                            setIsUploadingLogo(false);
                                                        }
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        <FormMultiSelect
                                            label="Tags / Focus Areas"
                                            placeholder="Select tags"
                                            options={focusAreas}
                                            selected={editForm.tags || []}
                                            onChange={(tags: string[]) => setEditForm({ ...editForm, tags })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 border-t border-surface-border">
                            {currentStep > 0 && (
                                <button onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="px-6 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all text-sm border border-surface-border">
                                    Previous
                                </button>
                            )}
                            
                            {currentStep < 3 ? (
                                <button onClick={handleNextStep}
                                    className="flex-1 px-8 py-4 bg-ghana-gold hover:bg-amber-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-ghana-gold/10 text-sm">
                                    Next Step
                                </button>
                            ) : (
                                <button onClick={saveHubEdit} disabled={actionLoading === 'saving'}
                                    className="flex-1 px-8 py-4 bg-ghana-green hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-ghana-green/10 disabled:opacity-50 text-sm">
                                    {actionLoading === 'saving' ? 'Saving...' : (modalConfig.mode === 'add' ? 'Create Hub' : 'Save Changes')}
                                </button>
                            )}
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
