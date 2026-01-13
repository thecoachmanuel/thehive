"use client"
import { createContext, useContext } from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({ isLoggedIn: false, isAdmin: false })

export function AuthProvider({ children, isLoggedIn, isAdmin }: { children: React.ReactNode; isLoggedIn: boolean; isAdmin: boolean }) {
  return <AuthContext.Provider value={{ isLoggedIn, isAdmin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
