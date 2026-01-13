import { Suspense } from "react";
import { PageLayout, SideBanner } from "@/components/layout";
import Navbar from "@/components/Navbar";
import { Hero, LiveMembers, Notice, Shorts, VOD } from "@/components/home";
import Footer from "@/components/Footer";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import styles from "./page.module.css";

export default function Home() {
  return (
    <PageLayout
      leftBanner={
        <SideBanner
          src="/banners/miri-studio.jpg"
          alt="MIRI STUDIO - Body Profile"
        />
      }
      rightBanner={
        <SideBanner
          src="/banners/change-your-body.jpg"
          alt="Change Your Body - 바디 프로필반"
        />
      }
    >
      <div className={styles.main}>
        <Navbar />
        <Hero />
        <div className={styles.content}>
          {/* Live & Notice Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>LIVE NOW</div>
              <h2 className={styles.sectionTitle}>실시간 멤버</h2>
            </div>
            <div className={styles.liveNoticeGrid}>
              <LiveMembers />
              <Notice />
            </div>
          </section>

          {/* Shorts Section */}
          <section className={styles.section}>
            <Suspense fallback={<SectionSkeleton type="shorts" />}>
              <Shorts />
            </Suspense>
          </section>

          {/* VOD Section */}
          <section className={styles.section}>
            <Suspense fallback={<SectionSkeleton type="vod" />}>
              <VOD />
            </Suspense>
          </section>
        </div>

        <Footer />
      </div>
    </PageLayout>
  );
}
