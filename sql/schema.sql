-- =============================================
-- 머꼬머꼬 데이터베이스 스키마
-- Supabase SQL Editor에서 이 전체를 복사해서 실행하세요.
-- =============================================

-- 1. profiles 테이블 (사용자 프로필)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 회원가입 시 자동으로 profiles 행 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. restaurants 테이블 (맛집 데이터)
create table public.restaurants (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null check (category in ('bapsim', 'cheating', 'stress', 'hot', 'fresh', 'sugar')),
  lat double precision not null,
  lng double precision not null,
  address text not null,
  image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. reviews 테이블 (리뷰)
create table public.reviews (
  id bigint generated always as identity primary key,
  restaurant_id bigint references public.restaurants on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  menu text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. favorites 테이블 (즐겨찾기)
create table public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles on delete cascade not null,
  restaurant_id bigint references public.restaurants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, restaurant_id)
);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

-- profiles
alter table public.profiles enable row level security;

create policy "누구나 프로필 조회 가능"
  on public.profiles for select
  using (true);

create policy "본인만 프로필 수정 가능"
  on public.profiles for update
  using (auth.uid() = id);

-- restaurants
alter table public.restaurants enable row level security;

create policy "누구나 맛집 조회 가능"
  on public.restaurants for select
  using (true);

create policy "로그인한 유저는 맛집 등록 가능"
  on public.restaurants for insert
  with check (auth.uid() is not null);

-- reviews
alter table public.reviews enable row level security;

create policy "누구나 리뷰 조회 가능"
  on public.reviews for select
  using (true);

create policy "로그인한 유저만 리뷰 작성 가능"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "본인만 리뷰 삭제 가능"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- favorites
alter table public.favorites enable row level security;

create policy "본인 즐겨찾기만 조회 가능"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "로그인한 유저만 즐겨찾기 추가 가능"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "본인만 즐겨찾기 삭제 가능"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- 5. blocked_places 테이블 (다시 보지 않기)
create table public.blocked_places (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles on delete cascade not null,
  restaurant_id bigint references public.restaurants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, restaurant_id)
);

alter table public.blocked_places enable row level security;

create policy "본인 차단 목록만 조회"
  on public.blocked_places for select
  using (auth.uid() = user_id);

create policy "로그인한 유저만 차단 추가"
  on public.blocked_places for insert
  with check (auth.uid() = user_id);

create policy "본인만 차단 해제"
  on public.blocked_places for delete
  using (auth.uid() = user_id);
