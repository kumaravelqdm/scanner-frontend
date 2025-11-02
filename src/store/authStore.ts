import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      initialized: false,

      signIn: async (email: string, password: string) => {
        set({ loading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          })
          
          if (error) {
            set({ loading: false })
            return { error }
          }

          if (data.user) {
            set({ user: data.user })
            await get().fetchProfile()
            
            // Update last login timestamp
            await supabase
              .from('profiles')
              .update({ 
                last_login_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
          }
          
          set({ loading: false })
          return { error: null }
        } catch (err) {
          set({ loading: false })
          return { error: err }
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                approved: true,
                is_approved: true,
                email_confirmed_at: new Date().toISOString(),
              },
            },
          })
          if (error) {
            set({ loading: false })
            return { error }
          }

          if (data.user) {
            set({ user: data.user })
            // Profile will be created via trigger, fetch it
            await get().fetchProfile()
          }
          
          set({ loading: false })
          return { error: null }
        } catch (err) {
          set({ loading: false })
          return { error: err }
        }
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          await supabase.auth.signOut()
          set({ 
            user: null, 
            profile: null, 
            loading: false,
            initialized: true 
          })
        } catch (err) {
          console.error('Error signing out:', err)
          set({ loading: false })
        }
      },

      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
            return
          }

          if (data) {
            set({ profile: data })
          } else {
            // Create profile if it doesn't exist (fallback)
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || 'Anonymous User',
                timezone: 'UTC',
                is_active: true,
              })
              .select()
              .single()

            if (!createError && newProfile) {
              set({ profile: newProfile })
            }
          }
        } catch (err) {
          console.error('Error in fetchProfile:', err)
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get()
        if (!user) return { error: new Error('No user logged in') }

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (error) {
            return { error }
          }

          await get().fetchProfile()
          return { error: null }
        } catch (err) {
          return { error: err }
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession()
          
          if (error) {
            console.error('Error refreshing session:', error)
            return
          }

          if (data.user) {
            set({ user: data.user })
            await get().fetchProfile()
          }
        } catch (err) {
          console.error('Error in refreshSession:', err)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
)

// // Enhanced auth state change listener
// supabase.auth.onAuthStateChange(async (event, session) => {
//   const { fetchProfile } = useAuthStore.getState()
  
//   console.log('Auth state changed:', event, session?.user?.id)
  
//   switch (event) {
//     case 'SIGNED_IN':
//       if (session?.user) {
//         useAuthStore.setState({ 
//           user: session.user, 
//           loading: false,
//           initialized: true 
//         })
//         await fetchProfile()
//       }
//       break
      
//     case 'SIGNED_OUT':
//       useAuthStore.setState({ 
//         user: null, 
//         profile: null, 
//         loading: false,
//         initialized: true 
//       })
//       break
      
//     case 'TOKEN_REFRESHED':
//       if (session?.user) {
//         useAuthStore.setState({ user: session.user })
//         await fetchProfile()
//       }
//       break
      
//     case 'USER_UPDATED':
//       if (session?.user) {
//         useAuthStore.setState({ user: session.user })
//         await fetchProfile()
//       }
//       break
      
//     default:
//       useAuthStore.setState({ 
//         loading: false,
//         initialized: true 
//       })
//   }
// })

// Initialize auth state
const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      useAuthStore.setState({ 
        loading: false, 
        initialized: true 
      })
      return
    }

    if (session?.user) {
      useAuthStore.setState({ 
        user: session.user,
        loading: false,
        initialized: true 
      })
      await useAuthStore.getState().fetchProfile()
    } else {
      useAuthStore.setState({ 
        loading: false,
        initialized: true 
      })
    }
  } catch (err) {
    console.error('Error initializing auth:', err)
    useAuthStore.setState({ 
      loading: false,
      initialized: true 
    })
  }
}

// Auto-initialize
initializeAuth()
