"use client";
import { createContext, ReactNode, useContext } from "react";
import { AuthUser } from "@/lib/types";

type Role = 'super_admin' | 'admin' | 'empresa'

type AuthContextType = {
    role: Role
    user: AuthUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, role, user }: { children: ReactNode, role: string, user: AuthUser | null }) {    
    return (
        <AuthContext.Provider value={{ role: role as Role, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if(!context) {
        throw new Error()
    }

    return context
}