import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { name, category, lat, lng, address, description, place_url } = body;

  if (!name || !lat || !lng) {
    return NextResponse.json(
      { error: "필수 정보가 누락되었습니다." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("name", name)
    .eq("address", address)
    .maybeSingle();

  let restaurantId: number;

  if (existing) {
    restaurantId = existing.id;
  } else {
    const { data: newRestaurant, error: insertError } = await supabase
      .from("restaurants")
      .insert({
        name,
        category: category || "bapsim",
        lat,
        lng,
        address,
        description: description || "",
        image_url: place_url || "",
      })
      .select("id")
      .single();

    if (insertError || !newRestaurant) {
      console.error("식당 저장 오류:", insertError);
      return NextResponse.json(
        { error: `식당 저장에 실패했습니다: ${insertError?.message}` },
        { status: 500 }
      );
    }
    restaurantId = newRestaurant.id;
  }

  const { data: existingBlock, error: blockQueryError } = await supabase
    .from("blocked_places")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (blockQueryError) {
    console.error("차단 조회 오류:", blockQueryError);
    return NextResponse.json(
      { error: "차단 조회에 실패했습니다." },
      { status: 500 }
    );
  }

  if (existingBlock) {
    const { error: deleteError } = await supabase
      .from("blocked_places")
      .delete()
      .eq("id", existingBlock.id);
    if (deleteError) {
      console.error("차단 해제 오류:", deleteError);
      return NextResponse.json(
        { error: "차단 해제에 실패했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ blocked: false, restaurant_id: restaurantId });
  } else {
    const { error: insertError } = await supabase
      .from("blocked_places")
      .insert({ user_id: user.id, restaurant_id: restaurantId });
    if (insertError) {
      console.error("차단 저장 오류:", insertError);
      return NextResponse.json(
        { error: `차단 저장에 실패했습니다: ${insertError.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ blocked: true, restaurant_id: restaurantId });
  }
}

export async function GET() {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("blocked_places")
    .select("id, created_at, restaurants(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "차단 목록 조회 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ blocked: data || [] });
}
