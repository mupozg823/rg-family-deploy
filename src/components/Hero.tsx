"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.carousel}>
          {/* Main Feature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.slide}
          >
            <div className={styles.content}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={styles.info}
              >
                <h2>LINA & GAAE</h2>
                <p>LINA& GAAE - RG MAIN PILLAR</p>
              </motion.div>
            </div>
            {/* Background Image Placeholder - using a gradient for now as per instructions to not use placeholders unless generated, but gradient is better for code */}
            <div
              className={styles.background}
              style={{ background: "linear-gradient(45deg, #FF0050, #222)" }}
            />

            {/* Character Images would go here - creating placeholders structure */}
            <div className={styles.characters}>
              {/* Image logic would be here */}
            </div>
          </motion.div>

          {/* Navigation */}
          <button className={`${styles.navBtn} ${styles.prev}`}>
            <ChevronLeft size={32} />
          </button>
          <button className={`${styles.navBtn} ${styles.next}`}>
            <ChevronRight size={32} />
          </button>

          {/* Bottom Cards */}
          <div className={styles.cards}>
            <div className={styles.card}>
              <span>EXCEL UNIT</span>
            </div>
            <div className={styles.card}>
              <span>CREW UNIT</span>
            </div>
            <div className={`${styles.card} ${styles.active}`}>
              <span>RG LOGO</span>
            </div>
            <div className={styles.card}>
              <span>NEW MEMBER</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
