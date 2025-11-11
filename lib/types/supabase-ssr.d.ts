declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';

  export interface SupabaseServerCookies {
    getAll: () => Array<{ name: string; value: string; options?: any }>;
    setAll: (
      cookiesToSet: Array<{ name: string; value: string; options?: any }>
    ) => void;
  }

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: {
      cookies?: SupabaseServerCookies;
    }
  ): SupabaseClient;
}
