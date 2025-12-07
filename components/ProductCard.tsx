import { Product } from '@/lib/supabase';

import { CreditCard } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const DISCOUNT_OPTIONS = {
  gspay: { name: 'GS Pay/팝', icon: '💳', color: 'bg-yellow-500' },
  kakaopay: { name: '카카오페이', icon: '💛', color: 'bg-yellow-400' },
  ncoupon: { name: '엔쿠폰', icon: '🎫', color: 'bg-blue-500' },
  gsmembership: { name: 'GS멤버십', icon: '⭐', color: 'bg-green-600' },
};

export default function ProductCard({ product }: ProductCardProps) {
  const discountRate = product.discount_rate || 0;
  const hasDiscount = discountRate > 0;
  const hasSpecialPrice = !!product.special_price;

  // 할인 옵션 정보 가져오기
  const discountInfo = product.discount_option
    ? DISCOUNT_OPTIONS[product.discount_option as keyof typeof DISCOUNT_OPTIONS]
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      {/* 상품 이미지 영역 */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* 일반 할인 율 뱃지 (특별 할인이 없을 때만 표시하거나, 둘 다 표시할지 결정. 여기선 일반 할인율이 있으면 표시) */}
        {hasDiscount && !hasSpecialPrice && (
          <div className="absolute top-3 right-3 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            {discountRate}%
          </div>
        )}

        {/* GS Pay 등 특별 할인 뱃지 */}
        {hasSpecialPrice && (
          <div className="absolute top-3 right-3 bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
            <CreditCard size={12} />
            특가
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-4 flex flex-col flex-grow">
        {/* 카테고리 */}
        <div className="h-4 mb-1.5">
          {product.category && (
            <div className="text-xs font-bold text-[#2ECC71]">
              {product.category}
            </div>
          )}
        </div>

        {/* 상품명 및 단위 */}
        {/* 상품명 및 단위 */}
        <div className="mb-0.5">
          <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
        <div className="mb-1.5">
          {product.unit && (
            <div className="text-xs text-gray-500 font-medium truncate">
              {product.unit}
            </div>
          )}
        </div>

        <div className="mb-2">
          {/* 특별 할인이 있는 경우 */}
          {hasSpecialPrice ? (
            <div className="flex flex-col gap-1">
              {/* 특별 할인 조건 텍스트 */}
              {product.special_discount_text && (
                <div className="text-[11px] font-bold text-[#FF6B6B] bg-red-50 px-2 py-1 rounded w-fit">
                  {product.special_discount_text}
                </div>
              )}
              <div className="flex items-end gap-2 mt-1">
                <div className="text-xs text-gray-400 line-through mb-1">
                  {product.sale_price.toLocaleString()}원
                </div>
                <div className="text-xl font-extrabold text-[#E74C3C]">
                  {product.special_price?.toLocaleString()}원
                </div>
              </div>
            </div>
          ) : (
            /* 일반 가격 표시 */
            <div className="flex flex-col">
              {product.original_price && (
                <div className="text-xs text-gray-400 line-through mb-0.5">
                  {product.original_price.toLocaleString()}원
                </div>
              )}
              <div className="text-lg font-extrabold text-gray-900">
                {product.sale_price.toLocaleString()}원
              </div>
            </div>
          )}

          {/* 할인 옵션 표시 */}
          {discountInfo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 mb-2">
                추가 할인
              </div>
              <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-gray-50 to-white px-2 py-1.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="hidden md:inline text-xs">
                    {discountInfo.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-700">
                    {discountInfo.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {product.discount_amount_text && (
                    <span className="text-[11px] font-bold text-[#E74C3C]">
                      {product.discount_amount_text}
                    </span>
                  )}
                  {product.discount_percent_text && (
                    <span
                      className={`${discountInfo.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}
                    >
                      {product.discount_percent_text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coupang Comparison */}
        {product.coupang_price && (
          <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                🚀 쿠팡가
              </span>
              <span
                className={`text-sm font-bold ${
                  product.coupang_price >
                  (product.special_price || product.sale_price)
                    ? 'text-gray-400 line-through'
                    : 'text-red-600'
                }`}
              >
                {product.coupang_price.toLocaleString()}원
              </span>
            </div>
            {product.coupang_price >
            (product.special_price || product.sale_price!) ? (
              <div className="bg-green-50 text-green-700 text-xs font-bold text-center py-1.5 rounded flex justify-center items-center gap-1">
                <span className="hidden md:inline">👍</span>
                <span>
                  쿠팡보다{' '}
                  {(
                    product.coupang_price -
                    (product.special_price || product.sale_price!)
                  ).toLocaleString()}
                  원 저렴해요!
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-orange-50 text-orange-700 text-xs font-bold text-center py-1.5 rounded flex justify-center items-center gap-1">
                  <span className="hidden md:inline">💰</span>
                  <span>
                    쿠팡이{' '}
                    {(
                      (product.special_price || product.sale_price) -
                      product.coupang_price
                    ).toLocaleString()}
                    원 저렴해요!
                  </span>
                </div>
                {product.coupang_url && (
                  <a
                    href={product.coupang_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>🛒</span>
                    <span>쿠팡에서 구매하기</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
