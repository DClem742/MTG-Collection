// Import necessary dependencies for context and authentication
import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../config/supabase'

// Create authentication context
const AuthContext = createContext()

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods throughout the app
 * Features:
 * - User session management
 * - Authentication state tracking
 * - Sign in/out functionality
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to receive auth context
 */
export function AuthProvider({ children }) {
  // Track authenticated user and loading state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize authentication and set up listeners
  useEffect(() => {
    const initializeAuth = async () => {
      // Get initial session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session)
      if (session) {
        console.log('User found:', session.user)
        setUser(session.user)
      }

       // Set up real-time auth state listener
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

  // Context value with auth methods and state
  const value = {
    // Sign in with email/password
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Sign in attempt:', data, error)
      return { data, error }
    },
    // Sign out current user
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      console.log('Sign out attempt:', error)
      return { error }
    },
    user
  }
  // Provide auth context to child components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for accessing auth context
export const useAuth = () => useContext(AuthContext)