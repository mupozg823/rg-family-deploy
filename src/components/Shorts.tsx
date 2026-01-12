"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSupabaseContext } from "@/lib/context";
import { mockMediaContent } from "@/lib/mock";
import { USE_MOCK_DATA } from "@/lib/config";
import { getYouTubeShortsEmbedUrl, getYouTubeThumbnail, extractYouTubeId } from "@/lib/utils/youtube";
import styles from "./Shorts.module.css";

interface ShortItem {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  unit: "excel" | "crew" | null;
}

type UnitFilter = "all" | "excel" | "crew";

export default function Shorts() {
  const supabase = useSupabaseContext();
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUnit, setActiveUnit] = useState<UnitFilter>("all");
  const [selectedVideo, setSelectedVideo] = useState<ShortItem | null>(null);
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
          thumbnailUrl: s.thumbnail_url || getYouTubeThumbnail(s.video_url, "hq") || "",
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
          thumbnailUrl: s.thumbnail_url || getYouTubeThumbnail(s.video_url, "hq") || "",
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

  const handleClick = (short: ShortItem) => {
    setSelectedVideo(short);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  // Filter shorts by unit
  const filteredShorts = activeUnit === "all"
    ? shorts
    : shorts.filter((s) => s.unit === activeUnit);

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
          <h3>SHORTS</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 숏폼이 없습니다</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>SHORTS</h3>
        <div className={styles.unitToggle}>
          <button
            className={`${styles.toggleBtn} ${activeUnit === "all" ? styles.active : ""}`}
            onClick={() => setActiveUnit("all")}
          >
            ALL
          </button>
          <button
            className={`${styles.toggleBtn} ${activeUnit === "excel" ? styles.active : ""}`}
            onClick={() => setActiveUnit("excel")}
          >
            EXCEL
          </button>
          <button
            className={`${styles.toggleBtn} ${styles.crewBtn} ${activeUnit === "crew" ? styles.active : ""}`}
            onClick={() => setActiveUnit("crew")}
          >
            CREW
          </button>
        </div>
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
        {filteredShorts.map((short) => (
          <div
            key={short.id}
            className={styles.card}
            onClick={() => handleClick(short)}
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

      {/* YouTube Embed Modal */}
      {selectedVideo && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>
              <X size={24} />
            </button>
            <div className={styles.videoWrapper}>
              {extractYouTubeId(selectedVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeShortsEmbedUrl(selectedVideo.videoUrl) || ""}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.videoFrame}
                />
              ) : (
                <div className={styles.videoError}>
                  YouTube URL을 확인해주세요
                </div>
              )}
            </div>
            <div className={styles.videoInfo}>
              <h4>{selectedVideo.title}</h4>
              {selectedVideo.unit && (
                <span className={`${styles.modalBadge} ${selectedVideo.unit === "crew" ? styles.crew : ""}`}>
                  {selectedVideo.unit.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
