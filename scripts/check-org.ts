import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data } = await supabase.from('organization').select('*').order('id')
  console.log('전체 organization 테이블:')
  data?.forEach((m) => {
    const status = m.is_active ? '✅' : '❌'
    console.log(`${status} ID:${m.id} | ${m.name} | ${m.unit} | ${m.role}`)
  })

  // ID 시퀀스 확인을 위해 마지막 ID 확인
  const maxId = Math.max(...(data?.map((d) => d.id) || [0]))
  console.log(`\n최대 ID: ${maxId}`)
}

main()
