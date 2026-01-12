"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { mockBanners, type MockBanner as Banner } from "@/lib/mock";
import styles from "./Hero.module.css";

const AUTOPLAY_DELAY = 5000; // 5초

export default function Hero() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const autoplayOptions = {
    delay: AUTOPLAY_DELAY,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false },
    [Autoplay(autoplayOptions)]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const activeBanners = mockBanners
    .filter((b) => b.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.carousel} ref={emblaRef}>
          <div className={styles.slidesContainer}>
            {activeBanners.map((banner, index) => (
              <BannerSlide
                key={banner.id}
                banner={banner}
                isActive={index === selectedIndex}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className={`${styles.navBtn} ${styles.prev}`}
          onClick={scrollPrev}
          aria-label="이전 슬라이드"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className={`${styles.navBtn} ${styles.next}`}
          onClick={scrollNext}
          aria-label="다음 슬라이드"
        >
          <ChevronRight size={32} />
        </button>

        {/* Dot Navigation */}
        <div className={styles.dots}>
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === selectedIndex ? styles.dotActive : ""
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`슬라이드 ${index + 1}`}
            >
              {index === selectedIndex && (
                <motion.span
                  className={styles.dotProgress}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: AUTOPLAY_DELAY / 1000,
                    ease: "linear",
                  }}
                  key={selectedIndex}
                />
              )}
            </button>
          ))}
        </div>

        {/* Slide Counter */}
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>
            {String(selectedIndex + 1).padStart(2, "0")}
          </span>
          <span className={styles.counterDivider}>/</span>
          <span className={styles.counterTotal}>
            {String(activeBanners.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}

function BannerSlide({
  banner,
  isActive,
}: {
  banner: Banner;
  isActive: boolean;
}) {
  const hasMemberImage = !!banner.memberImageUrl;

  return (
    <div
      className={`${styles.slide} ${hasMemberImage ? styles.withImage : ""}`}
    >
      {/* Background w/ Aurora Effect */}
      <div className={`${styles.background} aurora-bg`}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: banner.bgGradient,
            opacity: 0.9,
            zIndex: 1,
          }}
        />
      </div>

      {/* Member Image (Left Side) */}
      {hasMemberImage && (
        <div className={styles.memberImageContainer}>
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                className={styles.memberImage}
                initial={{ x: -60, opacity: 0, scale: 1.05 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Image
                  src={banner.memberImageUrl!}
                  alt={banner.title}
                  fill
                  className={styles.memberImg}
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Content (Left Side if Image Exists) */}
      <div
        className={`${styles.content} ${
          hasMemberImage ? styles.withImage : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={banner.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={styles.info}
            >
              <motion.span
                className={styles.subtitle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {banner.subtitle}
              </motion.span>
              <motion.h2
                className={styles.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {banner.title}
              </motion.h2>
              {banner.description && (
                <motion.p
                  className={styles.description}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {banner.description}
                </motion.p>
              )}

              {/* Badges */}
              {banner.badges && banner.badges.length > 0 && (
                <motion.div
                  className={styles.badges}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {banner.badges.map((badge, idx) => (
                    <span key={idx} className={styles.badge}>
                      {badge}
                    </span>
                  ))}
                </motion.div>
              )}

              {banner.linkUrl && banner.linkText && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href={banner.linkUrl} className={styles.ctaButton}>
                    {banner.linkText}
                    <ExternalLink size={16} />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className={styles.overlay} />
      <div className={styles.grain} />
    </div>
  );
}
