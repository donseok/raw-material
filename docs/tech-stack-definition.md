# 기술스택 정의서

## 철스크랩 수급 계획 및 구매 관리 시스템

**동국제강 주식회사 원료기획팀**
**시스템 버전**: 1.0
**최종 수정일**: 2026년 3월

---

## 1. 기술스택 총괄

### 1.1 아키텍처 유형

**클라이언트 사이드 SPA (Single Page Application) — 정적 웹 애플리케이션**

- 서버 사이드 로직 없음 (서버리스)
- 빌드 도구 없음 (번들러, 트랜스파일러 미사용)
- 브라우저에서 직접 실행되는 Vanilla JavaScript

### 1.2 기술스택 요약

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 마크업 | HTML5 | - | 페이지 구조, 시맨틱 마크업 |
| 스타일링 | CSS3 | - | 레이아웃, 반응형, 애니메이션 |
| 스크립팅 | JavaScript | ES6+ | 비즈니스 로직, DOM 조작, 이벤트 처리 |
| 차트 | Chart.js | 4.4.1 | 데이터 시각화 (막대/도넛/파이/라인 차트) |
| 화면 캡처 | html2canvas | 1.4.1 | DOM 요소를 이미지로 캡처 |
| 문서 생성 | docx | 9.5.1 | Word(.docx) 문서 생성 |
| 파일 저장 | FileSaver.js | 2.0.5 | Blob을 파일로 다운로드 |
| 데이터 저장 | Web Storage API | - | localStorage (영구), sessionStorage (세션) |
| 배포 | Vercel | - | 정적 사이트 호스팅, 자동 배포 |
| 소스 관리 | Git / GitHub | - | 버전 관리, 협업 |

---

## 2. 프론트엔드 상세

### 2.1 HTML5

#### 사용 기능

| 기능 | 적용 위치 | 설명 |
|------|----------|------|
| 시맨틱 태그 | `<nav>`, `<header>` | 탭 네비게이션, 헤더 영역 |
| 폼 요소 | `<input>`, `<select>`, `<form>` | 발주/거래처/수입계약 등록 모달 |
| data-* 속성 | `data-tab` | 탭 전환 라우팅 키 |
| `<canvas>` | 차트 렌더링 영역 | Chart.js 렌더링 대상 |
| `<table>` | 데이터 테이블 | 수급계획, 공장배분, 발주 등 |

#### 파일 구성

| 파일 | 역할 |
|------|------|
| `login.html` | 로그인 페이지 (독립 스타일 포함) |
| `index.html` | 대시보드 메인 (SPA, 탭 기반) |

### 2.2 CSS3

#### 아키텍처

CSS를 3개 파일로 분리하여 관심사 분리 원칙을 적용합니다.

| 파일 | 역할 | 주요 내용 |
|------|------|----------|
| `css/variables.css` | 디자인 토큰 | CSS Custom Properties (색상, 그림자) |
| `css/layout.css` | 레이아웃 | 그리드, 헤더, 탭, 반응형, 인쇄 |
| `css/components.css` | UI 컴포넌트 | 카드, 배지, 버튼, 테이블, 모달, 토스트 |

#### CSS Custom Properties (디자인 토큰)

```css
:root {
  /* 브랜드 색상 */
  --primary: #1a237e;        /* 남색 (메인) */
  --primary-light: #283593;
  --primary-dark: #0d1642;
  --accent: #ff8f00;         /* 주황 (강조) */
  --accent-light: #ffa726;

  /* 상태 색상 */
  --success: #2e7d32;        /* 초록 */
  --warning: #f57f17;        /* 노랑 */
  --danger: #c62828;         /* 빨강 */

  /* 중립 색상 */
  --gray-50 ~ --gray-800     /* 9단계 회색 */
  --text: #212121;
  --bg: #f0f2f5;

  /* 효과 */
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
}
```

#### 반응형 대응

| 브레이크포인트 | 대상 | 변경 사항 |
|---------------|------|----------|
| ≤ 900px | 태블릿 이하 | 2/3열 그리드 → 1열, 패딩 축소 |
| ≤ 480px | 모바일 | 로그인 카드 패딩 축소 |

#### 인쇄 스타일

```css
@media print {
  .header, .tab-nav { display: none; }
  .tab-content { display: block !important; }
  .card { box-shadow: none; border: 1px solid #ddd; }
}
```

### 2.3 JavaScript (ES6+)

#### 사용 문법

| ES6+ 기능 | 사용 위치 |
|-----------|----------|
| `const` / `let` | 전체 (블록 스코프 변수) |
| 화살표 함수 | `fmt()`, `Array.map/filter/reduce` 콜백 |
| 템플릿 리터럴 | 미사용 (문자열 연결 사용) |
| 구조 분해 할당 | `normalizePlanData()` options 파라미터 |
| 스프레드 연산자 | `savePlanCell()`, `saveAllocCell()` 행 갱신 |
| `Object.freeze()` | `STORAGE_KEYS` 상수 보호 |
| `Array.includes()` | `normalizeOrder()` 유효값 검증 |
| `Number.isFinite()` | `fmt()`, `isNonNegativeNumber()` |
| `String.padStart()` | 자동 번호 생성 (PO, IMP, S코드) |
| `async`/`await` | `export-doc.js` (탭 순회, 캡처, 문서 생성) |
| Optional chaining (`?.`) | `export-doc.js` (loggedInUser?.name) |
| `Promise` | `export-doc.js` (canvas.toBlob, blob.arrayBuffer) |

#### 모듈 구조 (글로벌 스코프)

빌드 도구 미사용으로 ES Modules가 아닌 `<script>` 태그 순차 로딩 방식입니다.

```
로딩 순서 (의존성 순):

utils.js     ← 공통 유틸리티 (fmt, parseNum, readStoredData 등)
    ↓
data.js      ← STORAGE_KEYS, 기본값 정의, 전역 변수 선언
    ↓
plan.js      ← 수급계획 모듈
alloc.js     ← 공장배분 모듈
order.js     ← 발주관리 모듈
supplier.js  ← 거래처관리 모듈
import.js    ← 수입계약 모듈
inventory.js ← 재고현황 모듈
stats.js     ← 구매실적 모듈
export-doc.js ← DOCX 내보내기 모듈
    ↓
app.js       ← 초기화, 탭 제어, 이벤트 바인딩
```

> **주의**: 순서 변경 시 `ReferenceError` 발생. 반드시 위 순서를 유지해야 합니다.

#### 각 모듈의 표준 함수 패턴

| 함수 패턴 | 역할 | 예시 |
|-----------|------|------|
| `normalize*()` | 데이터 검증/정규화 | `normalizeOrder(order)` |
| `load*FromStorage()` | localStorage → 전역 변수 복원 | `loadOrderDataFromStorage()` |
| `save*Data()` | 전역 변수 → localStorage 저장 | `saveOrderData()` |
| `render*()` | 테이블/KPI DOM 렌더링 | `renderOrders()` |
| `render*Chart()` | Chart.js 차트 렌더링 | `renderImportChart()` |
| `init*()` | 초기화 진입점 | `initOrders()` |
| `submit*()` | 모달 폼 제출 처리 | `submitOrder()` |
| `reset*Form()` | 폼 초기화 | `resetOrderForm()` |
| `getNext*()` | 자동 번호 생성 | `getNextOrderNo()` |

---

## 3. 차트 라이브러리 — Chart.js

### 3.1 기본 정보

| 항목 | 내용 |
|------|------|
| 라이브러리 | Chart.js |
| 버전 | 4.4.1 |
| 로딩 방식 | CDN (jsdelivr) |
| 번들 | UMD (`chart.umd.min.js`) |

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

### 3.2 사용 차트 유형

| 차트 유형 | 사용 모듈 | 용도 |
|-----------|----------|------|
| Bar (막대) | plan, inventory, stats, import | 계획 대비 실적, 재고 비교, 상태 건수 |
| Doughnut (도넛) | alloc, stats | 실적/미달 비율, 등급별 비중 |
| Pie (파이) | supplier | 거래처별 납품 비중 |
| Line (라인) | supplier | 월별 납품 추이 |
| 복합 (Bar+Line) | stats | 구매량(막대) + 금액(라인) |

### 3.3 차트 인스턴스 관리

```javascript
// 전역 차트 인스턴스 저장소
const chartInstances = {};

// 차트 생성 전 기존 인스턴스 파괴 (메모리 누수 방지)
function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}
```

탭 전환 시 `renderCharts(tab)`이 호출되며, 활성 탭의 차트만 렌더링합니다.

---

## 3-1. 문서 내보내기 라이브러리

### 3-1.1 html2canvas

| 항목 | 내용 |
|------|------|
| 라이브러리 | html2canvas |
| 버전 | 1.4.1 |
| 용도 | DOM 요소를 Canvas로 렌더링하여 PNG 이미지 생성 |
| 사용 위치 | `export-doc.js`의 `captureElementSnapshot()` |

### 3-1.2 docx

| 항목 | 내용 |
|------|------|
| 라이브러리 | docx |
| 버전 | 9.5.1 |
| 번들 | IIFE (`index.iife.js`) |
| 용도 | JavaScript에서 Word(.docx) 문서 생성 |
| 사용 클래스 | `Document`, `Paragraph`, `TextRun`, `ImageRun`, `Packer`, `HeadingLevel`, `AlignmentType`, `PageOrientation` |

### 3-1.3 FileSaver.js

| 항목 | 내용 |
|------|------|
| 라이브러리 | FileSaver.js |
| 버전 | 2.0.5 |
| 용도 | Blob 객체를 사용자 파일로 다운로드 (`saveAs()`) |

---

## 4. 데이터 저장 계층 — Web Storage API

### 4.1 저장소 구분

| 저장소 | 용도 | 수명 |
|--------|------|------|
| `localStorage` | 업무 데이터 (수급계획, 발주 등) | 영구 (브라우저 데이터 삭제 전까지) |
| `sessionStorage` | 로그인 세션 (`loggedInUser`) | 브라우저 탭 닫을 때까지 |

### 4.2 localStorage 키 관리

```javascript
const STORAGE_KEYS = Object.freeze({
  plan: 'planData',
  alloc: 'allocData',
  orders: 'ordersData',
  suppliers: 'suppliersData',
  imports: 'importsData'
});
```

### 4.3 저장 형식

모든 데이터는 envelope 패턴으로 저장됩니다.

```javascript
{
  "data": [...],                         // 실제 데이터 배열
  "timestamp": "2026-03-10T09:00:00.000Z" // ISO 8601 저장 시각
}
```

### 4.4 읽기/쓰기 유틸리티

| 함수 | 역할 |
|------|------|
| `writeStoredData(key, data)` | data + timestamp 래핑 → `JSON.stringify` → `localStorage.setItem` |
| `readStoredData(key, normalize)` | `localStorage.getItem` → `JSON.parse` → `normalize()` 검증 → 실패 시 키 삭제 |

### 4.5 데이터 안전성

| 상황 | 처리 |
|------|------|
| JSON 파싱 실패 | 해당 키 삭제, 기본값 복원 |
| 정규화 검증 실패 | 해당 키 삭제, 기본값 복원 |
| 값 범위 초과 (음수 등) | 저장 거부, 토스트 알림 |

### 4.6 용량 제한

| 브라우저 | localStorage 제한 |
|---------|-------------------|
| Chrome | 5MB |
| Edge | 5MB |
| Firefox | 5MB |

현재 시스템 데이터 규모는 수 KB 수준으로 용량 제한에 영향 없습니다.

---

## 5. 인증 시스템

### 5.1 현재 구현 방식

| 항목 | 내용 |
|------|------|
| 인증 유형 | 클라이언트 사이드 (프로토타입) |
| 계정 저장 | `login.html` 내 JavaScript 하드코딩 |
| 세션 관리 | `sessionStorage.loggedInUser` |
| 비밀번호 저장 | 평문 (암호화 없음) |

### 5.2 계정 정보

```javascript
const USERS = {
  dongkuk1: { password: '1234', name: '김철호 과장' },
  dongkuk2: { password: '1234', name: '박영수 대리' }
};
```

### 5.3 인증 흐름

```
login.html 접속
 │
 ├─ sessionStorage.loggedInUser 존재? → Yes → index.html 리다이렉트
 │
 └─ No → 로그인 폼 표시
      │
      ├─ ID/PW 입력 → USERS 객체 대조
      │   ├─ 일치 → sessionStorage에 { id, name } 저장 → index.html 이동
      │   └─ 불일치 → 오류 표시 + shake 애니메이션
      │
      └─ index.html 접속 시 (인증 가드)
          └─ sessionStorage 확인 → 없으면 login.html로 리다이렉트
```

### 5.4 보안 한계 및 향후 과제

| 한계 | 위험도 | 향후 대응 |
|------|--------|----------|
| 평문 비밀번호 | 높음 | 서버 사이드 인증 전환 |
| 클라이언트 인증 우회 가능 | 높음 | JWT/세션 토큰 기반 인증 |
| 소스코드에 계정 노출 | 중간 | DB 기반 사용자 관리 |
| CSRF/XSS 미대응 | 중간 | 서버 사이드 보안 헤더 추가 |

---

## 6. 배포 인프라 — Vercel

### 6.1 배포 구성

| 항목 | 내용 |
|------|------|
| 플랫폼 | Vercel |
| 배포 방식 | GitHub 연동 자동 배포 |
| 트리거 | `main` 브랜치 push |
| 빌드 과정 | 없음 (정적 파일 직접 서빙) |
| 배포 URL | `https://raw-material.vercel.app` |
| 배포 시간 | 수 초 이내 |

### 6.2 배포 파이프라인

```
개발자 PC
   │
   ├─ git add / commit
   │
   └─ git push origin main
         │
         ▼
   GitHub (donseok/raw-material)
         │
         ├─ Webhook → Vercel 자동 감지
         │
         ▼
   Vercel
         │
         ├─ 정적 파일 배포
         ├─ CDN 엣지 배포
         └─ HTTPS 인증서 자동 적용
```

### 6.3 롤백 방법

| 방법 | 절차 |
|------|------|
| Vercel 대시보드 | 이전 배포 선택 → Promote to Production |
| Git revert | `git revert HEAD && git push` |

---

## 7. 소스 관리 — Git / GitHub

### 7.1 저장소 정보

| 항목 | 내용 |
|------|------|
| 호스팅 | GitHub |
| 저장소 | `donseok/raw-material` |
| 기본 브랜치 | `main` |
| 브랜치 전략 | 단일 브랜치 (프로토타입) |

### 7.2 프로젝트 파일 구조

```
raw-material/
├── login.html                # 로그인 페이지
├── index.html                # 대시보드 메인 (SPA)
├── css/
│   ├── variables.css         # 디자인 토큰
│   ├── layout.css            # 레이아웃, 반응형, 인쇄
│   └── components.css        # UI 컴포넌트
├── js/
│   ├── utils.js              # 공통 유틸리티
│   ├── data.js               # 데이터 정의, 기본값
│   ├── plan.js               # 수급계획 모듈
│   ├── alloc.js              # 공장배분 모듈
│   ├── order.js              # 발주관리 모듈
│   ├── supplier.js           # 거래처관리 모듈
│   ├── import.js             # 수입계약 모듈
│   ├── inventory.js          # 재고현황 모듈
│   ├── stats.js              # 구매실적 모듈
│   ├── export-doc.js         # DOCX 내보내기
│   └── app.js                # 초기화, 탭 제어
├── docs/                     # 문서
├── CLAUDE.md                 # Claude Code 가이드
└── README.md                 # 프로젝트 설명
```

---

## 8. 런타임 환경 — 브라우저

### 8.1 지원 브라우저

| 브라우저 | 최소 버전 | 권장 | 비고 |
|---------|----------|------|------|
| Chrome | 80+ | 최신 | 주 개발/테스트 대상 |
| Edge (Chromium) | 80+ | 최신 | Chrome과 동일 엔진 |
| Firefox | 78+ | - | 호환 가능 |
| Safari | 14+ | - | 호환 가능 |
| IE | - | - | 미지원 (ES6+ 사용) |

### 8.2 필수 브라우저 API

| API | 용도 | 호환성 |
|-----|------|--------|
| `localStorage` | 업무 데이터 저장 | 모든 최신 브라우저 |
| `sessionStorage` | 세션 관리 | 모든 최신 브라우저 |
| `JSON.parse/stringify` | 데이터 직렬화 | 모든 최신 브라우저 |
| `URL.createObjectURL` | CSV 파일 다운로드 | 모든 최신 브라우저 |
| `Blob` | CSV 파일 생성 | 모든 최신 브라우저 |
| `Canvas 2D` | Chart.js 렌더링 | 모든 최신 브라우저 |
| `ClipboardData` | 엑셀 붙여넣기 | Chrome, Edge |

### 8.3 외부 네트워크 의존성

| 리소스 | URL | 필요 시점 |
|--------|-----|----------|
| Chart.js 4.4.1 | `cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js` | 페이지 로드 |
| html2canvas 1.4.1 | `cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` | 페이지 로드 |
| FileSaver.js 2.0.5 | `cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js` | 페이지 로드 |
| docx 9.5.1 | `cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js` | 페이지 로드 |

> **오프라인 모드**: CDN에 접근 불가 시 차트 미표시 및 DOC 저장 불가. 나머지 기능은 정상 동작합니다.

---

## 9. 성능 특성

### 9.1 로딩 성능

| 항목 | 크기 (대략) |
|------|------------|
| HTML (login + index) | ~40KB |
| CSS (3 파일) | ~8KB |
| JavaScript (11 파일) | ~32KB |
| Chart.js (CDN, gzip) | ~70KB |
| html2canvas (CDN, gzip) | ~40KB |
| docx (CDN, gzip) | ~180KB |
| FileSaver.js (CDN, gzip) | ~3KB |
| **총 전송량** | **~373KB** |

### 9.2 런타임 성능 고려사항

| 항목 | 구현 |
|------|------|
| 차트 메모리 관리 | `destroyChart()` — 탭 전환 시 기존 인스턴스 파괴 |
| 차트 지연 렌더링 | `setTimeout(50ms)` — DOM 렌더 완료 후 차트 생성 |
| 데이터 깊은 복사 | `JSON.parse(JSON.stringify())` — 기본값 오염 방지 |
| DOM 일괄 갱신 | `innerHTML` 일괄 교체 — 개별 DOM 조작 최소화 |

---

## 10. 향후 확장 시 기술 검토 사항

| 영역 | 현재 | 향후 고려 |
|------|------|----------|
| 인증 | 클라이언트 하드코딩 | 서버 사이드 인증 (JWT, OAuth) |
| 데이터 저장 | localStorage (브라우저) | REST API + DB (PostgreSQL 등) |
| 모듈 시스템 | `<script>` 순차 로딩 | ES Modules 또는 번들러 (Vite) |
| 상태 관리 | 전역 변수 | 상태 관리 라이브러리 |
| 프레임워크 | Vanilla JS | React, Vue, Svelte 등 |
| 실시간 동기화 | 없음 | WebSocket, Server-Sent Events |
| 검색/필터 | 없음 | 클라이언트 사이드 필터링 → 서버 검색 |
| 테스트 | 없음 | Jest, Playwright |
