-- GS FRESH 주간 세일 데이터베이스 스키마

-- 전단지 테이블
create table if not exists gsfresh_weekly_flyers (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  week_end date not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- 상품 테이블
create table if not exists gsfresh_weekly_products (
  id uuid primary key default uuid_generate_v4(),
  flyer_id uuid references gsfresh_weekly_flyers(id) on delete cascade,
  name text not null,
  original_price integer,
  sale_price integer not null,
  discount_rate integer,
  category text,
  image_url text,
  created_at timestamp with time zone default now(),
  special_price integer,
  special_discount_text text,
  unit text,
  coupang_url text,
  coupang_price integer,
  -- 할인 옵션 필드 (하나만 선택 가능)
  discount_option text, -- 'gspay', 'kakaopay', 'ncoupon', 'gsmembership'
  discount_amount_text text, -- "3000원" 등
  discount_percent_text text -- "10%" 등
);

-- 인덱스 생성
create index if not exists idx_gsfresh_weekly_products_flyer_id on gsfresh_weekly_products(flyer_id);
create index if not exists idx_gsfresh_weekly_products_category on gsfresh_weekly_products(category);
create index if not exists idx_gsfresh_weekly_flyers_week_start on gsfresh_weekly_flyers(week_start);

-- RLS (Row Level Security) 활성화
alter table gsfresh_weekly_flyers enable row level security;
alter table gsfresh_weekly_products enable row level security;

-- 모든 사용자가 읽기 가능
create policy "Public flyers are viewable by everyone" on gsfresh_weekly_flyers
  for select using (true);

create policy "Public products are viewable by everyone" on gsfresh_weekly_products
  for select using (true);

-- 인증된 사용자만 쓰기 가능 (관리자 페이지용)
create policy "Authenticated users can insert flyers" on gsfresh_weekly_flyers
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert products" on gsfresh_weekly_products
  for insert with check (auth.role() = 'authenticated');


