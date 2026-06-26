'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface User {
    id: string
    email: string
    role: string
    createdAt: string
    createdBy?: string
}

export default function UsersManagementPage() {
    const { user } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [addingUser, setAddingUser] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState('admin')
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [generatedPassword, setGeneratedPassword] = useState('')

    const fetchUsers = async () => {
        try {
            const token = await user?.getIdToken()
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.users) setUsers(data.users)
            setIsSuperAdmin(!!data.isSuperAdmin)
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) fetchUsers()
    }, [user])

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')
        setGeneratedPassword('')
        setAddingUser(true)

        try {
            const token = await user?.getIdToken()
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: newEmail, role: newRole })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to add admin')

            if (data.isNewUser && data.generatedPassword) {
                setGeneratedPassword(data.generatedPassword)
            } else {
                setSuccessMsg('Existing user successfully upgraded to Admin.')
            }

            setNewEmail('')
            setNewRole('admin')
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setAddingUser(false)
        }
    }

    const handleRevoke = async (uid: string) => {
        if (!window.confirm('Are you sure you want to revoke admin access for this user?')) return
        
        try {
            const token = await user?.getIdToken()
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid })
            })
            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || 'Failed to revoke admin')
            
            fetchUsers()
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-8 h-8 border-4 border-ghana-gold/20 border-t-ghana-gold rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <section className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-syne text-white mb-2">Users Management</h1>
                    <p className="text-sm text-zinc-400">Manage admins and view users registered on HubMap.</p>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-surface-border">
                <h2 className="text-sm font-black uppercase tracking-widest text-white mb-4">Add New Admin</h2>
                    <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            required
                            placeholder="Email address..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-ghana-gold/50"
                        />
                        {isSuperAdmin && (
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-ghana-gold/50"
                            >
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        )}
                        <button
                            type="submit"
                            disabled={addingUser}
                            className="px-6 py-3 bg-ghana-gold text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            {addingUser ? 'Adding...' : 'Add Admin'}
                        </button>
                    </form>

                    {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
                    {successMsg && <p className="text-emerald-400 text-xs mt-3">{successMsg}</p>}
                    
                    {generatedPassword && (
                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-400 text-sm font-semibold mb-2">New user created successfully!</p>
                            <p className="text-zinc-300 text-xs mb-1">Please securely share this temporary password with them so they can log in:</p>
                            <p className="text-white font-mono text-lg bg-black/50 p-2 rounded inline-block">{generatedPassword}</p>
                        </div>
                    )}
            </div>

            <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-surface-border bg-black/20">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Added On</th>
                                {isSuperAdmin && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-mono text-zinc-300">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-widest rounded-md border ${
                                            u.role === 'super_admin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : u.role === 'admin' 
                                            ? 'bg-ghana-gold/10 text-ghana-gold border-ghana-gold/20' 
                                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-xs">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            {(u.role === 'admin' || u.role === 'super_admin') ? (
                                                <button
                                                    onClick={() => handleRevoke(u.id)}
                                                    className="text-ghana-red hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                                                >
                                                    Revoke Admin
                                                </button>
                                            ) : (
                                                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-8 text-center text-zinc-500 text-sm">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
