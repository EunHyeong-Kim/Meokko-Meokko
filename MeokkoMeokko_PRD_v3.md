# [머꼬머꼬] 제품 요구사항 정의서 (PRD) v3

> v3 업데이트 일자: 2026-02-20
> v2 대비 변경사항: 반경 500m + 전체 키워드 검색 전환, 차단(다시 보지 않기) 기능, 방문 기록(리뷰) 기능, 공유 기능, 디자인 전면 개편(메인 컬러/폰트/배경/카드 통일), 위치 미설정 시 자동 리다이렉트, 미들웨어 API 경로 제외

---

## 1. 프로젝트 개요

- **프로젝트명**: 머꼬머꼬 (Meokko Meokko)
- **목표**: 사용자의 현재 위치 또는 검색된 주소 **반경 500m** 내의 맛집을 6가지 감정/맛 카테고리로 큐레이션하여 추천하는 웹 서비스
- **플랫폼**: 웹 애플리케이션 (Web) - 데스크탑 및 모바일 반응형 지원
- **핵심 타겟**: 점심 메뉴 결정 장애를 겪는 직장인, 데이트 코스를 찾는 연인, 다이어터

---

## 2. 기술 스택 (Tech Stack)

| 구분 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend/DB | Supabase (Auth, Postgres Database) |
| 맛집 검색 API | **Kakao Local Search API** (좌표 기반 반경 500m 검색) |
| 위치 검색 API | Naver Open API (지역 검색 - 지오코딩용) |
| 인증 | Supabase Auth (카카오 로그인, 이메일 로그인) |

### API 키 구성 (.env.local)

| 키 | 용도 | 출처 |
|----|------|------|
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 지도 SDK (현재 미사용) | 카카오 앱 |
| `KAKAO_REST_API_KEY` | 맛집 좌표 기반 검색 | 카카오 일반 앱 (2024.12 이전 생성 앱 필요) |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 위치 검색 (지오코딩) | 네이버 Open API |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 연동 | Supabase 프로젝트 |

### 카카오 앱 주의사항
- **비즈 앱**: 지도/로컬 API 사용 시 유료 추가 기능 신청 필요
- **일반 앱**: 2024.12 정책 변경 이전에 생성된 앱만 무료 사용 가능
- 일일 무료 쿼터: 100,000건

---

## 3. 사용자 흐름 (User Flow)

```
로그인 → 위치 설정 → 카테고리 선택 → 맛집 결과 리스트
                                          ├→ 즐겨찾기
                                          ├→ 차단 (다시 보지 않기)
                                          ├→ 공유
                                          └→ 내 기록 (리뷰)
```

1. **로그인 (Login)**: 카카오 로그인 또는 이메일/비밀번호 로그인
2. **위치 설정 (Location)**: [현재 위치 찾기] 또는 [장소 검색], 위치 미설정 시 카테고리 페이지에서 자동 리다이렉트
3. **카테고리 선택 (Category)**: "오늘 뭐 땡겨?" → 6개 테마 중 택 1, 하단에 "위치 다시 설정하기" 버튼
4. **결과 리스트 (Results)**: 반경 500m 내 맛집 리스트 (10개씩 페이지네이션, 최대 5페이지 50개)
5. **즐겨찾기**: 하트 아이콘으로 저장/해제
6. **차단**: 금지 아이콘으로 "다시 보지 않기" → 검색 결과에서 필터링
7. **공유**: 공유 아이콘 → 모바일 네이티브 공유 / PC URL 복사
8. **내 기록**: 방문한 맛집에 별점, 먹은 메뉴, 한마디 기록

---

## 4. 핵심 검색 아키텍처

### 검색 흐름

```
사용자 위치(좌표) + 카테고리 선택
    ↓
카테고리 전체 키워드 (11~15개) 순차 검색
    ↓
각 키워드에 "맛집" 붙여서 카카오 API 호출
  예: "마라탕 맛집" + x=127.03 + y=37.50 + radius=500
    ↓
전체 결과 → 중복 제거 → 차단 목록 필터링 → 거리순 정렬
    ↓
10개씩 페이지네이션 (최대 5페이지 50개)
```

### 카카오 API 호출 형식

```
GET https://dapi.kakao.com/v2/local/search/keyword.json
  ?query={키워드} 맛집
  &x={경도}
  &y={위도}
  &radius=500
  &size=15
  &sort=accuracy
Headers: Authorization: KakaoAK {REST_API_KEY}
```

### v2 대비 변경
- 반경: 1000m → **500m** (더 가까운 맛집만)
- 키워드: 랜덤 3개 → **전체 키워드** (매번 동일한 결과)
- API 호출: 3회 → 11~15회 (일일 쿼터 내 충분)

---

## 5. 카테고리 정의 (6 Themes)

카테고리 선택 화면에서는 **이모지 + 타이틀만** 표시 (음식명 미표시).
카드 배경: **흰색 통일**, hover 시 그림자 효과.

### 한국인은 밥심 (bapsim) - 15개 키워드
한식, 백반, 솥밥, 한정식, 제육, 김치찌개, 된장찌개, 비빔밥, 불고기, 갈비, 쌈밥, 순두부, 보쌈, 정식, 돌솥밥

### 치팅 데이 (cheating) - 13개 키워드
햄버거, 피자, 파스타, 중식, 치킨, 탕수육, 짜장면, 짬뽕, 돈가츠, 스테이크, 족발, 곱창, 돈까스

### 스트레스 해소 (stress) - 12개 키워드
마라탕, 떡볶이, 불닭, 매운갈비찜, 닭발, 마라샹궈, 엽떡, 낙곱새, 매운라면, 쭈꾸미, 불막창, 핫치킨

### 뜨끈뜨끈 (hot) - 14개 키워드
국밥, 찌개, 칼국수, 우동, 전골, 설렁탕, 갈비탕, 삼계탕, 수제비, 감자탕, 부대찌개, 샤브샤브, 라멘, 뼈해장국

### 가볍고 간단하게 (fresh) - 11개 키워드
포케, 샐러드, 샌드위치, 그릭요거트, 베이글, 키토김밥, 닭가슴살, 월남쌈, 오트밀, 토스트, 아사이볼

### 혈당 끌어 올려 (sugar) - 13개 키워드
카페, 베이커리, 케이크, 디저트, 탕후루, 아이스크림, 크로플, 마카롱, 도넛, 붕어빵, 호떡, 와플, 초콜릿

---

## 6. 화면별 상세 사양

### A. 로그인 페이지 (`/login`)
- 중앙 정렬 로고 (OngleipParkDahyeon 폰트)
- "카카오로 시작하기" 버튼 (#FEE500)
- 이메일/비밀번호 로그인 폼 + 회원가입 전환
- 배경: red-50 → rose-50 그라데이션

### B. 위치 설정 페이지 (`/location`)
- **현재 위치 찾기**: 브라우저 Geolocation API
- **장소 검색**: 네이버 지역 검색 API, 결과 흰색 박스로 표시
- 뒤로가기 버튼 포함
- 위치 미설정 시 카테고리 페이지에서 자동 리다이렉트

### C. 카테고리 선택 페이지 (`/category`)
- "오늘 뭐 땡겨?" 타이틀
- 2열 x 3행 그리드 (sm 이상 3열)
- 카드: **흰색 배경 통일** + hover 시 그림자
- 하단: "위치 다시 설정하기" 버튼

### D. 결과 페이지 (`/results`)
- 타이틀: 카테고리 이모지 + 라벨 (가운데 정렬)
- 부제: "반경 500m 내 {N}개의 맛집"
- 맛집 카드 (최대폭 `max-w-lg`, 가운데 정렬):
  - 매장명 + 거리(m)
  - 아이콘 행: 즐겨찾기(하트) + 공유(Share2) + 차단(Ban)
  - 주소 + 전화번호 (터치 시 전화 연결)
  - "상세 정보" 링크
- **페이지네이션**: 10개씩, 최대 5페이지, 현재 페이지 primary 강조
- 차단된 맛집은 자동 필터링

### E. 즐겨찾기 페이지 (`/favorites`)
- 저장된 맛집 리스트 + 공유 버튼 + 삭제 버튼
- 상세 정보 링크 + 저장 날짜
- 뒤로가기 버튼

### F. 차단 목록 페이지 (`/blocked`)
- 차단한 맛집 리스트
- "해제" 버튼으로 차단 해제
- 뒤로가기 버튼

### G. 내 기록 페이지 (`/reviews`)
- 방문 기록 리스트 (별점, 메뉴, 한마디, 날짜)
- "새 기록" 버튼 → 작성 폼:
  - 매장 선택 (즐겨찾기 목록에서)
  - 별점 1~5 (별 아이콘)
  - 먹은 메뉴 (텍스트)
  - 한마디 (텍스트)
- 삭제 버튼
- 동일 매장 재작성 시 업데이트

---

## 7. 공통 UI 컴포넌트

### Header
- 고정 상단 (`sticky top-0`), 흰색 배경
- 로고 (카테고리 페이지로 이동)
- 아이콘 네비게이션: 즐겨찾기(Heart) + 내 기록(BookOpen) + 차단 목록(Ban) + 로그아웃(LogOut)
- `showBack` prop: 하위 페이지에서 뒤로가기 화살표 표시

### 미들웨어
- `/api/*` 경로는 인증 체크에서 제외 (API 라우트 자체에서 인증 처리)
- 비인증 사용자 → `/login` 리다이렉트
- 인증된 사용자가 `/login` 접근 → `/location` 리다이렉트

---

## 8. 데이터베이스 스키마 (Supabase)

### profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users 참조 |
| nickname | text | 사용자 닉네임 |
| avatar_url | text | 프로필 사진 |
| created_at | timestamptz | 생성일 |

### restaurants
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint (PK) | 자동 증가 |
| name | text | 가게 이름 |
| category | text | bapsim/cheating/stress/hot/fresh/sugar |
| lat | float8 | 위도 |
| lng | float8 | 경도 |
| address | text | 주소 |
| image_url | text | 카카오맵 place_url 저장 |
| description | text | 카테고리 설명 |
| created_at | timestamptz | 생성일 |

### favorites
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint (PK) | 자동 증가 |
| user_id | uuid (FK) | profiles.id |
| restaurant_id | bigint (FK) | restaurants.id |
| created_at | timestamptz | 생성일 |
| | | UNIQUE(user_id, restaurant_id) |

### blocked_places
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint (PK) | 자동 증가 |
| user_id | uuid (FK) | profiles.id |
| restaurant_id | bigint (FK) | restaurants.id |
| created_at | timestamptz | 생성일 |
| | | UNIQUE(user_id, restaurant_id) |

### reviews
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint (PK) | 자동 증가 |
| restaurant_id | bigint (FK) | restaurants.id |
| user_id | uuid (FK) | profiles.id |
| rating | int | 1~5 |
| comment | text | 한마디 |
| menu | text | 먹은 메뉴 |
| created_at | timestamptz | 생성일 |

### RLS 정책

| 테이블 | 작업 | 정책 |
|--------|------|------|
| profiles | SELECT | 누구나 조회 가능 |
| profiles | UPDATE | 본인만 수정 가능 |
| restaurants | SELECT | 누구나 조회 가능 |
| restaurants | INSERT | 로그인한 유저 등록 가능 |
| favorites | SELECT | 본인 즐겨찾기만 조회 |
| favorites | INSERT | 로그인한 유저만 추가 |
| favorites | DELETE | 본인만 삭제 |
| blocked_places | SELECT | 본인 차단 목록만 조회 |
| blocked_places | INSERT | 로그인한 유저만 추가 |
| blocked_places | DELETE | 본인만 삭제 |
| reviews | SELECT | 누구나 조회 가능 |
| reviews | INSERT | 로그인한 유저만 작성 |
| reviews | UPDATE | 본인만 수정 |
| reviews | DELETE | 본인만 삭제 |

---

## 9. 디자인 가이드

| 항목 | 값 |
|------|-----|
| Primary Color | **#FF6B6B** (코랄 레드) |
| 배경 (전체 페이지) | `bg-gradient-to-b from-red-50 to-rose-50` |
| 카테고리 카드 배경 | **흰색 통일** (`bg-white`) |
| 타이틀 폰트 ("머꼬머꼬") | **OngleipParkDahyeon** |
| 본문 폰트 | **Pretendard** (100~900) |
| 자간 | `-0.03em` (기본보다 좁게) |
| 본문 굵기 | 타이틀(h1, h2)만 bold, 나머지 normal |
| 카카오 로그인 버튼 | #FEE500 |
| hover 색상 | `hover:bg-red-500` (primary보다 진하게) |
| 버튼 최소 높이 | 48px |
| 카드 최대 너비 | max-w-lg (가운데 정렬) |

---

## 10. 버전별 변경 이력

| 항목 | v1 | v2 | v3 |
|------|-----|-----|-----|
| 검색 엔진 | 네이버 텍스트 | 카카오 좌표 기반 | 카카오 좌표 기반 |
| 검색 반경 | 1km (텍스트 필터) | 1km | **500m** |
| 키워드 방식 | 전체 순차 | 랜덤 3개 | **전체 키워드** |
| 결과 표시 | 15개 고정 | 최대 45개 | **최대 50개 (5페이지)** |
| 메인 컬러 | #FF6B00 (주황) | #FF6B00 (주황) | **#FF6B6B (코랄 레드)** |
| 배경 | 흰색/회색 | 흰색/회색 | **red-50 → rose-50 그라데이션** |
| 카테고리 카드 | 카테고리별 배경색 | 카테고리별 배경색 | **흰색 통일** |
| 본문 폰트 | Pretendard | Pretendard | **Pretendard (자간 -0.03em)** |
| 타이틀 폰트 | Pretendard | Pretendard | **OngleipParkDahyeon** |
| 지도 | 네이버 지도 | 제거 | 제거 |
| 차단 기능 | 없음 | 없음 | **다시 보지 않기 (Ban 아이콘)** |
| 공유 기능 | 없음 | 없음 | **네이티브 공유 / URL 복사** |
| 리뷰/기록 | 없음 | 없음 | **별점 + 메뉴 + 한마디** |
| 위치 미설정 | 카테고리 표시 후 에러 | 카테고리 표시 후 에러 | **자동 위치설정 리다이렉트** |
| 미들웨어 | API 포함 인증 | API 포함 인증 | **API 경로 제외** |
| Header 아이콘 | 즐겨찾기 + 로그아웃 | 즐겨찾기 + 차단 + 로그아웃 | **즐겨찾기 + 내 기록 + 차단 + 로그아웃** |
