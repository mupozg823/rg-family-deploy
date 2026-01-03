import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SigGallery from '@/components/info/SigGallery'
import styles from './page.module.css'

export const metadata = {
  title: '시그리스트 | RG FAMILY',
  description: 'RG FAMILY 멤버별 시그니처 리액션 모음',
}

export default function SigPage() {
  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.hero}>
        <span className={styles.heroBadge}>COLLECTION</span>
        <h1 className={styles.title}>SIGNATURE</h1>
        <p className={styles.subtitle}>RG FAMILY 멤버별 시그니처 리액션</p>
      </div>
      <SigGallery />
      <Footer />
    </div>
  )
}
