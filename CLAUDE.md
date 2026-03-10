# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

철스크랩(steel scrap) 수급 계획 및 구매 관리 시스템 프로토타입 (동국제강).
순수 HTML/CSS/JavaScript로 구성된 빌드 도구 없는 정적 프로젝트. 브라우저에서 `index.html`을 직접 열면 실행됨.
차트는 Chart.js CDN을 사용하므로 인터넷 연결 필요.

## Running

```bash
open index.html        # macOS
# 또는 로컬 서버:
npx serve .            # http://localhost:3000
python3 -m http.server # http://localhost:8000
```

빌드, 린트, 테스트 도구는 없음.

## Architecture

7개 탭(수급계획, 공장배분, 발주관리, 거래처관리, 수입계약, 재고현황, 구매실적)으로 구성된 SPA 형태의 대시보드. 모든 JS는 전역 스코프에서 동작하며 모듈 시스템 없음.

**스크립트 로드 순서가 중요함** (`index.html` 하단):
`utils.js` → `data.js` → 각 탭 모듈(plan/alloc/order/supplier/import/inventory/stats) → `app.js`

- **`js/utils.js`**: 공통 함수(`fmt`, `showModal`, `showToast`, `parseNum`, `startCellEdit`) 및 차트 인스턴스 관리(`chartInstances`, `destroyChart`)
- **`js/data.js`**: 모든 데이터 정의. `planData`/`allocData`는 mutable 전역 변수, 나머지(`orders`, `suppliers`, `imports`, `inventory`, `statsData`)는 하드코딩 배열
- **`js/app.js`**: 탭 네비게이션, 붙여넣기(Ctrl+V) 핸들러, 모든 모듈 초기화 호출

### CSS 구조
`css/variables.css`(디자인 토큰) → `css/layout.css`(헤더/탭/그리드/반응형) → `css/components.css`(KPI카드/테이블/버튼/모달 등)

### 데이터 흐름
- **편집 가능**: `planData`, `allocData` — 셀 더블클릭 편집, 엑셀 붙여넣기 지원, `localStorage`에 자동 저장
- **읽기 전용**: 나머지 데이터는 코드 내 고정 배열, 새로고침 시 초기화
- KPI, 달성률, 차트는 데이터에서 매번 재계산

### 새 탭 추가 패턴
1. `js/`에 모듈 파일 생성 (init 함수 + render/chart 함수)
2. `index.html`에 탭 버튼 + `tab-content` div 추가
3. `js/app.js`의 `renderCharts()`에 라우팅 추가, 초기화 섹션에 init 호출 추가
4. `index.html` 하단 script 태그에 새 파일 추가 (app.js 앞에)

## Key Conventions

- 한국어 UI/데이터, 코드 주석/변수명은 영어
- CSS 색상은 반드시 `variables.css`의 커스텀 프로퍼티 사용
- 차트는 탭 전환 시 `destroyChart()` 후 재생성하는 패턴
- 모달: `showModal(id)`/`hideModal(id)`로 열고 닫음
