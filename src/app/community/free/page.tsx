"use client";

import SectionHeader from "@/components/SectionHeader";
import TabFilter from "@/components/community/TabFilter";
import styles from "./page.module.css";

export default function FreeBoardPage() {
  const tabs = [
    { label: "자유게시판 (FREE)", value: "free", path: "/community/free" },
    { label: "VIP 라운지 (VIP)", value: "vip", path: "/community/vip" },
  ];

  // Mock Posts
  const posts = [
    {
      id: 1,
      title: "RG 패밀리 응원합니다!",
      author: "Fan01",
      date: "2024.12.29",
    },
    {
      id: 2,
      title: "오늘 방송 레전드네요 ㅋㅋ",
      author: "Fan02",
      date: "2024.12.29",
    },
    {
      id: 3,
      title: "엑셀부 춤 실력 실화냐?",
      author: "Fan03",
      date: "2024.12.28",
    },
    {
      id: 4,
      title: "가입 인사 드립니다~",
      author: "Newbie",
      date: "2024.12.28",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>COMMUNITY</h1>
        <p>팬들과 소통하는 자유 공간</p>
      </header>

      <TabFilter tabs={tabs} activeTab="free" />

      <div className={styles.board}>
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
