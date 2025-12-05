-- GS FRESH 주간 세일 데이터베이스 스키마

-- 전단지 테이블
create table if not exists flyers (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  week_end date not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- 상품 테이블
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  flyer_id uuid references flyers(id) on delete cascade,
  name text not null,
  original_price integer,
  sale_price integer not null,
  discount_rate integer,
  category text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 인덱스 생성
create index if not exists idx_products_flyer_id on products(flyer_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_flyers_week_start on flyers(week_start);

-- RLS (Row Level Security) 활성화
alter table flyers enable row level security;
alter table products enable row level security;

-- 모든 사용자가 읽기 가능
create policy "Public flyers are viewable by everyone" on flyers
  for select using (true);

create policy "Public products are viewable by everyone" on products
  for select using (true);

-- 인증된 사용자만 쓰기 가능 (관리자 페이지용)
create policy "Authenticated users can insert flyers" on flyers
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert products" on products
  for insert with check (auth.role() = 'authenticated');
