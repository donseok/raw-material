# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

동국제강 철스크랩 수급 계획 및 구매 관리 시스템. 순수 HTML/CSS/JavaScript 정적 프로젝트 (빌드 도구/번들러 없음). Chart.js, html2canvas, docx, FileSaver.js를 CDN으로 사용 (인터넷 필요). Vercel에 배포됨 — `main` 브랜치 push 시 자동 배포.

## Running

```bash
open login.html          # macOS — 진입점은 login.html
npx serve .              # 또는 로컬 서버
python3 -m http.server
```

빌드, 린트, 테스트 도구 없음.

## Architecture

### 인증 흐름
`login.html` → 인증 성공 시 `sessionStorage`에 사용자 정보 저장 → `index.html`로 리다이렉트. `index.html`은 `<head>`에서 `sessionStorage` 체크 후 미인증 시 `login.html`로 리다이렉트. 로그아웃은 `sessionStorage` 클리어 후 `login.html`로 이동. 계정: `dongkuk1`/`1234`, `dongkuk2`/`1234`.

### 스크립트 로드 순서 (중요)
`index.html` 하단에서 순서대로 로드. 전역 스코프 공유 (ES Module 아님):

`utils.js` → `data.js` → 탭 모듈들(plan/alloc/order/supplier/import/inventory/stats) → `export-doc.js` → `app.js`

### 각 탭 모듈의 공통 패턴
모든 탭 모듈(`js/plan.js`, `js/order.js` 등)은 동일한 구조를 따름:
1. **`normalize*()` 함수** — 입력값을 검증하고 정규화 (예: `normalizeOrder()`, `normalizePlanRow()`)
2. **`load*FromStorage()` 함수** — `readStoredData()`로 localStorage에서 복원
3. **`save*Data()` 함수** — `writeStoredData()`로 localStorage에 저장
4. **`render*()` 함수** — DOM 테이블/KPI 렌더링
5. **`render*Chart()` 함수** — Chart.js 차트 생성 (탭 전환 시 destroy→recreate)
6. **`init*()` 함수** — `app.js`에서 호출하는 진입점
7. **`submit*()` 함수** — 모달 폼 제출 (normalize → push → save → render → hideModal → toast)

### 데이터 저장/복원
`js/utils.js`의 `readStoredData(key, normalizeFn)`과 `writeStoredData(key, data)` 사용. localStorage 값은 `{ data, timestamp }` 형태로 저장. 읽기 시 normalize 함수로 검증 실패하면 해당 키를 삭제하고 기본값으로 폴백.

저장 키는 `js/data.js`의 `STORAGE_KEYS` 객체에 정의: `plan`, `alloc`, `orders`, `suppliers`, `imports`.

### CSS 구조
`css/variables.css`(디자인 토큰) → `css/layout.css`(헤더/탭/그리드/반응형) → `css/components.css`(컴포넌트)

## 새 탭/모듈 추가 패턴
1. `js/`에 모듈 파일 생성 — 위 공통 패턴(normalize, load, save, render, init, submit) 따름
2. `js/data.js`에 `STORAGE_KEYS`와 `default*Data` 추가, `let` 전역 변수 선언
3. `index.html`에 탭 버튼(`<button class="tab-btn" data-tab="...">`) + `tab-content` div 추가
4. `js/app.js`의 `renderCharts()`에 라우팅 추가, 초기화 블록에 `load*FromStorage()` + `init*()` 호출 추가
5. `index.html` script 태그에 새 파일 추가 (`app.js` 앞에)

## Key Conventions
- 한국어 UI/데이터, 코드 변수명/주석은 영어
- CSS 색상은 반드시 `css/variables.css`의 커스텀 프로퍼티 사용
- 숫자 포맷: `fmt(value, fallback)` — fallback 기본값 `'-'`, 숫자 입력 시 `'0'` 사용
- 입력값 검증: `parseNum()` → `isNonNegativeNumber()` → normalize 함수에서 조합
- 모달: `showModal(id)` / `hideModal(id)`, 폼 제출은 `submit*()` 함수
- 차트: 탭 전환 시 `destroyChart(id)` 후 재생성, `chartInstances` 객체로 관리
- `login.html`은 독립적 — CSS/JS 인라인 (외부 CSS는 `variables.css`만 참조)
- DOC 저장: `js/export-doc.js`의 `exportDashboardDoc()` — 각 탭을 순회하며 html2canvas로 스냅샷 캡처 → docx 라이브러리로 Word 문서 생성 → FileSaver.js로 다운로드. 탭 모듈 패턴과 다른 독립 유틸리티 모듈
