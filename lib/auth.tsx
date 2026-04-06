
"use client"
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Spin } from "antd";
type AuthContextType = {
    user: User | null
    session: Session | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)
export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
        const checkSession = async () => {
            setIsLoading(true)
            const { data, error } = await supabase.auth.getSession()
            if (!error) {
                setSession(data.session)
                setUser(data.session?.user || null)
            }
            setIsLoading(false)

        }
        checkSession()
        // Listen for auth changes SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED /reset password...

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
            setUser(session?.user || null)
            setIsLoading(false)
        })
        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])


    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        return { data, error }
    }

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error) {
            router.push('/quizzes')
        }
        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }
    const value = { user, session, isLoading, signIn, signOut, signUp }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useauth must be used within an authprovider')
    return context
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = pathname === '/login' || pathname === '/signup'
            if (!user && !isPublicRoute) {
                router.push('/login')
            }
            if (user && isPublicRoute) {
                router.push('/')
            }
        }
    }, [user, router, pathname, isLoading])

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Spin size="large" />
        </div>
    }
    return <>{children}</>
}