"use client";

import TabFilter from "@/components/community/TabFilter";
import { Lock } from "lucide-react";
import styles from "./page.module.css";

export default function VipBoardPage() {
  const tabs = [
    { label: "자유게시판 (FREE)", value: "free", path: "/community/free" },
    { label: "VIP 라운지 (VIP)", value: "vip", path: "/community/vip" },
  ];

  // Mock VIP Posts
  const posts = [
    {
      id: 1,
      title: "시즌1 정산 관련 문의입니다.",
      author: "KingUser",
      date: "2024.12.29",
    },
    {
      id: 2,
      title: "VIP 굿즈 배송 언제 시작되나요?",
      author: "VIP01",
      date: "2024.12.28",
    },
    {
      id: 3,
      title: "다음 합방 아이디어 제안",
      author: "VIP02",
      date: "2024.12.28",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>COMMUNITY</h1>
        <p>팬들과 소통하는 자유 공간</p>
      </header>

      <TabFilter tabs={tabs} activeTab="vip" />

      {/* VIP Access Mock */}
      <div className={styles.board}>
        <div className={styles.vipBanner}>
          <Lock size={20} />
          <span>VIP MEMBER ONLY ACCESS</span>
        </div>

        <div className={styles.boardHeader}>
          <span>제목</span>
          <span className={styles.pcOnly}>작성자</span>
          <span className={styles.pcOnly}>날짜</span>
        </div>
        {posts.map((post) => (
          <div key={post.id} className={styles.post}>
            <span className={styles.postTitle}>{post.title}</span>
            <span className={styles.postAuthor}>{post.author}</span>
            <span className={styles.postDate}>{post.date}</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.writeBtn}>글쓰기</button>
      </div>
    </div>
  );
}
