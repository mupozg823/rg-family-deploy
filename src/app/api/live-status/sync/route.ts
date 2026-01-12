import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SYNC_SECRET = process.env.LIVE_STATUS_SYNC_SECRET

const PLATFORM_KEYS = ['pandatv', 'chzzk', 'youtube', 'twitch'] as const

type SocialLinks = Partial<Record<(typeof PLATFORM_KEYS)[number], string>>

export async function POST(request: Request) {
  if (SYNC_SECRET) {
    const provided = request.headers.get('x-cron-secret')
    if (!provided || provided !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Missing Supabase service role configuration' },
      { status: 500 }
    )
  }

  const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY)
  const now = new Date().toISOString()

  const { data: members, error } = await supabase
    .from('organization')
    .select('id, social_links, is_live')
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (members || []).flatMap((member) => {
    const socialLinks = (member.social_links || {}) as SocialLinks
    return PLATFORM_KEYS.flatMap((platform) => {
      const link = socialLinks[platform]
      if (!link) return []
      return [{
        member_id: member.id,
        platform,
        stream_url: link,
        thumbnail_url: null,
        is_live: member.is_live,
        viewer_count: 0,
        last_checked: now,
      }]
    })
  })

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('live_status')
      .upsert(rows, { onConflict: 'member_id,platform' })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ updated: rows.length })
}

