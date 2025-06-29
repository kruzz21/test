import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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

// Authentication functions
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      email_param: email,
      password_param: password,
      ip_param: null,
      user_agent_param: navigator.userAgent
    });

    if (error) {
      throw error;
    }

    return data as AuthResponse;
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed'
    };
  }
};

// Legacy function for backward compatibility
export const authenticateAdmin = authenticateUser;

export const validateSession = async (sessionToken: string): Promise<SessionValidation> => {
  try {
    const { data, error } = await supabase.rpc('validate_session', {
      session_token_param: sessionToken
    });

    if (error) {
      throw error;
    }

    return data as SessionValidation;
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      valid: false,
      message: 'Session validation failed'
    };
  }
};

export const createUser = async (
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.rpc('create_user', {
      email_param: email,
      password_param: password,
      role_param: role
    });

    if (error) {
      throw error;
    }

    return data as AuthResponse;
  } catch (error) {
    console.error('User creation error:', error);
    return {
      success: false,
      message: 'User creation failed'
    };
  }
};

export const signOut = async (sessionToken?: string): Promise<void> => {
  try {
    if (sessionToken) {
      await supabase.rpc('logout_user', {
        session_token_param: sessionToken
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    clearAuthState();
  }
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