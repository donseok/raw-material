# 운영자 매뉴얼

## 철스크랩 수급 계획 및 구매 관리 시스템

**동국제강 주식회사 원료기획팀**
**시스템 버전**: 1.0
**최종 수정일**: 2026년 3월

---

## 1. 시스템 구성

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| 프론트엔드 | HTML5 / CSS3 / JavaScript (ES6+) |
| 차트 | Chart.js 4.4.1 (CDN) |
| 문서 내보내기 | html2canvas 1.4.1 + docx 9.5.1 + FileSaver.js 2.0.5 (CDN) |
| 데이터 저장 | 브라우저 localStorage / sessionStorage |
| 배포 | Vercel (GitHub 연동 자동 배포) |
| 소스 관리 | GitHub (`donseok/raw-material`) |

### 1.2 파일 구조

````
raw-material/
├── login.html              # 로그인 페이지
├── index.html              # 대시보드 메인 페이지
├── css/
│   ├── variables.css       # 디자인 토큰 (색상, 그림자)
│   ├── layout.css          # 레이아웃, 반응형, 인쇄
│   └── components.css      # UI 컴포넌트 스타일
├── js/
│   ├── utils.js            # 공통 유틸리티
│   ├── data.js             # 데이터 정의 및 기본값
│   ├── plan.js             # 수급계획 모듈
│   ├── alloc.js            # 공장배분 모듈
│   ├── order.js            # 발주관리 모듈
│   ├── supplier.js         # 거래처관리 모듈
│   ├── import.js           # 수입계약 모듈
│   ├── inventory.js        # 재고현황 모듈
│   ├── stats.js            # 구매실적 모듈
│   ├── export-doc.js       # DOCX 내보내기 모듈
│   └── app.js              # 초기화 및 탭 제어
├── assets/                 # 정적 자원 (향후 확장)
└── docs/                   # 문서
```

### 1.3 스크립트 의존성 순서

`index.html`에서 아래 순서로 로드되며, 순서 변경 시 오류가 발생합니다.

```
utils.js → data.js → plan.js → alloc.js → order.js →
supplier.js → import.js → inventory.js → stats.js → export-doc.js → app.js
```

---

## 2. 배포 관리

### 2.1 Vercel 자동 배포

- GitHub `main` 브랜치에 push하면 Vercel이 자동으로 감지하여 배포합니다.
- 빌드 과정이 없는 정적 사이트이므로 배포 시간은 수 초 내 완료됩니다.
- 배포 URL: `https://raw-material.vercel.app`

### 2.2 배포 절차

```bash
# 1. 코드 수정
# 2. 변경 사항 커밋
git add .
git commit -m "변경 내용 설명"

# 3. 원격 저장소에 push (자동 배포 트리거)
git push origin main
```

### 2.3 배포 롤백

- Vercel 대시보드(`vercel.com`)에서 이전 배포 버전으로 롤백 가능합니다.
- 또는 Git에서 이전 커밋으로 revert 후 push합니다.

### 2.4 로컬 테스트

```bash
# 방법 1: 정적 서버
npx serve .
# http://localhost:3000/login.html

# 방법 2: Python 서버
python3 -m http.server 8000
# http://localhost:8000/login.html
```

---

## 3. 계정 관리

### 3.1 현재 계정 구조

계정 정보는 `login.html` 파일 내 JavaScript에 하드코딩되어 있습니다.

```javascript
const USERS = {
  dongkuk1: { password: '1234', name: '김철호 과장' },
  dongkuk2: { password: '1234', name: '박영수 대리' }
};
```

### 3.2 계정 추가/수정 방법

1. `login.html` 파일을 엽니다.
2. `USERS` 객체에 새 계정을 추가합니다.

```javascript
const USERS = {
  dongkuk1: { password: '1234', name: '김철호 과장' },
  dongkuk2: { password: '1234', name: '박영수 대리' },
  dongkuk3: { password: 'new_password', name: '이영희 사원' }  // 추가
};
```

3. 저장 후 배포합니다.

### 3.3 비밀번호 변경

- `USERS` 객체에서 해당 계정의 `password` 값을 수정합니다.
- 변경 즉시 다음 로그인부터 적용됩니다.

### 3.4 인증 방식

| 항목 | 방식 |
|------|------|
| 인증 저장소 | sessionStorage (`loggedInUser` 키) |
| 세션 유지 | 브라우저 탭이 열려 있는 동안 |
| 세션 종료 | 로그아웃 버튼 클릭 또는 모든 탭 닫기 |
| 보안 수준 | 프로토타입 수준 (클라이언트 사이드 인증) |

---

## 4. 데이터 관리

### 4.1 localStorage 저장 키

| 키 | 저장 데이터 | 모듈 |
|----|------------|------|
| `planData` | 수급계획 월별 데이터 | plan.js |
| `allocData` | 공장배분 데이터 | alloc.js |
| `ordersData` | 발주 목록 | order.js |
| `suppliersData` | 거래처 목록 | supplier.js |
| `importsData` | 수입계약 목록 | import.js |

모든 데이터는 `{ data: [...], timestamp: "ISO날짜" }` 형태로 저장됩니다.

### 4.2 데이터 초기화 방법

#### 특정 데이터만 초기화
- 수급계획: 수급계획 탭의 **초기화** 버튼
- 공장배분: 공장배분 탭의 **초기화** 버튼

#### 전체 데이터 초기화
브라우저 개발자 도구(F12) 콘솔에서 실행:
```javascript
// 전체 앱 데이터 초기화
Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
location.reload();
```

#### 특정 사용자의 데이터 초기화 안내
- 사용자에게 브라우저 설정 > 사이트 데이터 삭제를 안내합니다.
- 또는 해당 PC에서 F12 > Application > Local Storage에서 직접 삭제합니다.

### 4.3 기본 데이터 수정

기본 데이터(초기화 시 복원되는 값)는 `js/data.js`에 정의되어 있습니다.

- `defaultPlanData` — 수급계획 기본값 (12개월)
- `defaultAllocData` — 공장배분 기본값
- `defaultOrders` — 발주 기본 목록
- `defaultSuppliers` — 거래처 기본 목록
- `defaultImports` — 수입계약 기본 목록
- `inventory` — 재고 데이터 (고정, 편집 불가)
- `statsData` — 구매실적 데이터 (고정, 편집 불가)

### 4.4 데이터 검증 체계

각 모듈은 `normalize*()` 함수를 통해 입력값을 검증합니다.

| 모듈 | 검증 함수 | 검증 내용 |
|------|----------|----------|
| 수급계획 | `normalizePlanRow()` | plan/dom/imp ≥ 0 필수, actual은 null 허용 |
| 공장배분 | `normalizeAllocRow()` | ic/ia/pc/pa ≥ 0 필수 |
| 발주 | `normalizeOrder()` | 필수필드 비어있지 않음, qty/price ≥ 0, 공장은 인천/포항만 허용 |
| 거래처 | `normalizeSupplier()` | 필수필드 비어있지 않음, cap/ytd/rate ≥ 0, rate ≤ 100 |
| 수입계약 | `normalizeImportContract()` | 필수필드 비어있지 않음, qty/cfr/fx ≥ 0, 유효한 상태값 |

localStorage에서 데이터를 불러올 때 검증에 실패하면 해당 키를 삭제하고 기본값으로 복원됩니다.

---

## 5. 디자인 시스템

### 5.1 색상 체계

`css/variables.css`에서 관리하며, 모든 색상은 CSS 커스텀 프로퍼티로 참조합니다.

| 용도 | 변수명 | 색상 |
|------|--------|------|
| 기본(남색) | `--primary` | #1a237e |
| 강조(주황) | `--accent` | #ff8f00 |
| 성공(초록) | `--success` | #2e7d32 |
| 경고(노랑) | `--warning` | #f57f17 |
| 위험(빨강) | `--danger` | #c62828 |
| 배경 | `--bg` | #f0f2f5 |

### 5.2 상태 표현 규칙

| 상태 | 배지 클래스 | 색상 |
|------|-----------|------|
| 완료/달성/적정/도착 | `badge-green` | 초록 |
| 진행/운송중 | `badge-blue` | 파랑 |
| 미달/과잉/선적 | `badge-orange` | 주황 |
| 부족 | `badge-red` | 빨강 |
| 대기/예정/계약 | `badge-gray` | 회색 |

---

## 6. 모듈 확장 가이드

### 6.1 새 탭 추가 절차

1. **JS 모듈 생성** (`js/새모듈.js`)
   - `normalize*()` — 데이터 검증/정규화
   - `load*FromStorage()` — localStorage 복원
   - `save*Data()` — localStorage 저장
   - `render*()` — 테이블/KPI 렌더링
   - `render*Chart()` — 차트 렌더링
   - `init*()` — 초기화 진입점
   - `submit*()` — 모달 폼 제출

2. **데이터 정의** (`js/data.js`)
   - `STORAGE_KEYS`에 키 추가
   - `default*Data` 기본값 정의
   - `let` 전역 변수 선언

3. **HTML 추가** (`index.html`)
   - 탭 버튼: `<button class="tab-btn" data-tab="키">탭명</button>`
   - 콘텐츠: `<div class="tab-content" id="tab-키">...</div>`
   - 모달 (필요 시)
   - script 태그 추가 (`app.js` 앞에)

4. **초기화 연결** (`js/app.js`)
   - `renderCharts()`에 차트 라우팅 추가
   - 초기화 블록에 `load*FromStorage()` + `init*()` 호출 추가

---

## 7. 장애 대응

### 7.1 화면이 표시되지 않는 경우

| 증상 | 원인 | 조치 |
|------|------|------|
| 로그인 화면만 반복 | 세션 만료 | 재로그인 |
| 빈 화면 | JS 파일 로딩 오류 | F12 > Console에서 오류 확인 |
| 차트 미표시 | CDN 접속 불가 | 인터넷 연결 확인 |
| DOC 저장 실패 | CDN 라이브러리 미로딩 | 인터넷 연결 확인, F12 콘솔 오류 확인 |
| 데이터 미표시 | localStorage 손상 | 4.2절 참조하여 데이터 초기화 |

### 7.2 배포 후 변경이 반영되지 않는 경우

1. Vercel 대시보드에서 최신 배포 상태를 확인합니다.
2. 브라우저 캐시를 강제 새로고침합니다 (Ctrl+Shift+R).
3. Vercel 대시보드에서 수동 재배포(Redeploy)를 실행합니다.

### 7.3 데이터 손상 시

localStorage 데이터가 손상되면 시스템이 자동으로 감지하여 해당 키를 삭제하고 기본값으로 복원합니다. 수동 복구가 필요한 경우:

```javascript
// F12 콘솔에서 특정 데이터 확인
JSON.parse(localStorage.getItem('planData'));

// 특정 데이터만 삭제
localStorage.removeItem('ordersData');
location.reload();
```

---

## 8. 보안 유의사항

- 현재 인증은 클라이언트 사이드(브라우저)에서만 처리됩니다.
- 비밀번호가 소스 코드에 평문으로 포함되어 있으므로, 운영 전환 시 반드시 서버 사이드 인증으로 변경해야 합니다.
- localStorage 데이터는 같은 PC의 같은 브라우저를 사용하는 모든 사용자가 접근할 수 있습니다.
- 민감한 업무 데이터를 입력하는 경우 공용 PC 사용을 지양하세요.
