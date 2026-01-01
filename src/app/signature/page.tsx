import SigGallery from '@/components/info/SigGallery'
import styles from './page.module.css'

export const metadata = {
  title: '시그리스트 | RG FAMILY',
  description: 'RG FAMILY 멤버별 시그니처 리액션 모음',
}

export default function SigPage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>SIGNATURE</h1>
        <p className={styles.subtitle}>RG FAMILY 멤버별 시그니처 리액션</p>
      </div>
      <SigGallery />
    </main>
  )
}
