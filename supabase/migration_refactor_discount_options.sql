-- 할인 옵션 구조 리팩토링 마이그레이션
-- 실행일: 2025-12-07
-- 변경사항: 여러 할인 옵션 필드를 하나의 선택형 옵션으로 통합

-- 기존 컬럼 삭제
ALTER TABLE gsfresh_weekly_products
  DROP COLUMN IF EXISTS gspay_discount_amount,
  DROP COLUMN IF EXISTS gspay_discount_percent,
  DROP COLUMN IF EXISTS kakaopay_discount_amount,
  DROP COLUMN IF EXISTS kakaopay_discount_percent,
  DROP COLUMN IF EXISTS ncoupon_discount_amount,
  DROP COLUMN IF EXISTS ncoupon_discount_percent,
  DROP COLUMN IF EXISTS gsmembership_discount_amount,
  DROP COLUMN IF EXISTS gsmembership_discount_percent;

-- 새로운 컬럼 추가 (하나의 할인 옵션만 선택 가능)
ALTER TABLE gsfresh_weekly_products
  ADD COLUMN IF NOT EXISTS discount_option text, -- 'gspay', 'kakaopay', 'ncoupon', 'gsmembership' 중 하나
  ADD COLUMN IF NOT EXISTS discount_amount_text text, -- "3000원" 같은 문자열
  ADD COLUMN IF NOT EXISTS discount_percent_text text; -- "10%" 같은 문자열

-- 변경 사항 확인
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'gsfresh_weekly_products'
-- ORDER BY ordinal_position;
