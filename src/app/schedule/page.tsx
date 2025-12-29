import { Calendar } from '@/components/schedule'
import styles from './page.module.css'

export const metadata = {
  title: '일정 | RG FAMILY',
  description: 'RG FAMILY 방송 일정 및 이벤트 캘린더',
}

const EVENT_TYPES = [
  { label: '방송', color: '#4ade80' },
  { label: '콜라보', color: '#60a5fa' },
  { label: '이벤트', color: '#f472b6' },
  { label: '공지', color: '#fbbf24' },
  { label: '휴방', color: '#94a3b8' },
]

export default function SchedulePage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>SCHEDULE</h1>
        <p className={styles.subtitle}>RG FAMILY 방송 일정 및 이벤트</p>

        {/* Event Type Legend */}
        <div className={styles.legend}>
          {EVENT_TYPES.map((type) => (
            <div key={type.label} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: type.color }}
              />
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>
      <Calendar />
    </main>
  )
}
