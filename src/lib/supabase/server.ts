import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Helpful error message for missing credentials
  if (!supabaseUrl || !supabaseAnonKey ||
      supabaseUrl.includes('your_supabase') ||
      supabaseAnonKey.includes('your_supabase')) {
    throw new Error(
      '❌ Supabase credentials not configured!\n\n' +
      'Please follow these steps:\n' +
      '1. Open /workspaces/DUTY-LIST/.env.local\n' +
      '2. Replace placeholder values with your actual Supabase credentials\n' +
      '3. Get credentials from: https://app.supabase.com/project/_/settings/api\n\n' +
      'See SETUP.md for complete setup instructions.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
