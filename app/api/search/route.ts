import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_KEYWORDS } from "@/constants/categories";

interface KakaoDocument {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string;
  y: string;
  distance: string;
  place_url: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!category || !lat || !lng) {
    return NextResponse.json(
      { error: "category, lat, lng 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const allKeywords = CATEGORY_KEYWORDS[category];
  if (!allKeywords) {
    return NextResponse.json(
      { error: "유효하지 않은 카테고리입니다." },
      { status: 400 }
    );
  }

  const kakaoApiKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoApiKey) {
    return NextResponse.json(
      { error: "카카오 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const keywords = allKeywords;

  try {
    const allResults: {
      id: string;
      name: string;
      category_detail: string;
      address: string;
      phone: string;
      lat: number;
      lng: number;
      distance: number;
      place_url: string;
    }[] = [];
    const seenIds = new Set<string>();

    for (const keyword of keywords) {
      const url = new URL(
        "https://dapi.kakao.com/v2/local/search/keyword.json"
      );
      url.searchParams.set("query", `${keyword} 맛집`);
      url.searchParams.set("x", lng);
      url.searchParams.set("y", lat);
      url.searchParams.set("radius", "500");
      url.searchParams.set("size", "15");
      url.searchParams.set("sort", "accuracy");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `KakaoAK ${kakaoApiKey}`,
        },
      });

      if (!res.ok) continue;

      const data = await res.json();

      for (const item of (data.documents || []) as KakaoDocument[]) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);

        allResults.push({
          id: item.id,
          name: decodeHtmlEntities(item.place_name),
          category_detail: decodeHtmlEntities(item.category_name),
          address: decodeHtmlEntities(item.road_address_name || item.address_name),
          phone: item.phone,
          lat: parseFloat(item.y),
          lng: parseFloat(item.x),
          distance: parseInt(item.distance) || 0,
          place_url: item.place_url,
        });
      }
    }

    allResults.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("카카오 검색 오류:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
