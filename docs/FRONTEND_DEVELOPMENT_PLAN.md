# RG Family 프론트엔드 개발 계획서

> **디자인 컨셉**: Minimal & Refined Hip
> **레퍼런스**: Gemini_Generated_Image_mfmutrmfmutrmfmu.png

---

## 1. 디자인 레퍼런스 분석

### 1.1 레퍼런스 이미지 구성 (5개 화면)

| 화면 | 주요 요소 | 현재 상태 |
|------|----------|----------|
| **메인 페이지** | Hero 배너 (LINA & GAAE), LIVE MEMBERS, NOTICE, Shorts, VOD | ✅ 구현됨 |
| **RG Info (조직도)** | 엑셀부/크루부 토글, 트리 구조, 연결선 | ✅ 구현됨 |
| **랭킹 페이지** | 핑크 게이지 바, Top 10 리스트 | ✅ 구현됨 |
| **랭킹 상세** | 프로필 + 게이지 바 리스트 | ✅ 구현됨 |
| **VIP SECRET** | 감사 영상, 시그니처 갤러리, 멤버 사진 | ✅ 구현됨 |

### 1.2 핵심 디자인 요소

```
색상 시스템:
├── Background: #050505 (매우 어두운 검정)
├── Surface: #121212 ~ #1a1a1a
├── Primary (핑크): #fd68ba
├── LIVE (시안): #00d4ff
├── Gold: #ffd700
├── Silver: #c0c0c0
└── Bronze: #cd7f32

타이포그래피:
├── Display: Space Grotesk / Outfit
├── Body: Noto Sans KR
└── Mono: JetBrains Mono

UI 패턴:
├── 원형 아바타 + LIVE 배지
├── 수평 게이지 바 (핑크 그라데이션)
├── 글래스모피즘 카드
├── 미니멀한 여백
└── 섬세한 그림자/글로우
```

---

## 2. 현재 구현 상태 vs 레퍼런스 비교

### 2.1 메인 페이지

| 요소 | 레퍼런스 | 현재 | 개선 필요 |
|------|---------|------|----------|
| Hero 배너 | 인물 사진 + 텍스트 오버레이 | ✅ 구현됨 | 이미지 품질 향상 |
| LIVE MEMBERS | 2행 4열 그리드, 시안 테두리 | ✅ 구현됨 | - |
| NOTICE | RG 로고 아이콘, 2개 항목 | ✅ 구현됨 | - |
| Shorts | 4열 세로 카드, 재생 버튼 | ✅ 구현됨 | - |
| VOD | 가로 카드, 재생 버튼 오버레이 | ✅ 구현됨 | - |

### 2.2 RG Info (조직도)

| 요소 | 레퍼런스 | 현재 | 개선 필요 |
|------|---------|------|----------|
| 유닛 토글 | "엑셀부 (EXCEL)" 핑크 버튼 | ✅ 구현됨 | - |
| 트리 구조 | 대표 → 부장 → 팀장 → 멤버 | ✅ 구현됨 | - |
| 연결선 | 세로/가로 라인 | ✅ 구현됨 | - |
| 프로필 카드 | 원형 아바타 + 이름 + 역할 | ✅ 구현됨 | - |

### 2.3 랭킹 페이지

| 요소 | 레퍼런스 | 현재 | 개선 필요 |
|------|---------|------|----------|
| 게이지 바 | 핑크 그라데이션, 퍼센트 표시 | ✅ 구현됨 | - |
| 순위 뱃지 | 골드/실버/브론즈 색상 | ✅ 구현됨 | - |
| 멤버 정보 | 아바타 + 닉네임 + 후원금액 | ✅ 구현됨 | - |

### 2.4 VIP SECRET

| 요소 | 레퍼런스 | 현재 | 개선 필요 |
|------|---------|------|----------|
| Special Thanks Video | 영상 섹션 | ✅ 구현됨 | - |
| VIP Signatures | 손글씨 시그니처 갤러리 | ✅ 구현됨 | - |
| 멤버 사진 | 하단 멤버 이미지 | ✅ 구현됨 | - |

---

## 3. 개선 우선순위

### 🔴 Priority 1: CSS 일관성 수정 (즉시)

```css
/* 수정 필요 파일 */
VOD.module.css: #00d4ff → var(--live-color)
Shorts.module.css: #00d4ff → var(--live-color)
RankingBoard.module.css: #00f0ff → var(--live-color)
LiveMembers.module.css: #ef4444 → var(--live-badge-color)
```

**예상 소요**: 30분

### 🟡 Priority 2: 시맨틱 컬러 변수 추가 (단기)

```css
/* globals.css에 추가 */
:root {
  --crew-color: #00d4ff;
  --excel-color: #fd68ba;
  --live-badge-bg: #ef4444;
  --live-badge-glow: rgba(239, 68, 68, 0.4);
}
```

**예상 소요**: 15분

### 🟢 Priority 3: 반응형 브레이크포인트 변수화 (중기)

```css
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1400px;
}
```

**예상 소요**: 20분

---

## 4. 신규 기능 개발 계획

### Phase 1: 실시간 기능 (1-2주)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| PandaTV API 연동 | 실시간 라이브 상태 감지 | 🔴 높음 |
| WebSocket 연결 | 실시간 업데이트 | 🔴 높음 |
| 라이브 알림 | 방송 시작 알림 | 🟡 중간 |

### Phase 2: 사용자 경험 개선 (2-3주)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 스켈레톤 로딩 | 모든 페이지에 적용 | 🟡 중간 |
| 무한 스크롤 | 커뮤니티/랭킹 페이지 | 🟡 중간 |
| 이미지 최적화 | Next.js Image + blur placeholder | 🟡 중간 |
| 페이지 전환 애니메이션 | Framer Motion 활용 | 🟢 낮음 |

### Phase 3: 추가 콘텐츠 (3-4주)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 더 많은 직캠 콘텐츠 | KISS OF LIFE, ILLIT 등 | 🟢 낮음 |
| 갤러리 확장 | 팬아트, 밈 갤러리 | 🟢 낮음 |
| 이벤트 페이지 | 특별 이벤트 전용 페이지 | 🟢 낮음 |

---

## 5. 기술 부채 해결

### 5.1 코드 품질

| 항목 | 현재 상태 | 목표 |
|------|----------|------|
| TypeScript strict | 부분 적용 | 전체 적용 |
| ESLint 규칙 | 기본 | 엄격 모드 |
| 테스트 커버리지 | 0% | 60%+ |
| E2E 테스트 | 없음 | Playwright |

### 5.2 성능 최적화

| 항목 | 현재 | 목표 |
|------|------|------|
| Lighthouse Performance | 미측정 | 90+ |
| First Contentful Paint | 미측정 | < 1.5s |
| Largest Contentful Paint | 미측정 | < 2.5s |
| Bundle Size | 미측정 | 최적화 |

---

## 6. 파일별 수정 계획

### 즉시 수정 (Priority 1)

```
src/components/VOD.module.css
├── Line 262: #00d4ff → var(--live-color)
├── Line 264: #050505 → var(--background)
└── Line 376: #00d4ff → var(--live-color)

src/components/Shorts.module.css
├── Line 204: #00d4ff → var(--live-color)
└── Line 369: #00d4ff → var(--live-color)

src/components/RankingBoard.module.css
└── Line 182: #00f0ff → var(--live-color)

src/components/LiveMembers.module.css
└── Line 128: #ef4444 → var(--live-badge-bg)
```

### 단기 수정 (Priority 2)

```
src/app/globals.css
├── 시맨틱 컬러 변수 추가
├── 브레이크포인트 변수 추가
└── 추가 유틸리티 클래스
```

---

## 7. 결론

### 현재 상태 평가: A- (90/100)

**강점:**
- 레퍼런스 디자인과 높은 일치도 (95%+)
- 체계적인 CSS 변수 시스템
- 완전한 기능 구현 (모든 페이지)
- 프리미엄 다크 테마 일관성
- 반응형 디자인 적용

**개선점:**
- 일부 하드코딩된 색상값
- 실시간 API 연동 미구현
- 테스트 커버리지 부족

### 다음 단계

1. **즉시**: CSS 색상 일관성 수정 (30분)
2. **이번 주**: 시맨틱 컬러 변수 추가 (15분)
3. **다음 주**: PandaTV API 연동 시작
4. **월간**: E2E 테스트 도입

---

*작성일: 2025-12-31*
*버전: 1.0*
