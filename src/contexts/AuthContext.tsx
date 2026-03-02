"use client";
import { createContext, ReactNode, useContext } from "react";
import { AuthUser } from "@/lib/types";

type AuthContextType = {
    user: AuthUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, user }: { children: ReactNode, user: AuthUser | null }) {    
    return (
        <AuthContext.Provider value={{ user }}>
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