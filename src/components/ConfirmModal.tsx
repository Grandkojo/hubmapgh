'use client'

import { useEffect } from 'react'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    type?: 'danger' | 'success' | 'info'
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info'
}: ConfirmModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const typeConfig = {
        danger: {
            button: 'bg-ghana-red hover:bg-red-600 text-white',
            icon: 'text-ghana-red bg-ghana-red/10',
            border: 'border-ghana-red/20'
        },
        success: {
            button: 'bg-ghana-green hover:bg-emerald-400 text-black',
            icon: 'text-ghana-green bg-ghana-green/10',
            border: 'border-ghana-green/20'
        },
        info: {
            button: 'bg-ghana-gold hover:bg-amber-300 text-black',
            icon: 'text-ghana-gold bg-ghana-gold/10',
            border: 'border-ghana-gold/20'
        }
    }[type]

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-surface-card border ${typeConfig.border} rounded-3xl w-full max-w-sm p-8 shadow-2xl scale-in-center animate-in zoom-in-95 duration-200`}>
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${typeConfig.icon} mb-2`}>
                        {type === 'danger' && (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        {type === 'success' && (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white font-syne uppercase tracking-tight">{title}</h2>
                    <p className="text-zinc-400 font-body text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 mt-8">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3.5 bg-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 transition-all text-sm uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-6 py-3.5 ${typeConfig.button} font-bold rounded-2xl transition-all text-sm shadow-lg shadow-black/20 uppercase tracking-widest`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
