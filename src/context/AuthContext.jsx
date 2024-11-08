import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session)
      if (session) {
        console.log('User found:', session.user)
        setUser(session.user)
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event)
        console.log('Session state:', session)
        setUser(session?.user ?? null)
      })

      setLoading(false)
      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [])

  const value = {
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Sign in attempt:', data, error)
      return { data, error }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      console.log('Sign out attempt:', error)
      return { error }
    },
    user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)