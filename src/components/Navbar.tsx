"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, User, LogIn, Crown } from "lucide-react";
import { useAuthContext } from "@/lib/context";
import ThemeToggle from "./ThemeToggle";
import styles from "./Navbar.module.css";

interface NavItem {
  label: string;
  href?: string;
  subItems?: { label: string; href: string; description?: string }[];
}

const navItems: NavItem[] = [
  {
    label: "RG 정보",
    subItems: [
      { label: "라이브", href: "/rg/live", description: "현재 방송 중인 멤버" },
      { label: "조직도", href: "/organization", description: "엑셀부 / 크루부 조직" },
      { label: "시그리스트", href: "/signature", description: "시그니처 모음" },
      { label: "타임라인", href: "/timeline", description: "RG 패밀리 연혁" },
    ],
  },
  {
    label: "후원 랭킹",
    subItems: [
      { label: "전체 랭킹", href: "/ranking", description: "누적 후원 순위" },
      { label: "시즌별 랭킹", href: "/ranking/season", description: "시즌별 후원 순위" },
    ],
  },
  {
    label: "공지사항",
    subItems: [
      { label: "전체 공지", href: "/notice", description: "모든 공지사항" },
      { label: "엑셀부 공지", href: "/notice?category=excel", description: "엑셀부 관련 공지" },
      { label: "크루부 공지", href: "/notice?category=crew", description: "크루부 관련 공지" },
    ],
  },
  {
    label: "커뮤니티",
    subItems: [
      { label: "자유게시판", href: "/community/free", description: "자유로운 소통 공간" },
      { label: "VIP 게시판", href: "/community/vip", description: "VIP 전용 라운지" },
    ],
  },
  {
    label: "일정",
    href: "/schedule",
    subItems: [
      { label: "달력", href: "/schedule", description: "월별 일정 캘린더" },
    ],
  },
];

export default function Navbar() {
  const { user, profile } = useAuthContext();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/assets/logo/rg_logo_3d_pink.png"
              alt="RG Logo"
              width={50}
              height={50}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.links}>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={styles.navItem}
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {item.href && !item.subItems ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <button className={styles.link}>
                  {item.label}
                  {item.subItems && <ChevronDown size={14} className={styles.chevron} />}
                </button>
              )}

              {/* Dropdown Menu */}
              {item.subItems && activeDropdown === item.label && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownContent}>
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={styles.dropdownItem}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className={styles.dropdownLabel}>{subItem.label}</span>
                        {subItem.description && (
                          <span className={styles.dropdownDesc}>{subItem.description}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/ranking/vip" className={styles.vipBtn}>
            <Crown size={14} />
            <span>VIP</span>
          </Link>
          <ThemeToggle />
          {user ? (
            <Link href="/mypage" className={styles.profileButton}>
              <div className={styles.avatar}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.nickname} />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className={styles.nickname}>{profile?.nickname || "회원"}</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              <LogIn size={16} />
              <span>로그인</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {/* Mobile Actions */}
          <div className={styles.mobileActions}>
            <Link
              href="/ranking/vip"
              className={styles.mobileVipBtn}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Crown size={16} />
              <span>VIP LOUNGE</span>
            </Link>
            {user ? (
              <Link
                href="/mypage"
                className={styles.mobileProfileBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={16} />
                <span>{profile?.nickname || "마이페이지"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={styles.mobileLoginBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                <span>로그인</span>
              </Link>
            )}
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => (
            <div key={item.label} className={styles.mobileNavItem}>
              <div className={styles.mobileNavHeader}>{item.label}</div>
              {item.subItems && (
                <div className={styles.mobileSubItems}>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={styles.mobileSubItem}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
