"use client";

import styles from "./LiveMembers.module.css";

export default function LiveMembers() {
  const members = [
    { name: "Lina", status: "LIVE", id: 1 },
    { name: "Gaae", status: "LIVE", id: 2 },
    { name: "Mote", status: "LIVE", id: 3 },
    { name: "Iin", status: "LIVE", id: 4 },
    { name: "Gaae", status: "LIVE", id: 5 },
    { name: "Jood", status: "LIVE", id: 6 },
    { name: "Lina", status: "LIVE", id: 7 },
    { name: "Shara", status: "LIVE", id: 8 },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>LIVE MEMBERS</h3>
        <div className={styles.line} />
      </div>

      <div className={styles.grid}>
        {members.map((member) => (
          <div key={member.id} className={styles.member}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar} />
              <div className={styles.badge}>
                <span className={styles.dot} /> {member.status}
              </div>
            </div>
            <span className={styles.name}>{member.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
