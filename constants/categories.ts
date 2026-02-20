import { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    code: "bapsim",
    label: "한국인은 밥심",
    description: "든든한 한식, 백반, 고기 반찬, 솥밥",
    color: "#FF6B6B",
    bgColor: "#FFF0F0",
    icon: "🍚",
  },
  {
    code: "cheating",
    label: "치팅 데이",
    description: "햄버거, 피자, 파스타, 튀김, 중식",
    color: "#FFD600",
    bgColor: "#FFFDE7",
    icon: "🍔",
  },
  {
    code: "stress",
    label: "스트레스 해소",
    description: "마라탕, 매운 떡볶이, 불닭, 매운 갈비찜",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: "🔥",
  },
  {
    code: "hot",
    label: "뜨끈뜨끈",
    description: "국밥, 찌개, 전골, 탕, 칼국수, 우동",
    color: "#F97316",
    bgColor: "#FFF7ED",
    icon: "♨️",
  },
  {
    code: "fresh",
    label: "가볍고 간단하게",
    description: "포케, 샐러드, 샌드위치, 그릭요거트",
    color: "#4ADE80",
    bgColor: "#F0FDF4",
    icon: "🥗",
  },
  {
    code: "sugar",
    label: "혈당 끌어 올려",
    description: "카페, 베이커리, 케이크, 탕후루, 아이스크림",
    color: "#F472B6",
    bgColor: "#FDF2F8",
    icon: "🍰",
  },
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  bapsim: [
    "한식", "백반", "솥밥", "한정식", "제육", "김치찌개",
    "된장찌개", "비빔밥", "불고기", "갈비", "쌈밥", "순두부",
    "보쌈", "정식", "돌솥밥",
  ],
  cheating: [
    "햄버거", "피자", "파스타", "중식", "치킨", "탕수육",
    "짜장면", "짬뽕", "돈가츠", "스테이크", "족발", "곱창", "돈까스",
  ],
  stress: [
    "마라탕", "떡볶이", "불닭", "매운갈비찜", "닭발", "마라샹궈",
    "엽떡", "낙곱새", "매운라면", "쭈꾸미", "불막창", "핫치킨",
  ],
  hot: [
    "국밥", "찌개", "칼국수", "우동", "전골", "설렁탕",
    "갈비탕", "삼계탕", "수제비", "감자탕", "부대찌개", "샤브샤브",
    "라멘", "뼈해장국",
  ],
  fresh: [
    "포케", "샐러드", "샌드위치", "그릭요거트", "베이글", "키토김밥",
    "닭가슴살", "월남쌈", "오트밀", "토스트", "아사이볼",
  ],
  sugar: [
    "카페", "베이커리", "케이크", "디저트", "탕후루", "아이스크림",
    "크로플", "마카롱", "도넛", "붕어빵", "호떡", "와플", "초콜릿",
  ],
};
