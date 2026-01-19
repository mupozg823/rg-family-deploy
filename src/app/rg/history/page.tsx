import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Timeline from '@/components/info/Timeline'
import styles from './page.module.css'

export const metadata = {
  title: '타임라인 | RG FAMILY',
  description: 'RG FAMILY 연혁 및 히스토리',
}

export default function TimelinePage() {
  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.hero}>
        <span className={styles.heroBadge}>CHRONICLES</span>
        <h1 className={styles.title}>RG HISTORY</h1>
        <p className={styles.subtitle}>RG FAMILY가 걸어온 길</p>
      </div>
      <Timeline />
      <Footer />
    </div>
  )
}
