"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pin, ChevronRight } from "lucide-react";
import { useNotices } from "@/lib/context";
import styles from "./Notice.module.css";

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  thumbnailUrl: string | null;
}

export default function Notice() {
  const noticesRepo = useNotices();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    const data = await noticesRepo.findAll();
    const sorted = [...data]
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 2);

    setNotices(
      sorted.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content || "",
        isPinned: n.is_pinned,
        createdAt: n.created_at,
        thumbnailUrl: n.thumbnail_url,
      }))
    );
    setIsLoading(false);
  }, [noticesRepo]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await fetchNotices();
      // mounted check는 fetchNotices 내부에서 처리됨
    };
    init();

    return () => {
      mounted = false;
    };
  }, [fetchNotices]);

  const getPreviewLines = (content: string, maxLines: number = 2) => {
    return content.split("\n").slice(0, maxLines);
  };

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>
            <span className={styles.rgIcon}>RG</span>
            전체 공지 (NOTICE)
          </h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    );
  }

  if (notices.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>
            <span className={styles.rgIcon}>RG</span>
            전체 공지 (NOTICE)
          </h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 공지사항이 없습니다</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>
          <span className={styles.rgIcon}>RG</span>
          전체 공지 (NOTICE)
        </h3>
        <div className={styles.line} />
        <Link href="/notice" className={styles.viewAll}>
          전체보기 <ChevronRight size={16} />
        </Link>
      </div>

      <div className={styles.list}>
        {notices.map((notice) => (
          <Link
            key={notice.id}
            href={`/notice/${notice.id}`}
            className={styles.item}
          >
            {notice.isPinned && (
              <div className={styles.pinBadge}>
                <Pin size={14} className={styles.pin} />
              </div>
            )}
            {/* Thumbnail - Left */}
            {notice.thumbnailUrl ? (
              <div className={styles.itemThumbnail}>
                <Image
                  src={notice.thumbnailUrl}
                  alt={notice.title}
                  fill
                  sizes="64px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className={styles.itemLogo}>
                <Image
                  src="/assets/logo/rg_logo_flat.png"
                  alt="RG"
                  width={24}
                  height={24}
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </div>
            )}
            {/* Content - Right */}
            <div className={styles.itemContent}>
              <span
                className={`${styles.tag} ${notice.isPinned ? styles.tagPinned : ""}`}
                style={{
                  color: notice.isPinned
                    ? "var(--color-primary-deep)"
                    : "var(--text-muted)",
                }}
              >
                {notice.isPinned ? "중요 공지" : "전체 공지"}
              </span>
              <div className={styles.content}>
                {getPreviewLines(notice.content).map((line, idx) => (
                  <p key={idx}>{line || "\u00A0"}</p>
                ))}
              </div>
              <span className={styles.more}>자세히 보기</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
