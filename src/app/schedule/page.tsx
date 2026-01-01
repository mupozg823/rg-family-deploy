import { Calendar } from "@/components/schedule";
import styles from "./page.module.css";

export const metadata = {
  title: "일정 | RG FAMILY",
  description: "RG FAMILY 방송 일정 및 이벤트 캘린더",
};

const EVENT_TYPES = [
  { label: "방송", color: "#ff0050" }, // Brand Pink
  { label: "콜라보", color: "#00d4ff" }, // Cyan (Crew)
  { label: "이벤트", color: "#d4af37" }, // Gold (Special)
  { label: "공지", color: "#ffffff" }, // White
  { label: "휴방", color: "#52525b" }, // Zinc-600 (Muted)
];

export default function SchedulePage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
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
    </main>
  );
}
