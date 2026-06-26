'use client'

import { useAdmin } from '@/context/AdminContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminHubDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { allHubs, pendingHubs, loading } = useAdmin()
    const [hub, setHub] = useState<any>(null)

    useEffect(() => {
        if (!loading) {
            const foundHub = allHubs.find(h => h.id === id) || pendingHubs.find(h => h.id === id)
            if (foundHub) {
                setHub(foundHub)
            } else {
                router.push('/admin/directory')
            }
        }
    }, [id, allHubs, pendingHubs, loading, router])

    if (loading || !hub) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-8 h-8 border-4 border-ghana-gold/20 border-t-ghana-gold rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <section className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <Link href="/admin/directory" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                    <span>←</span> Back to Directory
                </Link>
                <div className="flex gap-2">
                    {hub.verified ? (
                        <span className="text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20">Verified</span>
                    ) : (
                        <span className="text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 uppercase tracking-widest border border-amber-500/20">Pending</span>
                    )}
                </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-syne uppercase tracking-tight">{hub.name}</h1>
                    <p className="text-lg text-zinc-400 font-body leading-relaxed max-w-4xl">{hub.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Location */}
                    <div className="space-y-4 p-6 bg-surface rounded-2xl border border-surface-border">
                        <h3 className="text-xs font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Location</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">City & Region</p>
                                <p className="text-sm font-medium text-white">{hub.city}{hub.region ? `, ${hub.region}` : ''}</p>
                            </div>
                            {hub.neighborhood && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neighborhood</p>
                                    <p className="text-sm font-medium text-white">{hub.neighborhood}</p>
                                </div>
                            )}
                            {hub.digitalAddress && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Digital Address</p>
                                    <p className="text-sm font-medium text-white">{hub.digitalAddress}</p>
                                </div>
                            )}
                            {hub.coordinates && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Coordinates</p>
                                    <p className="text-sm font-medium text-white font-mono">{hub.coordinates.lat}, {hub.coordinates.lng}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Submitter */}
                    <div className="space-y-4 p-6 bg-surface rounded-2xl border border-surface-border">
                        <h3 className="text-xs font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Contact Info</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hub Phone</p>
                                <p className="text-sm font-medium text-white">{hub.contact || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Website</p>
                                {hub.website ? (
                                    <a href={hub.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-ghana-gold hover:underline break-all">{hub.website}</a>
                                ) : (
                                    <p className="text-sm font-medium text-white">N/A</p>
                                )}
                            </div>
                            <div>
                                {(() => {
                                    if (!hub.facebook || hub.facebook.trim() === '') {
                                        return (
                                            <>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Facebook</p>
                                                <p className="text-sm font-medium text-white">N/A</p>
                                            </>
                                        );
                                    }

                                    const fbLower = hub.facebook.toLowerCase().trim();
                                    const isLink = fbLower.startsWith('http') || fbLower.startsWith('www.facebook.com') || fbLower.startsWith('facebook.com');
                                    const href = fbLower.startsWith('http') ? hub.facebook : `https://${hub.facebook}`;
                                    
                                    return (
                                        <>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                {isLink ? 'Facebook' : 'Facebook Name'}
                                            </p>
                                            {isLink ? (
                                                <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium text-ghana-gold hover:underline break-all">
                                                    {hub.facebook}
                                                </a>
                                            ) : (
                                                <p className="text-sm font-medium text-white break-all">{hub.facebook}</p>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Submitted By</p>
                                <p className="text-sm font-medium text-white break-all">{hub.submitterEmail || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Founder */}
                    <div className="space-y-4 p-6 bg-surface rounded-2xl border border-surface-border md:col-span-2">
                        <h3 className="text-xs font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Founder Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Name</p>
                                <p className="text-sm font-medium text-white">{hub.founderName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Email</p>
                                <p className="text-sm font-medium text-white break-all">{hub.founderEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Phone</p>
                                <p className="text-sm font-medium text-white">{hub.founderPhone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Focus Areas */}
                    {hub.tags && hub.tags.length > 0 && (
                        <div className="space-y-4 p-6 bg-surface rounded-2xl border border-surface-border md:col-span-2">
                            <h3 className="text-xs font-bold font-syne text-ghana-gold uppercase tracking-widest border-b border-surface-border pb-2">Tags & Focus Areas</h3>
                            <div className="flex flex-wrap gap-2">
                                {hub.tags.map((tag: string) => (
                                    <span key={tag} className="text-xs font-bold text-zinc-400 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-surface-border uppercase tracking-widest">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
