import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveMembers from "@/components/LiveMembers";
import Notice from "@/components/Notice";
import Shorts from "@/components/Shorts";
import VOD from "@/components/VOD";
import Footer from "@/components/Footer";
import SectionSkeleton from "@/components/SectionSkeleton";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <div className={styles.content}>
        {/* Live & Notice Section */}
        <div className="live-notice-grid">
          <LiveMembers />
          <Notice />
        </div>

        {/* Shorts Section */}
        <Suspense fallback={<SectionSkeleton type="shorts" />}>
          <Shorts />
        </Suspense>

        {/* VOD Section */}
        <Suspense fallback={<SectionSkeleton type="vod" />}>
          <VOD />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
