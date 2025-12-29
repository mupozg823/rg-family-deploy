"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { mockBanners, type Banner } from "@/lib/mock/data";
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
              className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ""}`}
              onClick={() => scrollTo(index)}
              aria-label={`슬라이드 ${index + 1}`}
            >
              {index === selectedIndex && (
                <motion.span
                  className={styles.dotProgress}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTOPLAY_DELAY / 1000, ease: "linear" }}
                  key={selectedIndex}
                />
              )}
            </button>
          ))}
        </div>

        {/* Slide Counter */}
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>{String(selectedIndex + 1).padStart(2, "0")}</span>
          <span className={styles.counterDivider}>/</span>
          <span className={styles.counterTotal}>{String(activeBanners.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}

function BannerSlide({ banner, isActive }: { banner: Banner; isActive: boolean }) {
  return (
    <div className={styles.slide}>
      {/* Background */}
      <div
        className={styles.background}
        style={{ background: banner.bgGradient }}
      />

      {/* Content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={banner.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
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

      {/* Member Images (if available) */}
      {banner.memberImages && banner.memberImages.length > 0 && (
        <div className={styles.characters}>
          {banner.memberImages.map((imgSrc, idx) => (
            <div key={idx} className={styles.characterContainer}>
              <Image
                src={imgSrc}
                alt={`Member ${idx + 1}`}
                fill
                className={styles.characterImage}
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* Decorative Elements */}
      <div className={styles.overlay} />
      <div className={styles.grain} />
    </div>
  );
}
