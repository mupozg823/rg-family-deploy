import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { USE_MOCK_DATA, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

/**
 * Mock Supabase 프록시
 * Supabase 자격 증명이 없을 때 빈 응답을 반환하는 프록시 객체
 */
function createMockSupabaseProxy(): SupabaseClient<Database> {
  const emptyResponse = { data: null, error: null }
  const emptyArrayResponse = { data: [], error: null }

  const queryBuilder = {
    select: () => queryBuilder,
    insert: () => Promise.resolve(emptyResponse),
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    neq: () => queryBuilder,
    gt: () => queryBuilder,
    gte: () => queryBuilder,
    lt: () => queryBuilder,
    lte: () => queryBuilder,
    like: () => queryBuilder,
    ilike: () => queryBuilder,
    is: () => queryBuilder,
    in: () => queryBuilder,
    contains: () => queryBuilder,
    containedBy: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    range: () => queryBuilder,
    single: () => Promise.resolve(emptyResponse),
    maybeSingle: () => Promise.resolve(emptyResponse),
    then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
      Promise.resolve(emptyArrayResponse).then(resolve),
  }

  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => mockChannel,
    unsubscribe: () => Promise.resolve('ok'),
  }

  return {
    from: () => queryBuilder,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    channel: () => mockChannel,
    removeChannel: () => Promise.resolve('ok'),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      }),
    },
  } as unknown as SupabaseClient<Database>
}

export function createClient(): SupabaseClient<Database> {
  // Mock 모드이거나 Supabase 자격 증명이 없으면 Mock 프록시 반환
  if (USE_MOCK_DATA || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return createMockSupabaseProxy()
  }

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-info': 'rg-family-web',
      },
    },
    db: {
      schema: 'public',
    },
    // 연결 안정성 향상
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

// Singleton instance for client-side usage
let client: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) {
    client = createClient()
  }
  return client
}
