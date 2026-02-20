[머꼬머꼬] 제품 요구사항 정의서 (PRD)

1. 프로젝트 개요

프로젝트명: 머꼬머꼬 (Meokko Meokko)

목표: 사용자의 현재 위치 또는 검색된 주소 반경 1km 내의 맛집을 6가지 감정/맛 카테고리로 큐레이션하여 추천하는 웹 서비스.

플랫폼: 웹 애플리케이션 (Web) - 데스크탑 및 모바일 반응형 지원.

핵심 타겟: 점심 메뉴 결정 장애를 겪는 직장인, 데이트 코스를 찾는 연인, 다이어터.

2. 기술 스택 (Tech Stack)

Frontend: React (Vite), Tailwind CSS (스타일링), Lucide React (아이콘)

Backend/DB: Supabase (Auth, Postgres Database)

Map API: Naver Maps API (Web Dynamic Map)

State Management: React Context API 또는 Zustand (선택 사항)

3. 사용자 흐름 (User Flow)

웹 페이지 접속 시 아래 순서대로 화면이 전환됩니다.

로그인 (Login): 서비스 진입점. (Supabase Auth / 소셜 로그인)

위치 설정 (Location): "어디서 드실 건가요?" -> [현재 위치 찾기] 또는 [주소 검색]

카테고리 선택 (Category): "오늘 뭐 땡겨?" -> 6개 테마 중 택 1

결과 리스트 (Results): 지도(Map)와 리스트(List)를 동시에 보여줌.

상세 정보 (Detail): 가게 상세 정보, 리뷰 작성, 즐겨찾기, 공유하기.

4. 상세 기능 요구사항 (Functional Specs)

4.1. 카테고리 정의 (6 Themes)

사용자가 선택하는 6가지 버튼은 내부적으로 아래 코드로 매핑됩니다. (식사부터 디저트까지 완벽한 밸런스)

🍚 오늘은 밥심 (bapsim): 든든한 한식, 백반, 고기 반찬, 솥밥 등 (Rice)

🍕 치팅 데이이 (cheating): 햄버거, 피자, 파스타, 튀김, 중식 요리 (Greasy/High Calorie)

🔥 스트레스 해소 (stress): 마라탕, 매운 떡볶이, 불닭, 매운 갈비찜 (Spicy)

🥘 뜨끈뜨끈 (hot): 국밥, 찌개, 전골, 탕 요리, 면 요리(칼국수, 우동 등) 포함 (Soup/Stew/Noodles)

🥗 가볍게 간단하게게 (fresh): 포케, 샐러드, 샌드위치, 그릭요거트 (Light/Diet)

🍰 혈당 끌어 올려 (sugar): 카페, 베이커리, 케이크, 탕후루, 아이스크림 (Dessert/Cafe)

4.2. 주요 화면 구성

A. 로그인 페이지

중앙 정렬된 로고와 "카카오/구글로 시작하기" 버튼 배치.

배경: 식욕을 돋우는 연한 주황색/아이보리 톤.

B. 위치 설정 페이지

현재 위치 버튼: 브라우저 Geolocation API 활용.

주소 검색창: 검색 시 도로명 주소 API 연동 -> 선택 시 위도/경도 변환하여 저장.

C. 결과 페이지 (핵심 UI)

레이아웃 (반응형):

Desktop: 화면을 반으로 나누어 [좌측: 리스트 / 우측: 지도] 배치.

Mobile: [상단: 지도 / 하단: 리스트] 배치 (리스트는 바텀 시트 형태 권장).

지도 기능 (Naver Map):

중심점 기준 반경 1km 원(Circle) 표시.

선택한 카테고리에 해당하는 식당 위치에 마커 표시.

리스트 기능:

식당 이름, 대표 메뉴, 별점, 거리(m) 표시.

카테고리별로 리스트 아이템의 포인트 컬러를 다르게 적용 (예: 프레시는 초록, 혈당 올려는 핑크).

D. 상세 및 인터랙션

정보: 상호명, 주소, 영업시간, 메뉴.

즐겨찾기: 하트 아이콘 클릭 시 favorites 테이블에 저장 (로그인 필수).

리뷰: 별점(1~5)과 텍스트 입력 후 저장.

공유: 현재 페이지 URL 복사 또는 카카오톡 공유하기.

5. 데이터베이스 스키마 (Supabase Schema)

Table: profiles (사용자 정보)

id (uuid, PK): auth.users와 연결

nickname (text): 사용자 닉네임

avatar_url (text): 프로필 사진

Table: restaurants (맛집 데이터)

id (int8, PK)

name (text): 가게 이름

category (text): 'bapsim', 'cheating', 'stress', 'hot', 'fresh', 'sugar'

Note: 추후 데이터 확장 시 category 컬럼에 check constraint 추가 필요

lat (float8): 위도

lng (float8): 경도

address (text): 주소

image_url (text): 대표 이미지 URL (옵션)

description (text): 간단 설명

Table: reviews (리뷰)

id (int8, PK)

restaurant_id (int8, FK): restaurants.id 참조

user_id (uuid, FK): profiles.id 참조

rating (int): 1~5

comment (text): 리뷰 내용

created_at (timestamp)

Table: favorites (즐겨찾기)

id (int8, PK)

user_id (uuid, FK)

restaurant_id (int8, FK)

6. 디자인 가이드 (Design System)

Primary Color: Orange (#FF6B00 - 메인/식욕)

Category Colors:

Fresh: Green (#4ADE80)

Sugar: Pink (#F472B6) - 디저트용 포인트 컬러

Secondary Color: Yellow (#FFD600 - 포인트)

Font: Pretendard (가독성 좋은 웹 폰트)

Spacing: 모바일 터치를 고려하여 버튼 높이는 최소 48px 이상.