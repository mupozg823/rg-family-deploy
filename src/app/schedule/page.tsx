import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar } from "@/components/schedule";
import styles from "./page.module.css";

export const metadata = {
  title: "일정 | RG FAMILY",
  description: "RG FAMILY 방송 일정 및 이벤트 캘린더",
};

const EVENT_TYPES = [
  { label: "방송", color: "#22c55e" }, // Green (방송)
  { label: "콜라보", color: "#3b82f6" }, // Blue (콜라보)
  { label: "이벤트", color: "#f59e0b" }, // Amber (이벤트)
  { label: "공지", color: "#a855f7" }, // Purple (공지)
  { label: "휴방", color: "#6b7280" }, // Gray (휴방)
];

export default function SchedulePage() {
  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.hero}>
        <span className={styles.heroBadge}>CALENDAR</span>
        <h1 className={styles.title}>SCHEDULE</h1>
        <p className={styles.subtitle}>RG FAMILY 방송 일정 및 이벤트</p>

        {/* Event Type Legend */}
        <div className={styles.legend}>
          {EVENT_TYPES.map((type) => (
            <div key={type.label} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: type.color }}
              />
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>
      <Calendar />
      <Footer />
    </div>
  );
}
