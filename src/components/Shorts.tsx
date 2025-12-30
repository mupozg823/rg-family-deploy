"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { mockMediaContent } from "@/lib/mock/data";
import { USE_MOCK_DATA } from "@/lib/config";
import styles from "./Shorts.module.css";

interface ShortItem {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  unit: "excel" | "crew" | null;
}

export default function Shorts() {
  const supabase = useSupabase();
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchShorts = useCallback(async () => {
    // setIsLoading(true) // Removed to prevent synchronous state update

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

      const shortsData = mockMediaContent
        .filter((m) => m.content_type === "shorts")
        .slice(0, 12);
      setShorts(
        shortsData.map((s) => ({
          id: s.id,
          title: s.title,
          videoUrl: s.video_url,
          thumbnailUrl: s.thumbnail_url || "",
          unit: s.unit,
        }))
      );
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("media_content")
      .select("id, title, video_url, thumbnail_url, unit")
      .eq("content_type", "shorts")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("숏폼 로드 실패:", error);
    } else {
      setShorts(
        (data || []).map((s) => ({
          id: s.id,
          title: s.title,
          videoUrl: s.video_url,
          thumbnailUrl: s.thumbnail_url || "",
          unit: s.unit,
        }))
      );
    }

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      await fetchShorts();
    };
    init();
  }, [fetchShorts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (videoUrl: string) => {
    window.open(videoUrl, "_blank");
  };

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>SHORTS SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    );
  }

  if (shorts.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>SHORTS SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 숏폼이 없습니다</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>SHORTS SECTION</h3>
        <div className={styles.line} />
        <div className={styles.arrows}>
          <button onClick={() => scroll("left")} className={styles.arrowButton}>
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={styles.arrowButton}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.grid} ref={scrollRef}>
        {shorts.map((short) => (
          <div
            key={short.id}
            className={styles.card}
            onClick={() => handleClick(short.videoUrl)}
          >
            <div className={styles.thumbnail}>
              {short.thumbnailUrl ? (
                <Image
                  src={short.thumbnailUrl}
                  alt={short.title}
                  fill
                  className={styles.thumbnailImage}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder} />
              )}

              <div className={styles.playOverlay}>
                <Play strokeWidth={1.5} />
              </div>

              {/* Overlays */}
              {short.unit && (
                <span
                  className={`${styles.unitBadge} ${
                    short.unit === "crew" ? styles.crew : ""
                  }`}
                >
                  {short.unit.toUpperCase()}
                </span>
              )}

              {/* Title Overlay */}
              <div className={styles.info}>
                <h4 className={styles.title}>{short.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
