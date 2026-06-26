"use client"

import Link from 'next/link'

export default function AdminHubCard({ hub, onApprove, onDelete, onEdit, loading, type }: any) {
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
                <p className="text-zinc-500 text-sm sm:text-lg font-bold uppercase tracking-[0.1em]">{hub.neighborhood}{hub.neighborhood && hub.city ? ', ' : ''}<span className="text-zinc-400">{hub.city}</span>{hub.region && <span className="text-zinc-600"> &bull; {hub.region}</span>}</p>
                {hub.founderName && <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] mt-1">Founder: <span className="text-zinc-400">{hub.founderName}</span></p>}
                <div className="flex flex-wrap gap-1.5 sm:gap-2.5 mt-2 sm:mt-4">
                    {hub.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] sm:text-[11px] font-bold text-zinc-500 bg-surface px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-surface-border uppercase tracking-widest">{tag}</span>
                    ))}
                    {hub.tags?.length > 3 && <span className="text-[9px] sm:text-[11px] font-bold text-zinc-700 py-1">+ {hub.tags.length - 3} more</span>}
                </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 border-t lg:border-t-0 lg:border-l border-surface-border pt-5 sm:pt-8 lg:pt-0 lg:pl-10">
                {onApprove && !hub.verified && (
                    <button onClick={onApprove} disabled={loading}
                        className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-ghana-green hover:bg-emerald-400 text-black text-xs sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-ghana-green/10">
                        Approve
                    </button>
                )}
                <Link href={`/admin/hub/${hub.id}`}
                    className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-surface-card hover:bg-zinc-800 text-white text-xs sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all border border-surface-border shadow-md text-center">
                    View
                </Link>
                {onEdit && (
                    <button onClick={onEdit}
                        className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all border border-surface-border shadow-md">
                        Edit
                    </button>
                )}
                <button onClick={onDelete} disabled={loading}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-ghana-red hover:bg-ghana-red/10 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all border border-ghana-red/20">
                    Delete
                </button>
            </div>
        </div>
    )
}
