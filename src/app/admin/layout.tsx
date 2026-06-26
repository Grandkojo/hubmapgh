'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminProvider, useAdmin } from '@/context/AdminContext'
import { useEffect, useState } from 'react'

function AdminSidebar({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading, logout } = useAuth()
    const { pendingHubs, allHubs } = useAdmin()
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ghana-gold/20 border-t-ghana-gold rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-surface text-white flex flex-col md:flex-row">
            {/* Mobile Header & Tabs */}
            <div className="md:hidden flex flex-col w-full bg-surface/90 backdrop-blur-md sticky top-0 z-50">
                <div className="ghana-bar" />
                <header className={`px-4 py-4 flex items-center justify-between text-zinc-400 ${!isMobileMenuOpen ? 'border-b border-surface-border' : ''}`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 -ml-1 text-white hover:text-ghana-gold transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                        <Link href="/" className="flex items-center justify-center flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                            <img src="/hubmap-logo-yellow.png" alt="Hub Map GH Logo" className="h-6 w-6 object-contain" />
                        </Link>
                        <h1 className="text-sm font-bold font-syne truncate">Hubmap Console</h1>
                    </div>
                </header>
                
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-surface-card border-b border-surface-border shadow-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface border border-transparent'}`}>
                            <span>Overview</span>
                        </Link>
                        <Link href="/admin/pending" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/pending' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface border border-transparent'}`}>
                            <span>Pending Hubs</span>
                            {pendingHubs.length > 0 && <span className={`px-2 py-0.5 rounded text-[10px] ${pathname === '/admin/pending' ? 'bg-black/20 text-black' : 'bg-ghana-gold/20 text-ghana-gold'}`}>{pendingHubs.length}</span>}
                        </Link>
                        <Link href="/admin/directory" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/directory' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface border border-transparent'}`}>
                            <span>Directory</span>
                            <span className="opacity-50">{allHubs.length}</span>
                        </Link>
                        <Link href="/admin/filters" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/filters' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface border border-transparent'}`}>
                            <span>Metadata / Filters</span>
                        </Link>
                        <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/users' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface border border-transparent'}`}>
                            <span>Users Management</span>
                        </Link>
                        
                        <div className="h-px bg-surface-border my-2" />
                        
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="w-full text-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-surface transition-all border border-transparent">
                                ← Back to Map
                            </Link>
                            <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-ghana-red hover:bg-ghana-red/10 transition-all border border-ghana-red/20">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-surface-card border-r border-surface-border h-screen sticky top-0 overflow-y-auto">
                <div className="ghana-bar shrink-0" />
                <div className="p-8 flex-1 flex flex-col">
                    <Link href="/" className="flex items-center gap-3 mb-10 group">
                        <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <img src="/hubmap-logo-yellow.png" alt="Hub Map GH Logo" className="h-10 w-10 object-contain rounded-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-syne leading-none mb-1">Hub Map GH</h1>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Admin Console</span>
                        </div>
                    </Link>

                    <div className="mb-10 p-4 bg-surface rounded-xl border border-surface-border">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Logged in as</p>
                        <p className="text-xs font-mono text-zinc-300 truncate">{user.email}</p>
                    </div>

                    <nav className="flex-1 space-y-3">
                        <Link href="/admin" className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface'}`}>
                            <span>Overview</span>
                        </Link>
                        <Link href="/admin/pending" className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/pending' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface'}`}>
                            <span>Pending Hubs</span>
                            {pendingHubs.length > 0 && <span className={`px-2 py-0.5 rounded text-[10px] ${pathname === '/admin/pending' ? 'bg-black/20 text-black' : 'bg-ghana-gold/20 text-ghana-gold'}`}>{pendingHubs.length}</span>}
                        </Link>
                        <Link href="/admin/directory" className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/directory' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface'}`}>
                            <span>Directory</span>
                            <span className="opacity-50">{allHubs.length}</span>
                        </Link>
                        <Link href="/admin/filters" className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/filters' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface'}`}>
                            <span>Metadata / Filters</span>
                        </Link>
                        <Link href="/admin/users" className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/admin/users' ? 'bg-ghana-gold text-black shadow-lg shadow-ghana-gold/10' : 'text-zinc-400 hover:text-white hover:bg-surface'}`}>
                            <span>Users Management</span>
                        </Link>
                    </nav>

                    <div className="mt-8 space-y-3">
                        <Link href="/" className="w-full block text-center px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-surface transition-all border border-transparent hover:border-surface-border">
                            ← Back to Map
                        </Link>
                        <button onClick={() => logout()} className="w-full px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-ghana-red hover:bg-ghana-red/10 transition-all border border-ghana-red/20">
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-6 sm:p-12 h-screen overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto pb-20 md:pb-0">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default function Layout({ children }: { children: React.ReactNode }) {
    // Only apply AdminLayout if we are not on the login page
    const pathname = usePathname()
    if (pathname === '/admin/login') {
        return <>{children}</>
    }
    
    return (
        <AdminProvider>
            <AdminSidebar>{children}</AdminSidebar>
        </AdminProvider>
    )
}
