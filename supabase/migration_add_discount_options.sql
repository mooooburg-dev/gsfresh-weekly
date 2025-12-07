-- 할인 옵션 필드 추가 마이그레이션
-- 실행일: 2025-12-07

-- gsfresh_weekly_products 테이블에 할인 옵션 컬럼 추가
ALTER TABLE gsfresh_weekly_products
  ADD COLUMN IF NOT EXISTS gspay_discount_amount integer,
  ADD COLUMN IF NOT EXISTS gspay_discount_percent integer,
  ADD COLUMN IF NOT EXISTS kakaopay_discount_amount integer,
  ADD COLUMN IF NOT EXISTS kakaopay_discount_percent integer,
  ADD COLUMN IF NOT EXISTS ncoupon_discount_amount integer,
  ADD COLUMN IF NOT EXISTS ncoupon_discount_percent integer,
  ADD COLUMN IF NOT EXISTS gsmembership_discount_amount integer,
  ADD COLUMN IF NOT EXISTS gsmembership_discount_percent integer;

-- 변경 사항 확인
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'gsfresh_weekly_products'
-- ORDER BY ordinal_position;
