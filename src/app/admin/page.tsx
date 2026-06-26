'use client'

import { useAdmin } from '@/context/AdminContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminIndex() {
    const { allHubs, pendingHubs, cities } = useAdmin()

    return (
        <section className="space-y-8 sm:space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black font-syne uppercase tracking-tight">Dashboard <span className="text-ghana-gold">Overview</span></h2>
            </div>

            {/* Real Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-surface-card border border-surface-border p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <p className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Total Hubs</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black font-syne text-white">{allHubs.length}</span>
                        <div className="w-10 h-10 rounded-full bg-ghana-green/10 flex items-center justify-center text-ghana-green">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-card border border-surface-border p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-ghana-gold" />
                    <p className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Pending Approvals</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black font-syne text-white">{pendingHubs.length}</span>
                        <div className="w-10 h-10 rounded-full bg-ghana-gold/10 flex items-center justify-center text-ghana-gold">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-card border border-surface-border p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <p className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Active Cities</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black font-syne text-white">{cities.length}</span>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>



            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 ml-1">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/pending" className="flex items-center gap-4 bg-surface-card border border-surface-border p-4 rounded-xl hover:border-ghana-gold transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 group-hover:bg-ghana-gold/10 flex items-center justify-center text-zinc-400 group-hover:text-ghana-gold transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white group-hover:text-ghana-gold transition-colors">Review Pending</p>
                            <p className="text-xs text-zinc-500">{pendingHubs.length} hubs waiting for approval</p>
                        </div>
                    </Link>

                    <Link href="/admin/directory" className="flex items-center gap-4 bg-surface-card border border-surface-border p-4 rounded-xl hover:border-ghana-gold transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 group-hover:bg-ghana-gold/10 flex items-center justify-center text-zinc-400 group-hover:text-ghana-gold transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white group-hover:text-ghana-gold transition-colors">Manage Directory</p>
                            <p className="text-xs text-zinc-500">Add or edit existing hubs</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    )
}
