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
  const { restaurant_id, name, address, category, lat, lng, place_url, rating, comment, menu } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "별점은 1~5 사이로 입력해 주세요." },
      { status: 400 }
    );
  }

  let resolvedRestaurantId = restaurant_id;

  if (!resolvedRestaurantId && name && address) {
    const { data: existing } = await supabase
      .from("restaurants")
      .select("id")
      .eq("name", name)
      .eq("address", address)
      .maybeSingle();

    if (existing) {
      resolvedRestaurantId = existing.id;
    } else {
      const { data: newR, error: insertErr } = await supabase
        .from("restaurants")
        .insert({
          name,
          category: category || "bapsim",
          lat: lat || 0,
          lng: lng || 0,
          address,
          image_url: place_url || "",
          description: "",
        })
        .select("id")
        .single();
      if (insertErr || !newR) {
        return NextResponse.json(
          { error: "식당 저장에 실패했습니다." },
          { status: 500 }
        );
      }
      resolvedRestaurantId = newR.id;
    }
  }

  if (!resolvedRestaurantId) {
    return NextResponse.json(
      { error: "식당 정보가 필요합니다." },
      { status: 400 }
    );
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", resolvedRestaurantId)
    .maybeSingle();

  if (existingReview) {
    const { error: updateErr } = await supabase
      .from("reviews")
      .update({ rating, comment: comment || "", menu: menu || "" })
      .eq("id", existingReview.id);
    if (updateErr) {
      return NextResponse.json(
        { error: "기록 수정에 실패했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, updated: true });
  } else {
    const { error: insertErr } = await supabase.from("reviews").insert({
      restaurant_id: resolvedRestaurantId,
      user_id: user.id,
      rating,
      comment: comment || "",
      menu: menu || "",
    });
    if (insertErr) {
      return NextResponse.json(
        { error: `기록 저장에 실패했습니다: ${insertErr.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, updated: false });
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
    .from("reviews")
    .select("id, rating, comment, menu, created_at, restaurants(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "기록 조회 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function DELETE(request: NextRequest) {
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

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { error: "리뷰 ID가 필요합니다." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
