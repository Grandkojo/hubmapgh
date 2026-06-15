'use client'

import { useAdmin } from '@/context/AdminContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminIndex() {
    const { allHubs, pendingHubs, cities } = useAdmin()
    
    // Dummy traffic data for the chart (heights in percentage)
    const [chartData, setChartData] = useState<number[]>([10, 10, 10, 10, 10, 10, 10])

    useEffect(() => {
        // Animate chart on load
        setTimeout(() => {
            setChartData([40, 65, 45, 80, 55, 90, 75])
        }, 100)
    }, [])

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

            {/* Dummy Traffic Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-card border border-surface-border p-6 sm:p-8 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest mb-1">Site Traffic</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Last 7 Days (Demo)</p>
                        </div>
                        <span className="px-3 py-1 bg-ghana-green/20 text-ghana-green text-[10px] font-black uppercase tracking-widest rounded-lg">+12.5%</span>
                    </div>

                    <div className="h-48 flex items-end gap-2 sm:gap-4 mt-8">
                        {chartData.map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                                <div 
                                    className="w-full bg-gradient-to-t from-zinc-800 to-ghana-gold/80 rounded-t-lg transition-all duration-1000 ease-out group-hover:to-ghana-gold relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">
                                        {Math.floor(height * 142)}
                                    </div>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] shadow-xl">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Total Page Views</h3>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black font-syne text-white">34,291</span>
                            <span className="text-xs font-bold text-ghana-green mb-1">↑ 8%</span>
                        </div>
                    </div>
                    
                    <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] shadow-xl">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Unique Visitors</h3>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black font-syne text-white">12,840</span>
                            <span className="text-xs font-bold text-ghana-green mb-1">↑ 12%</span>
                        </div>
                    </div>

                    <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] shadow-xl">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Search Queries</h3>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black font-syne text-white">4,902</span>
                            <span className="text-xs font-bold text-zinc-500 mb-1">- 2%</span>
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
