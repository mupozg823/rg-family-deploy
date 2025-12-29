import { Calendar } from '@/components/schedule'
import styles from './page.module.css'

export const metadata = {
  title: '일정 | RG FAMILY',
  description: 'RG FAMILY 방송 일정 및 이벤트 캘린더',
}

export default function SchedulePage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>일정</h1>
        <p className={styles.subtitle}>RG FAMILY 방송 일정 및 이벤트</p>
      </div>
      <Calendar />
    </main>
  )
}
