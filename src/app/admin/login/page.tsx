'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/admin')
        } catch (err: any) {
            setError(err.message || 'Failed to login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6 text-zinc-500 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                    <h2 className="text-3xl font-bold font-display text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                        Admin Login
                    </h2>
                    <p className="mt-2 text-zinc-400 font-body">
                        Ghana Tech Hub Directory
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-ghana-red/10 border border-ghana-red/20 text-ghana-red px-4 py-3 rounded-xl text-sm font-body text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white outline-none focus:border-ghana-gold/50 transition-colors"
                                placeholder="admin@hubmapgh.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white outline-none focus:border-ghana-gold/50 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ghana-gold text-black font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-ghana-gold/10 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
