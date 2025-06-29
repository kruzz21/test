import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication types
export interface AdminUser {
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AdminUser;
}

// Admin authentication functions
export const authenticateAdmin = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_admin', {
      email_input: email,
      password_input: password
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

export const signOut = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminUser');
  
  // Sign out from Supabase if using Supabase auth
  await supabase.auth.signOut();
};

export const getCurrentUser = (): AdminUser | null => {
  const userStr = localStorage.getItem('adminUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('adminAuth') === 'true' && getCurrentUser() !== null;
};

export const setAuthState = (user: AdminUser): void => {
  localStorage.setItem('adminAuth', 'true');
  localStorage.setItem('adminUser', JSON.stringify(user));
};

export const clearAuthState = (): void => {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminUser');
};

// Create an authenticated Supabase client for admin operations
export const createAuthenticatedClient = () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No authenticated user found');
  }

  // Create a client with admin context
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'X-Admin-Email': user.email,
        'X-Admin-Role': user.role
      }
    }
  });
};