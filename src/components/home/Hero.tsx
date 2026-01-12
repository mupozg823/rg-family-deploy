"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";

/**
 * Hero - 홈페이지 메인 배너
 * 린아 이미지 양쪽 + RG FAMILY 로고 가운데 배치
 * 레퍼런스: MOONA DOA 스타일
 */
export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* 왼쪽 멤버 이미지 */}
        <div className={styles.leftSection}>
          <motion.div
            className={styles.memberImageWrapper}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/assets/members/lin.jpg"
              alt="린아"
              fill
              className={styles.memberImage}
              priority
            />
            <div className={styles.imageGradientLeft} />
          </motion.div>
        </div>

        {/* 가운데 로고 영역 */}
        <div className={styles.centerSection}>
          <motion.div
            className={styles.logoArea}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* 로고 글로우 효과 */}
            <div className={styles.logoGlow} />

            {/* 로고 이미지 */}
            <div className={styles.logoImageWrapper}>
              <Image
                src="/assets/logo/rg_logo_3d_pink.png"
                alt="RG Family Logo"
                width={140}
                height={140}
                className={styles.logoImage}
                priority
              />
            </div>

            {/* 로고 텍스트 */}
            <h1 className={styles.logoTitle}>
              <span className={styles.logoTitleRG}>RG</span>
              <span className={styles.logoTitleFamily}>FAMILY</span>
            </h1>
            <p className={styles.logoSubtitle}>OFFICIAL FAN COMMUNITY</p>
          </motion.div>
        </div>

        {/* 오른쪽 멤버 이미지 */}
        <div className={styles.rightSection}>
          <motion.div
            className={styles.memberImageWrapper}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/assets/members/lin.jpg"
              alt="린아"
              fill
              className={`${styles.memberImage} ${styles.flipped}`}
              priority
            />
            <div className={styles.imageGradientRight} />
          </motion.div>
        </div>

        {/* 배경 효과 */}
        <div className={styles.bgGradient} />
        <div className={styles.bgPattern} />
      </div>
    </section>
  );
}
