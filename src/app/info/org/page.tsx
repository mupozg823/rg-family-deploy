"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import OrgTree from "@/components/info/OrgTree";
import styles from "./page.module.css";

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<"excel" | "crew">("excel");

  const excelData = {
    name: "HEAD LINA",
    role: "PRESIDENT",
    sub: [
      {
        name: "Manager A",
        role: "DIRECTOR",
        sub: [
          { name: "Member 01", role: "MEMBER" },
          { name: "Member 02", role: "MEMBER" },
        ],
      },
      {
        name: "Manager B",
        role: "DIRECTOR",
        sub: [
          { name: "Member 03", role: "MEMBER" },
          { name: "Member 04", role: "MEMBER" },
        ],
      },
    ],
  };

  const crewData = {
    name: "HEAD GAAE",
    role: "LEADER",
    sub: [
      {
        name: "Team Leader 1",
        role: "MANAGER",
        sub: [
          { name: "Crew 01", role: "CREW" },
          { name: "Crew 02", role: "CREW" },
          { name: "Crew 03", role: "CREW" },
        ],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ORGANIZATION</h1>
        <p>RG FAMILY 조직도</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "excel" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("excel")}
        >
          EXCEL UNIT
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "crew" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("crew")}
        >
          CREW UNIT
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "excel" ? (
          <div className={styles.treeWrapper}>
            <SectionHeader title="엑셀부 (EXCEL)" />
            <OrgTree data={excelData} />
          </div>
        ) : (
          <div className={styles.treeWrapper}>
            <SectionHeader title="크루부 (CREW)" />
            <OrgTree data={crewData} />
          </div>
        )}
      </div>
    </div>
  );
}
