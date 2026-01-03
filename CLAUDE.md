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
Styling: Tailwind CSS 4 + CSS Modules + CSS Variables
UI Components: shadcn/ui (Radix) + Mantine 7
State: React Hooks + Context API
Animation: Framer Motion
Carousel: Embla Carousel
Icons: Lucide React
Backend: Supabase
```

### UI 라이브러리 용도

| 라이브러리 | 용도 | 예시 |
|-----------|------|------|
| **Tailwind CSS 4** | 유틸리티 스타일링 | `className="flex gap-4 p-6"` |
| **shadcn/ui** | 버튼, 카드, 모달 | `<Button variant="pink">` |
| **Mantine** | 폼, 테이블, 알림 | `useForm()`, `notifications.show()` |
| **CSS Modules** | 컴포넌트 고유 스타일 | `styles.hero` |

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
| **정보** | 조직도 (계층 구조 + 연결선) | `src/app/info/org/page.tsx` |
| **정보** | 시그리스트 (6-col 그리드 + 필터) | `src/app/info/sig/page.tsx` |
| **정보** | 타임라인 (시즌별 카드형) | `src/app/info/timeline/page.tsx` |
| **랭킹** | 전체 랭킹 + 게이지 바 | `src/app/ranking/total/page.tsx` |
| **랭킹** | 시즌별 랭킹 | `src/app/ranking/season/[id]/page.tsx` |
| **랭킹** | VIP 페이지 | `src/app/ranking/vip/page.tsx` |
| **커뮤니티** | 자유게시판/VIP게시판 | `src/app/community/` |
| **일정** | 캘린더 | `src/app/schedule/page.tsx` |
| **인증** | 로그인/회원가입 | `src/app/(auth)/` |
| **Admin** | CMS 11개 페이지 | `src/app/admin/` |
| **시스템** | 다크/라이트 모드 | `src/lib/context/ThemeContext.tsx` |
| **시스템** | Mock 데이터 시스템 | `src/lib/mock/data.ts` |

### ❌ 미구현 (우선순위순)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| **Top 1-3 헌정 페이지** | `/ranking/vip/[userId]` 개인 페이지 | 🔴 높음 |
| **실시간 라이브 상태** | PandaTV API 연동 | 🟡 중간 |
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

### Phase 2: UI/UX 프리미엄 디자인 ✅ (완료)

1. **메인 페이지** ✅
   - Hero 배너 슬라이더
   - LIVE MEMBERS 시안색 펄스
   - Shorts/VOD 그리드

2. **조직도 (RG Info)** ✅
   - 대표 → 부장 → 팀장 → 멤버 계층 구조
   - 연결선 시각화 (vertical/horizontal)
   - 프로필 카드 호버 & 상세 모달

3. **랭킹 페이지** ✅
   - 수평 핑크 게이지 바
   - Top 3 포디움
   - 퍼센티지 뱃지

4. **VIP SECRET 페이지** ✅
   - 프리미엄 다크 배경
   - Special Thanks 섹션
   - VIP Signatures 갤러리

5. **타임라인** ✅
   - 시즌별 그룹화 & 헤더 카드
   - 이미지 카드형 디자인
   - 카테고리/시즌 필터

6. **시그리스트** ✅
   - 6-column 그리드 (cnine 스타일)
   - 카테고리/검색 필터
   - 재생버튼 & 상세 모달

### Phase 3: Admin 기능 강화 ✅ (완료)

1. **CSV 대량 업로드** ✅
   - 후원 데이터 일괄 등록
   - 미리보기 + 검증
   - PandaTV 형식 지원

2. **Admin CMS** ✅
   - 11개 관리 페이지 완료
   - CRUD 기능 구현

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

## 🤖 AI 워크플로우 자동화 (Claude Code)

> **자동 매칭**: 사용자 프롬프트를 분석하여 최적의 도구/스킬을 자동 적용

### 트리거 패턴 → 자동 워크플로우 매칭

| 트리거 키워드/패턴 | 자동 적용 워크플로우 |
|-------------------|---------------------|
| `기능 추가`, `구현해줘`, `만들어줘`, `개발` | **새 기능 구현** 워크플로우 |
| `버그`, `에러`, `안돼`, `수정`, `fix` | **버그 수정** 워크플로우 |
| `리팩토링`, `구조 변경`, `정리`, `개선` | **리팩토링** 워크플로우 |
| `디자인`, `UI`, `CSS`, `스타일`, `레이아웃` | **UI/디자인** 워크플로우 |
| `API`, `라이브러리`, `패키지`, `npm` | **외부 라이브러리** 체크 |
| `테스트`, `검증`, `확인해줘` | **테스트/검증** 워크플로우 |
| `계획`, `설계`, `어떻게` (복잡한 요청) | **계획 수립** 먼저 |
| 모호한 요청 (구체성 부족) | `code-prompt-coach` 스킬 |

### 워크플로우별 도구 체인

#### 1️⃣ 새 기능 구현
```
[모호하면] code-prompt-coach → feature-planner 스킬
→ Explore Agent (코드베이스 파악)
→ [외부 라이브러리] Context7 MCP
→ frontend-design / software-architecture 스킬
→ 구현 (Edit/Write)
→ 빌드 검증 (npm run build)
→ [프론트엔드] claude-in-chrome (스크린샷)
→ workthrough-v2 스킬
```

#### 2️⃣ 버그 수정
```
→ Explore Agent (원인 분석)
→ claude-in-chrome MCP:
  - read_console_messages (에러 로그)
  - read_network_requests (API 디버깅)
→ ide MCP (getDiagnostics - TypeScript 오류)
→ 수정 (Edit)
→ 빌드 검증
→ workthrough-v2 스킬
```

#### 3️⃣ 대규모 리팩토링
```
→ feature-planner 스킬 (계획)
→ EnterPlanMode (복잡한 경우)
→ software-architecture 스킬
→ [심볼 변경] serena MCP
→ 테스트 검증
→ kaizen 스킬 (추가 개선점)
→ workthrough-v2 스킬
```

#### 4️⃣ UI/디자인 작업
```
→ docs/RG_FAMILY_DESIGN_SYSTEM.md 참조 (필수)
→ frontend-design 스킬
→ 구현 (Edit CSS/TSX)
→ claude-in-chrome MCP:
  - screenshot (시각적 검증)
  - gif_creator (변경 기록)
→ workthrough-v2 스킬
```

#### 5️⃣ 외부 라이브러리 사용
```
→ Context7 MCP (최신 문서/예제 조회)
→ WebSearch (버전별 변경사항)
→ 구현
→ 검증
```

### MCP 서버 활용 가이드

| MCP | 자동 활용 시점 |
|-----|---------------|
| `context7` | 외부 라이브러리 API/버전 언급 시 |
| `claude-in-chrome` | 프론트엔드 작업 완료 후 검증 |
| `github` | PR 생성, 이슈 관리 요청 시 |
| `supabase` | DB 스키마/쿼리 관련 작업 시 |
| `playwright` | E2E 테스트 필요 시 |
| `serena` | 대규모 심볼 리팩터링 시 |

### Context7 UI 라이브러리 문서 조회

프론트엔드 작업 시 **반드시** Context7로 최신 문서 확인:

```bash
# Tailwind CSS 4
context7: resolve tailwindcss -> get /docs/installation
context7: resolve tailwindcss -> get /docs/theme

# shadcn/ui 컴포넌트
context7: resolve shadcn-ui -> get /docs/components/button
context7: resolve shadcn-ui -> get /docs/components/dialog
context7: resolve shadcn-ui -> get /docs/components/card

# Mantine
context7: resolve mantine -> get /docs/core/button
context7: resolve mantine -> get /docs/form/use-form
context7: resolve mantine -> get /docs/x/notifications
```

**트리거 조건:**
- `Tailwind`, `tw-`, `className` 언급 → Tailwind 문서 조회
- `shadcn`, `ui/`, `Button variant` 언급 → shadcn/ui 문서 조회
- `Mantine`, `useForm`, `notifications` 언급 → Mantine 문서 조회

### Claude 스킬 자동 적용

| 스킬 | 트리거 조건 |
|------|------------|
| `code-prompt-coach` | 모호하거나 구체성 부족한 요청 |
| `feature-planner` | 새 기능 구현, 복잡한 작업 |
| `frontend-design` | UI/CSS/Tailwind/shadcn/Mantine 관련 작업 + **Context7 문서 조회** |
| `software-architecture` | 구조 설계, SOLID 원칙 필요 시 |
| `test-driven-development` | 테스트 작성 요청 |
| `kaizen` | 리팩토링, 코드 개선 |
| `workthrough-v2` | **모든 작업 완료 후 자동 실행** |

### 필수 참조 문서

| 작업 유형 | 참조 문서 |
|----------|----------|
| 디자인/UI | `docs/RG_FAMILY_DESIGN_SYSTEM.md` |
| 프로젝트 규칙 | `CLAUDE.md` (이 파일) |
| 이전 작업 | `workthrough/*.md` |

### 자동 워크플로우 예시

**사용자**: "VIP 페이지에 애니메이션 추가해줘"
```
1. 트리거 감지: "VIP", "애니메이션" → UI/디자인 워크플로우
2. 자동 적용:
   - RG_FAMILY_DESIGN_SYSTEM.md 참조
   - frontend-design 스킬 활성화
   - 구현 후 claude-in-chrome으로 검증
   - workthrough-v2로 문서화
```

**사용자**: "framer-motion 최신 버전으로 업그레이드"
```
1. 트리거 감지: "framer-motion", "최신 버전" → 외부 라이브러리
2. 자동 적용:
   - Context7 MCP로 최신 문서 조회
   - 마이그레이션 가이드 확인
   - 변경 사항 적용
   - 빌드 검증
```

**사용자**: "로그인이 안돼"
```
1. 트리거 감지: "안돼" → 버그 수정 워크플로우
2. 자동 적용:
   - Explore Agent로 원인 분석
   - claude-in-chrome으로 콘솔/네트워크 확인
   - 수정 후 검증
```

---

## 문서 위치

- 작업 기록: `/workthrough/YYYY-MM-DD_HH_MM_*.md`
- 개발 계획: `/.claude/plans/`
- 타입 정의: `/src/types/`
- 디자인 시스템: `/docs/RG_FAMILY_DESIGN_SYSTEM.md`
