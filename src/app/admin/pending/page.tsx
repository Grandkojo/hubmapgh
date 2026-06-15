'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import AdminHubCard from '@/components/AdminHubCard'
import ConfirmModal from '@/components/ConfirmModal'
import { useAdmin } from '@/context/AdminContext'

export default function PendingHubs() {
    const { pendingHubs } = useAdmin()
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'success'|'info', onConfirm: () => void}>({isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {}})

    const getAuthHeaders = async () => {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('Not authenticated')
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    }

    const handleVerify = (id: string, verified: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: verified ? 'Approve Hub' : 'Reject Hub',
            message: verified ? 'Are you sure you want to approve this hub and add it to the directory?' : 'Are you sure you want to reject this hub?',
            type: verified ? 'success' : 'danger',
            onConfirm: () => executeVerify(id, verified)
        })
    }

    const executeVerify = async (id: string, verified: boolean) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setActionLoading(id)
        try {
            await fetch('/api/admin/verify', {
                method: 'PATCH',
                headers: await getAuthHeaders(),
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
            await fetch(`/api/admin/hubs?id=${id}`, { method: 'DELETE', headers: await getAuthHeaders() })
        } catch (err) {
            console.error('Failed to delete:', err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <section className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <h2 className="text-xl sm:text-2xl font-black font-syne uppercase tracking-tight">Pending <span className="text-ghana-gold">Approvals</span></h2>
            {pendingHubs.length === 0 ? (
                <div className="bg-surface-card border border-surface-border p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-ghana-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-zinc-300">All Caught Up!</h3>
                    <p className="text-zinc-500 font-body text-xs sm:text-base">There are no pending hubs waiting for approval.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6">
                    {pendingHubs.map(hub => (
                        <AdminHubCard
                            key={hub.id}
                            hub={hub}
                            onApprove={() => handleVerify(hub.id, true)}
                            onDelete={() => handleDelete(hub.id)}
                            onEdit={() => {}} // Not typically edited from pending
                            loading={actionLoading === hub.id}
                            type="pending"
                        />
                    ))}
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
