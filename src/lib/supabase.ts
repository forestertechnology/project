import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced logging function
const log = (level: 'info' | 'error' | 'warn', message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] Supabase Client: ${message}`, ...args);
};

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  log('error', 'Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
}

log('info', `Initializing Supabase client with URL: ${supabaseUrl}`);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'qrmenu-saas'
    }
  }
});

// Enhanced session management
export const initializeSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      log('error', 'Error getting initial session', error);
      return null;
    }

    if (session) {
      log('info', 'Initial session retrieved', session.user?.email);
      return session;
    }

    log('info', 'No active session found');
    return null;
  } catch (err) {
    log('error', 'Unexpected error initializing session', err);
    return null;
  }
};

// Enhanced connection testing with retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const testSupabaseConnection = async (retryCount = 0): Promise<boolean> => {
  try {
    log('info', `Testing Supabase connection (Attempt ${retryCount + 1})`);
    
    const { error, count } = await supabase
      .from('subscription_tiers')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      log('error', 'Supabase connection test failed', error);
      
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return testSupabaseConnection(retryCount + 1);
      }
      
      return false;
    }
    
    log('info', 'Supabase connection successful');
    return true;
  } catch (error) {
    log('error', 'Unexpected error during Supabase connection test', error);
    
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testSupabaseConnection(retryCount + 1);
    }
    
    return false;
  }
};

// Add event listeners for connection status
supabase.auth.onAuthStateChange((event, session) => {
  log('info', `Auth state changed: ${event}`, session?.user?.email);
  
  // Additional logging for debugging
  if (event === 'SIGNED_OUT') {
    log('info', 'User has been signed out completely');
  }
});

// Immediately test connection
(async () => {
  const connectionSuccessful = await testSupabaseConnection();
  
  if (!connectionSuccessful) {
    log('error', 'Failed to establish Supabase connection after multiple attempts');
  }
})();

// Add a method to force clear session
export const forceLogout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    
    // Sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    // Additional cleanup
    await supabase.auth.refreshSession({ refresh_token: '' });
    
    log('info', 'Force logout completed');
  } catch (error) {
    log('error', 'Force logout failed', error);
    throw error;
  }
};
