import * as XLSX from 'xlsx';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get commit data
const START_COMMIT = '6ccf7f4a86048b56534ac91bd1f126e26f749c1b';
const gitLog = execSync(
  `git log ${START_COMMIT}..HEAD --format="%H|%h|%s|%an|%ad" --date=format:"%Y-%m-%d %H:%M" --reverse`,
  { encoding: 'utf-8' }
).trim();

// 영어 커밋 메시지 -> 한글 번역 매핑
const messageTranslations = {
  'feat: Add UX improvements and admin dashboard enhancements': 'feat: UX 개선 및 관리자 대시보드 기능 강화',
  'feat: Add infinite scroll for timeline and hash-based tribute URLs': 'feat: 타임라인 무한스크롤 및 해시 기반 헌정 URL 추가',
  'docs: 2026-01-13 작업 요약 문서 추가': 'docs: 2026-01-13 작업 요약 문서 추가',
  'feat: PandaTV 실시간 라이브 상태 시스템 구현': 'feat: PandaTV 실시간 라이브 상태 시스템 구현',
  'chore: TypeScript 버전 고정 (5.9.3)': 'chore: TypeScript 버전 고정 (5.9.3)',
  'feat: DB 시딩/백업 스크립트 및 Supabase 연결 안정성 개선': 'feat: DB 시딩/백업 스크립트 및 Supabase 연결 안정성 개선',
  'fix: onAuthStateChange 콜백 내 async 사용으로 인한 교착 상태 해결': 'fix: 인증 상태 변경 콜백 내 비동기 처리로 인한 교착 상태 해결',
  'fix: 공지사항/게시판 데이터 로딩 문제 해결': 'fix: 공지사항/게시판 데이터 로딩 문제 해결',
  'feat: 게시판 글쓰기 버튼에 준비 중 알림 추가': 'feat: 게시판 글쓰기 버튼에 준비 중 알림 추가',
  'fix: 시그리스트 사용자 페이지 Supabase 연동 추가': 'fix: 시그리스트 사용자 페이지 Supabase 연동 추가',
  'fix: 미구현 Supabase 쿼리 전수 조사 및 구현': 'fix: 미구현 Supabase 쿼리 전수 조사 및 구현',
  'feat: 관리자 사이드바에 로그아웃 기능 추가': 'feat: 관리자 사이드바에 로그아웃 기능 추가',
  'style: VIP 라운지 잠금 화면 중앙 정렬 개선': 'style: VIP 라운지 잠금 화면 중앙 정렬 개선',
  'fix: 스케줄 페이지 텍스트 가시성 개선': 'fix: 스케줄 페이지 텍스트 가시성 개선',
};

// 커밋별 세부 작업 내용 (shortHash 기준)
const detailDescriptions = {
  '4693adf': `• 관리자 대시보드 UI 전면 개편 (통계 카드, 퀵 액션)
• 콘텐츠 보호 훅 (useContentProtection) 추가
• 지연 로딩 훅 (useLazyLoad) 구현
• CSV 업로더 미리보기/검증 기능 강화
• 조직도 페이지 CSS 스타일 개선
• 시그 카드 호버 효과 및 모달 추가
• 후원 데이터 훅 페이지네이션 지원`,
  '71eb6ae': `• 타임라인 무한스크롤 (useInfiniteScroll) 구현
• 해시 기반 헌정 URL (/ranking/tribute/[hash]) 추가
• 해시 유틸리티 함수 (encode/decode) 작성
• 랭킹 포디움/리스트 링크 해시 URL로 변경
• VIP 페이지 해시 URL 적용
• 네비게이션 바 로고 클릭 영역 개선`,
  'd5a51b1': `• 2026-01-13 작업 내용 요약 문서 작성
• 무한스크롤, 해시 URL 구현 내용 정리`,
  '609d758': `• PandaTV API 클라이언트 모듈 구현
• 라이브 상태 동기화 API 라우트 개선
• 실시간 라이브 상태 폴링 훅 구현
• Vercel Cron Job 설정 (5분 간격)`,
  '72e39b7': `• TypeScript 5.9.3 버전 고정
• package.json/lock 파일 업데이트`,
  '90e98cf': `• DB 시딩 스크립트 (seed-database.ts) 작성
• Supabase 데이터 백업 스크립트 작성
• Mock 데이터 내보내기 스크립트 작성
• fetch-with-retry 유틸리티 추가
• Supabase 레포지토리 에러 핸들링 개선
• 클라이언트 연결 안정성 향상`,
  '31a095c': `• AuthContext onAuthStateChange 콜백 수정
• 비동기 프로필 조회 로직 분리
• 교착 상태(deadlock) 방지 처리`,
  'ec17232': `• 공지사항 페이지 데이터 로딩 로직 수정
• 자유게시판 Supabase 쿼리 수정
• VIP 게시판 Supabase 쿼리 수정
• 레포지토리 에러 로깅 개선`,
  '874b1b3': `• 자유게시판 글쓰기 버튼 알림 추가
• VIP 게시판 글쓰기 버튼 알림 추가
• "준비 중" 토스트 메시지 표시`,
  '97beaf6': `• SigGallery 컴포넌트 Supabase 연동
• 시그니처 데이터 실시간 조회 구현
• Mock/실제 데이터 분기 처리`,
  'fa04ad6': `• VIP 페이지 Supabase 쿼리 구현
• 방명록 훅 (useGuestbook) 전면 개선
• 미구현 쿼리 전수 조사 및 수정`,
  '792cd33': `• 관리자 사이드바 로그아웃 버튼 추가
• 로그아웃 시 메인 페이지 리다이렉트
• 사이드바 하단 UI 정리`,
  'a5f3b82': `• VIP 라운지 잠금 화면 CSS 수정
• 잠금 아이콘/텍스트 중앙 정렬
• 반응형 레이아웃 개선`,
  '13181fa': `• 스케줄 캘린더 텍스트 색상 수정
• 이벤트 리스트 가시성 개선
• 다크 테마 대비 향상`,
};

const commits = gitLog.split('\n').map((line, index) => {
  const [fullHash, shortHash, originalMessage, author, date] = line.split('|');

  // 영어 메시지를 한글로 번역 (매핑에 있으면 사용, 없으면 원본)
  const message = messageTranslations[originalMessage] || originalMessage;

  // Get file stats for this commit
  const stats = execSync(`git show ${shortHash} --stat --format=""`, { encoding: 'utf-8' });
  const filesChanged = stats.match(/(\d+) files? changed/)?.[1] || '0';
  const insertions = stats.match(/(\d+) insertions?/)?.[1] || '0';
  const deletions = stats.match(/(\d+) deletions?/)?.[1] || '0';

  // Parse commit type
  const typeMatch = message.match(/^(feat|fix|docs|style|refactor|chore|test):/i);
  const type = typeMatch ? typeMatch[1].toLowerCase() : 'other';

  // Get category based on message content
  let category = '기타';
  if (message.includes('Admin') || message.includes('admin')) category = 'Admin';
  else if (message.includes('VIP') || message.includes('vip')) category = 'VIP';
  else if (message.includes('랭킹') || message.includes('ranking') || message.includes('Ranking')) category = '랭킹';
  else if (message.includes('라이브') || message.includes('live') || message.includes('Live')) category = '라이브';
  else if (message.includes('게시판') || message.includes('공지') || message.includes('community')) category = '커뮤니티';
  else if (message.includes('Supabase') || message.includes('DB') || message.includes('시딩')) category = '데이터베이스';
  else if (message.includes('Timeline') || message.includes('타임라인') || message.includes('시그')) category = 'RG Info';
  else if (message.includes('스케줄') || message.includes('schedule')) category = '스케줄';
  else if (message.includes('Auth') || message.includes('로그아웃')) category = '인증';
  else if (message.includes('TypeScript') || message.includes('패키지')) category = '설정';
  else if (type === 'docs') category = '문서';
  else if (type === 'style') category = 'UI/UX';
  else if (type === 'feat') category = '기능';
  else if (type === 'fix') category = '버그수정';

  // Type in Korean
  const typeKorean = {
    feat: '기능추가',
    fix: '버그수정',
    docs: '문서',
    style: '스타일',
    refactor: '리팩토링',
    chore: '설정',
    test: '테스트',
    other: '기타'
  }[type] || '기타';

  // 세부 작업 내용 조회
  const 세부작업내용 = detailDescriptions[shortHash] || '';

  return {
    순번: index + 1,
    날짜: date,
    커밋해시: shortHash,
    타입: typeKorean,
    카테고리: category,
    커밋메시지: message,
    세부작업내용: 세부작업내용,
    작성자: author,
    변경파일수: parseInt(filesChanged),
    추가라인: parseInt(insertions),
    삭제라인: parseInt(deletions),
    전체해시: fullHash
  };
});

// Create summary data
const summary = {
  총커밋수: commits.length,
  기간: `${commits[0]?.날짜?.split(' ')[0]} ~ ${commits[commits.length - 1]?.날짜?.split(' ')[0]}`,
  총추가라인: commits.reduce((sum, c) => sum + c.추가라인, 0),
  총삭제라인: commits.reduce((sum, c) => sum + c.삭제라인, 0),
};

// Type breakdown
const typeBreakdown = {};
commits.forEach(c => {
  typeBreakdown[c.타입] = (typeBreakdown[c.타입] || 0) + 1;
});

// Category breakdown
const categoryBreakdown = {};
commits.forEach(c => {
  categoryBreakdown[c.카테고리] = (categoryBreakdown[c.카테고리] || 0) + 1;
});

// Create workbook
const wb = XLSX.utils.book_new();

// Sheet 1: 커밋 상세 목록
const ws1 = XLSX.utils.json_to_sheet(commits);
// Set column widths
ws1['!cols'] = [
  { wch: 5 },   // 순번
  { wch: 18 },  // 날짜
  { wch: 10 },  // 커밋해시
  { wch: 10 },  // 타입
  { wch: 12 },  // 카테고리
  { wch: 55 },  // 커밋메시지
  { wch: 50 },  // 세부작업내용
  { wch: 15 },  // 작성자
  { wch: 10 },  // 변경파일수
  { wch: 10 },  // 추가라인
  { wch: 10 },  // 삭제라인
  { wch: 45 },  // 전체해시
];
XLSX.utils.book_append_sheet(wb, ws1, '커밋 상세');

// Sheet 2: 요약 정보
const summaryData = [
  ['RG Family 작업 현황 보고서', ''],
  ['', ''],
  ['기간', summary.기간],
  ['총 커밋 수', summary.총커밋수],
  ['총 추가 라인', summary.총추가라인.toLocaleString()],
  ['총 삭제 라인', summary.총삭제라인.toLocaleString()],
  ['순 변경 라인', (summary.총추가라인 - summary.총삭제라인).toLocaleString()],
  ['', ''],
  ['타입별 분류', ''],
  ...Object.entries(typeBreakdown).map(([type, count]) => [`  ${type}`, count]),
  ['', ''],
  ['카테고리별 분류', ''],
  ...Object.entries(categoryBreakdown).map(([cat, count]) => [`  ${cat}`, count]),
];
const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
ws2['!cols'] = [{ wch: 25 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, ws2, '요약');

// Sheet 3: 일자별 통계
const dailyStats = {};
commits.forEach(c => {
  const day = c.날짜.split(' ')[0];
  if (!dailyStats[day]) {
    dailyStats[day] = { 날짜: day, 커밋수: 0, 추가라인: 0, 삭제라인: 0 };
  }
  dailyStats[day].커밋수++;
  dailyStats[day].추가라인 += c.추가라인;
  dailyStats[day].삭제라인 += c.삭제라인;
});
const ws3 = XLSX.utils.json_to_sheet(Object.values(dailyStats));
ws3['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
XLSX.utils.book_append_sheet(wb, ws3, '일자별 통계');

// Write file
const outputPath = path.join(process.cwd(), 'docs', 'RG_FAMILY_작업현황_2026-01.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Excel 파일 생성 완료: ${outputPath}`);
console.log(`📊 총 ${commits.length}개 커밋 기록`);
console.log(`📅 기간: ${summary.기간}`);
console.log(`📝 총 변경: +${summary.총추가라인.toLocaleString()} / -${summary.총삭제라인.toLocaleString()} 라인`);
