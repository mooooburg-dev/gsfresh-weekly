import { Product } from '@/lib/supabase'
import Image from 'next/image'
import { CreditCard } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountRate = product.discount_rate || 0
  const hasDiscount = discountRate > 0
  const hasSpecialPrice = !!product.special_price

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      {/* 상품 이미지 영역 */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
      <div className="p-5 flex flex-col flex-grow">
        {/* 카테고리 */}
        {product.category && (
          <div className="text-xs font-bold text-[#2ECC71] mb-1.5">
            {product.category}
          </div>
        )}

        {/* 상품명 및 단위 */}
        <h3 className="text-[15px] font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        {product.unit && (
          <div className="text-xs text-gray-500 mb-3 font-medium">
            {product.unit}
          </div>
        )}

        <div className="mt-auto">
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
        </div>
      </div>
    </div>
  )
}