import { NextRequest, NextResponse } from "next/server";

interface NaverLocalItem {
  title: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://openapi.naver.com/v1/search/local.json");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "5");

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "네이버 API 요청 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const results = (data.items || []).map((item: NaverLocalItem) => ({
      name: item.title.replace(/<[^>]*>/g, ""),
      address: item.roadAddress || item.address,
      lat: (parseInt(item.mapy) / 10000000).toString(),
      lng: (parseInt(item.mapx) / 10000000).toString(),
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
