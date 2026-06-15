'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminProvider, useAdmin } from '@/context/AdminContext'
import { useEffect } from 'react'

function AdminSidebar({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading, logout } = useAuth()
    const { pendingHubs, allHubs } = useAdmin()
    const router = useRouter()
    const pathname = usePathname()

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
            <div className="md:hidden flex flex-col w-full border-b border-surface-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
                <div className="ghana-bar" />
                <header className="px-4 py-4 flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex flex-col h-5 w-7 rounded overflow-hidden flex-shrink-0">
                            <div className="flex-1 bg-ghana-red" />
                            <div className="flex-1 bg-ghana-gold flex items-center justify-center">
                                <div className="w-2 h-2 bg-black" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                            </div>
                            <div className="flex-1 bg-ghana-green" />
                        </Link>
                        <h1 className="text-sm font-bold font-syne truncate">Console</h1>
                    </div>
                    <button onClick={() => logout()} className="text-ghana-red font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-ghana-red/30">Sign Out</button>
                </header>
                <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-2">
                    <Link href="/admin" className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin' ? 'bg-ghana-gold text-black' : 'text-zinc-500 bg-surface-card border border-surface-border'}`}>Overview</Link>
                    <Link href="/admin/pending" className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin/pending' ? 'bg-ghana-gold text-black' : 'text-zinc-500 bg-surface-card border border-surface-border'}`}>Pending ({pendingHubs.length})</Link>
                    <Link href="/admin/directory" className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin/directory' ? 'bg-ghana-gold text-black' : 'text-zinc-500 bg-surface-card border border-surface-border'}`}>Directory ({allHubs.length})</Link>
                    <Link href="/admin/filters" className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin/filters' ? 'bg-ghana-gold text-black' : 'text-zinc-500 bg-surface-card border border-surface-border'}`}>Filters</Link>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-surface-card border-r border-surface-border h-screen sticky top-0 overflow-y-auto">
                <div className="ghana-bar shrink-0" />
                <div className="p-8 flex-1 flex flex-col">
                    <Link href="/" className="flex items-center gap-3 mb-10 group">
                        <div className="flex flex-col h-8 w-12 rounded overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                            <div className="flex-1 bg-ghana-red" />
                            <div className="flex-1 bg-ghana-gold flex items-center justify-center">
                                <div className="w-3.5 h-3.5 bg-black" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                            </div>
                            <div className="flex-1 bg-ghana-green" />
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
