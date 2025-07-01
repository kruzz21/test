import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  session_token?: string;
}

export interface SessionValidation {
  valid: boolean;
  user?: User;
  message?: string;
}

// Mock authentication functions for frontend-only operation
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  console.warn('Supabase not configured - using mock authentication');
  
  // Mock admin login
  if (email === 'admin@drgeryanilmaz.com' && password === 'DrGurkan2025!') {
    return {
      success: true,
      message: 'Authentication successful',
      user: {
        id: 'mock-admin-id',
        email,
        role: 'admin'
      },
      session_token: 'mock-session-token'
    };
  }
  
  return {
    success: false,
    message: 'Invalid credentials'
  };
};

// Legacy function for backward compatibility
export const authenticateAdmin = authenticateUser;

export const validateSession = async (sessionToken: string): Promise<SessionValidation> => {
  console.warn('Supabase not configured - using mock session validation');
  
  if (sessionToken === 'mock-session-token') {
    return {
      valid: true,
      user: {
        id: 'mock-admin-id',
        email: 'admin@drgeryanilmaz.com',
        role: 'admin'
      }
    };
  }
  
  return {
    valid: false,
    message: 'Invalid session'
  };
};

export const createUser = async (
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
): Promise<AuthResponse> => {
  console.warn('Supabase not configured - using mock user creation');
  return {
    success: true,
    message: 'User created successfully',
    user: {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role
    }
  };
};

export const signOut = async (sessionToken?: string): Promise<void> => {
  console.warn('Supabase not configured - using mock sign out');
  clearAuthState();
};

// Session management
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getSessionToken = (): string | null => {
  return localStorage.getItem('sessionToken');
};

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const sessionToken = getSessionToken();
  return user !== null && sessionToken !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

export const setAuthState = (user: User, sessionToken: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('sessionToken', sessionToken);
};

export const clearAuthState = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('sessionToken');
};

// Auto-validate session on app load
export const initializeAuth = async (): Promise<boolean> => {
  const sessionToken = getSessionToken();
  
  if (!sessionToken) {
    clearAuthState();
    return false;
  }

  try {
    const validation = await validateSession(sessionToken);
    
    if (validation.valid && validation.user) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(validation.user));
      return true;
    } else {
      clearAuthState();
      return false;
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    clearAuthState();
    return false;
  }
};

// Create an authenticated Supabase client for admin operations
export const createAuthenticatedClient = () => {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    throw new Error('No session token found');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    }
  });
};