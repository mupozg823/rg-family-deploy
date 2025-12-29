# RG Family - Claude Code 프로젝트 가이드

## 프로젝트 개요

**RG Family**는 PandaTV 스트리머 팬 커뮤니티 공식 웹사이트입니다.

- **목적**: 팬덤 활동 중심지, 후원자 감사 플랫폼
- **타겟**: 내부 팬/VIP 후원자
- **배포**: Vercel
- **백엔드**: Supabase (Auth + Database + Storage)

---

## 기술 스택

```
Frontend: Next.js 16+ (App Router, React 19)
Styling: CSS Modules + CSS Variables (다크/라이트 모드)
State: React Hooks + Context API
Animation: Framer Motion
Carousel: Embla Carousel
Icons: Lucide React
Backend: Supabase
```

---

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 로그인/회원가입
│   ├── admin/             # Admin CMS (11개 페이지)
│   ├── community/         # 커뮤니티 (자유/VIP)
│   ├── info/              # 정보 (조직도/시그/타임라인)
│   ├── notice/            # 공지사항
│   ├── ranking/           # 후원 랭킹
│   └── schedule/          # 일정 캘린더
├── components/            # 재사용 컴포넌트
├── lib/
│   ├── config.ts          # 환경 설정 (USE_MOCK_DATA)
│   ├── context/           # React Context (Theme, Auth)
│   ├── hooks/             # Custom Hooks
│   ├── mock/              # Mock 데이터
│   └── utils/             # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
```

---

## 구현 현황

### ✅ 완료된 기능

| 카테고리 | 기능 | 파일 위치 |
|---------|------|----------|
| **메인** | Hero 배너 슬라이더 (Embla) | `src/components/Hero.tsx` |
| **메인** | LIVE MEMBERS (시안색 펄스) | `src/components/LiveMembers.tsx` |
| **메인** | 공지사항 섹션 | `src/components/Notice.tsx` |
| **메인** | Shorts/VOD 섹션 | `src/components/Shorts.tsx`, `VOD.tsx` |
| **정보** | 조직도 (Excel/Crew) | `src/app/info/org/page.tsx` |
| **정보** | 시그리스트 갤러리 | `src/app/info/sig/page.tsx` |
| **정보** | 타임라인 | `src/app/info/timeline/page.tsx` |
| **랭킹** | 전체 랭킹 + 게이지 바 | `src/app/ranking/total/page.tsx` |
| **랭킹** | 시즌별 랭킹 | `src/app/ranking/season/[id]/page.tsx` |
| **랭킹** | VIP 페이지 | `src/app/ranking/vip/page.tsx` |
| **커뮤니티** | 자유게시판/VIP게시판 | `src/app/community/` |
| **일정** | 캘린더 | `src/app/schedule/page.tsx` |
| **인증** | 로그인/회원가입 | `src/app/(auth)/` |
| **Admin** | CMS 11개 페이지 | `src/app/admin/` |
| **시스템** | 다크/라이트 모드 | `src/lib/context/ThemeContext.tsx` |
| **시스템** | Mock 데이터 시스템 | `src/lib/mock/data.ts` |

### ⚠️ 개선 필요

| 기능 | 현재 상태 | 목표 |
|------|----------|------|
| 조직도 계층 | 섹션별 표시 | 대표 → 팀장 → 멤버 시각적 계층 |
| 타임라인 | 기본 목록 | 시즌별 카드형 + 이미지 |
| 시그리스트 | 기본 | 필터링 강화 + 재생버튼 개선 |

### ❌ 미구현 (우선순위순)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| **VIP 전용 콘텐츠** | Top 1-50 비공개 감사 메시지 | 🔴 높음 |
| **Top 1-3 헌정 페이지** | 개인별 Secret Page | 🔴 높음 |
| **실시간 라이브 상태** | PandaTV API 연동 | 🟡 중간 |
| **CSV 대량 업로드** | Admin 후원 데이터 일괄 등록 | 🟡 중간 |
| **알림 시스템** | 공지/일정 알림 | 🟢 낮음 |

---

## 개발 가이드라인

### 1. Mock 데이터 사용

```typescript
import { USE_MOCK_DATA } from '@/lib/config'
import { mockProfiles } from '@/lib/mock/data'

if (USE_MOCK_DATA) {
  // Mock 데이터 사용
  return mockProfiles
}
// Supabase 쿼리
```

### 2. CSS 변수 (테마) - Minimal & Refined Hip

```css
/* Typography */
--font-display: 'Outfit', -apple-system, sans-serif;
--font-body: 'Noto Sans KR', -apple-system, sans-serif;

/* 브랜드 컬러 */
--color-primary: #fd68ba;        /* 핑크 */
--color-primary-light: #ff8ed4;
--primary-deep: #fb37a3;

/* LIVE 상태 컬러 */
--live-color: #00d4ff;           /* 시안 (cnine.kr 스타일) */
--live-glow: rgba(0, 212, 255, 0.6);

/* 랭킹 컬러 */
--gold: #ffd700;
--silver: #c0c0c0;
--bronze: #cd7f32;

/* 다크 테마 서피스 */
--background: #050505;
--surface: #121212;
--card-bg: #0a0a0a;
```

### 3. 컴포넌트 패턴

```typescript
// 1. Supabase 훅 사용
const supabase = useSupabase()

// 2. Mock 데이터 분기
if (USE_MOCK_DATA) {
  // mock 데이터 처리
  return
}

// 3. Supabase 쿼리
const { data, error } = await supabase.from('table').select()
```

### 4. 후원 단위

```typescript
// 팬더티비 후원 단위: 하트 (♥)
const formatAmount = (amount: number) => {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}만 하트`
  return `${amount.toLocaleString()} 하트`
}
```

---

## 디자인 레퍼런스

### 스타일: "Minimal & Refined Hip"

RG Family 공식 디자인 컨셉으로, 프리미엄 팬 커뮤니티의 정체성을 반영합니다.

**핵심 디자인 원칙:**
- 다크 테마 기반의 프리미엄 감성
- 핑크(#fd68ba) 브랜드 컬러 + 시안(#00d4ff) LIVE 포인트
- 깔끔한 타이포그래피 (Outfit + Noto Sans KR)
- 미니멀한 UI에 세련된 디테일
- 애니메이션: 부드러운 전환, 펄스 효과

**주요 화면별 디자인:**
| 화면 | 특징 |
|------|------|
| 메인 | Hero 배너 + 멤버 이미지, LIVE MEMBERS 그리드 |
| RG Info | 트리 구조 조직도, 계층 연결선 |
| 랭킹 | 수평 핑크 게이지 바, Top 3 포디움 |
| VIP SECRET | 프리미엄 다크, 사인 갤러리, 특별 메시지 |

### 참조 사이트

| 기능 | 참조 URL | 참고 요소 |
|------|---------|----------|
| 라이브/조직도 | kuniv.kr | 멤버 카드 UI |
| 조직도/시그/타임라인 | cnine.kr | 시안색 LIVE 테두리, 계층 구조 |
| 랭커 특전 | sooplive.co.kr | VIP 전용 페이지 |

---

## 데이터베이스 스키마 (Supabase)

### 핵심 테이블

```sql
-- 프로필 (후원자)
profiles: id, nickname, avatar_url, role, unit, total_donation

-- 후원 내역
donations: id, donor_id, donor_name, amount, season_id, unit, created_at

-- 시즌
seasons: id, name, start_date, end_date, is_active

-- 조직
organization: id, name, role, unit, position_order, image_url, is_live

-- VIP 보상
vip_rewards: id, rank_range, reward_type, content, image_url
```

---

## 향후 개발 로드맵

> **디자인 레퍼런스**: "Minimal & Refined Hip" 스타일
> - 프리미엄 다크 테마 기반
> - 핑크(#fd68ba) + 시안(#00d4ff) 컬러 조합
> - 깔끔한 타이포그래피 (Outfit + Noto Sans KR)

### Phase 1: VIP 시스템 완성 ✅ (완료)

1. **VIP 전용 콘텐츠 페이지** ✅
   - `/ranking/vip` 접근 제어 (Top 50만)
   - 멤버별 감사 영상 섹션
   - VIP SECRET 사인 갤러리 섹션
   - VIP 뱃지 표시

2. **Top 1-3 헌정 페이지**
   - `/ranking/vip/[userId]` 개인 페이지
   - 골드/실버/브론즈 테마
   - 커스텀 감사 메시지

### Phase 2: UI/UX 프리미엄 디자인 (진행중)

1. **메인 페이지 개선**
   - Hero 배너: 멤버 이미지 + 타이틀 조합
   - LIVE MEMBERS: 시안색 펄스 애니메이션 ✅
   - Shorts/VOD 그리드 최적화

2. **조직도 (RG Info) 트리 구조**
   - 대표 → 부장 → 팀장 → 멤버 계층
   - 연결선 시각화
   - 프로필 카드 호버 효과

3. **랭킹 페이지 개선** ✅
   - 수평 핑크 게이지 바 (그라디언트)
   - Top 3 포디움 (골드/실버/브론즈)
   - 퍼센티지 표시 뱃지

4. **VIP SECRET 페이지** ✅
   - 프리미엄 다크 배경
   - Special Thanks 비디오 섹션
   - VIP Exclusive Signatures 갤러리

### Phase 3: Admin 기능 강화

1. **CSV 대량 업로드** ✅
   - 후원 데이터 일괄 등록
   - 미리보기 + 검증
   - PandaTV 형식 지원

2. **배너 관리 드래그앤드롭**
   - 순서 변경
   - 실시간 미리보기

### Phase 4: 실시간 기능

1. **PandaTV API 연동**
   - 실시간 라이브 상태 감지
   - 자동 LIVE 배지 업데이트

2. **알림 시스템**
   - 공지/일정 알림
   - 푸시 알림 지원

---

## 빠른 참조

### 주요 훅

```typescript
useSupabase()      // Supabase 클라이언트
useAuth()          // 인증 상태
useRanking()       // 랭킹 데이터
useTheme()         // 다크/라이트 모드
```

### 주요 컴포넌트

```typescript
<Hero />           // 메인 배너 슬라이더
<LiveMembers />    // 라이브 멤버 섹션
<RankingCard />    // 랭킹 카드 (게이지 바)
<GaugeBar />       // 후원 게이지 바
<SigCard />        // 시그니처 카드
```

### 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_USE_MOCK_DATA=true  # 개발용
```

---

## 주의사항

1. **후원 단위**: SOOP(별풍선) ❌ → PandaTV(하트) ✅
2. **Mock 데이터**: 개발 시 `USE_MOCK_DATA=true` 사용
3. **이미지 도메인**: `next.config.ts`에 허용 도메인 추가 필요
4. **LIVE 상태 컬러**: 핑크가 아닌 **시안색** (cnine.kr 스타일)

---

## 문서 위치

- 작업 기록: `/workthrough/YYYY-MM-DD_HH_MM_*.md`
- 개발 계획: `/.claude/plans/`
- 타입 정의: `/src/types/`
