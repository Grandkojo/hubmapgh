'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'

interface AdminContextType {
    pendingHubs: any[]
    allHubs: any[]
    cities: string[]
    setCities: (cities: string[]) => void
    focusAreas: string[]
    setFocusAreas: (areas: string[]) => void
    loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [pendingHubs, setPendingHubs] = useState<any[]>([])
    const [allHubs, setAllHubs] = useState<any[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [focusAreas, setFocusAreas] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const getAuthHeaders = async () => {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('Not authenticated')
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }

    useEffect(() => {
        if (!user) return

        let pendingLoaded = false
        let allLoaded = false

        const checkLoading = () => {
            if (pendingLoaded && allLoaded) setLoading(false)
        }

        // Pending Hubs Subscription
        const qPending = query(
            collection(db, 'hubs'),
            where('verified', '==', false),
            orderBy('submittedAt', 'desc')
        )
        const unsubPending = onSnapshot(qPending, (snapshot) => {
            setPendingHubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            if (!pendingLoaded) {
                pendingLoaded = true
                checkLoading()
            }
        })

        // All Hubs Subscription
        const qAll = query(collection(db, 'hubs'), orderBy('name', 'asc'))
        const unsubAll = onSnapshot(qAll, (snapshot) => {
            setAllHubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            if (!allLoaded) {
                allLoaded = true
                checkLoading()
            }
        })

        // Fetch metadata
        getAuthHeaders()
            .then(headers => fetch('/api/admin/metadata', { cache: 'no-store', headers }))
            .then(res => res.json())
            .then(data => {
                setCities(data.cities || [])
                setFocusAreas(data.focusAreas || [])
            })
            .catch(err => {
                console.error('Failed to load metadata:', err)
            })

        return () => {
            unsubPending()
            unsubAll()
        }
    }, [user])

    return (
        <AdminContext.Provider value={{ pendingHubs, allHubs, cities, setCities, focusAreas, setFocusAreas, loading }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const context = useContext(AdminContext)
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider')
    }
    return context
}
