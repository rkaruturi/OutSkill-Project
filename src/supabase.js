import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signUp = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })
    
    if (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Signup exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred during signup' } }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Login error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Login exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred during login' } }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
    return { error }
  } catch (err) {
    console.error('Logout exception:', err)
    return { error: { message: 'An unexpected error occurred during logout' } }
  }
}

export const getCurrentUser = async () => {
  try {
    // Check if supabase client is properly initialized
    if (!supabase) {
      console.error('Supabase client not initialized')
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      // Don't log "Auth session missing!" as an error - it's normal when not logged in
      if (!error.message.includes('Auth session missing')) {
        console.error('Get user error:', error)
      }
      return null
    }
    return user
  } catch (err) {
    // Don't log auth session missing as an error
    if (!err.message || !err.message.includes('Auth session missing')) {
      console.error('Get user exception:', err)
    }
    return null
  }
}

export const onAuthStateChange = (callback) => {
  try {
    return supabase.auth.onAuthStateChange(callback)
  } catch (err) {
    console.error('Auth state change error:', err)
    return { data: { subscription: null } }
  }
}

// Profile helper functions
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Get profile exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred while fetching profile' } }
  }
}

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Update profile exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred while updating profile' } }
  }
}

// Task helper functions
export const getTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Get tasks error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Get tasks exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred while fetching tasks' } }
  }
}

export const createTask = async (title, priority = 'medium', status = 'pending') => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          title,
          priority,
          status
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Create task error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Create task exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred while creating task' } }
  }
}

export const updateTask = async (taskId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) {
      console.error('Update task error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Update task exception:', err)
    return { data: null, error: { message: 'An unexpected error occurred while updating task' } }
  }
}

export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) {
      console.error('Delete task error:', error)
      return { error }
    }
    
    return { error: null }
  } catch (err) {
    console.error('Delete task exception:', err)
    return { error: { message: 'An unexpected error occurred while deleting task' } }
  }
}