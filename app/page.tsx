import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/supabase';
import { Leaf, ShoppingBag, Sparkles, Upload } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

// Mock Data for visualization
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    flyer_id: 'f1',
    name: '갓 수확한 딸기',
    original_price: null,
    sale_price: 14900,
    discount_rate: null,
    category: '과일',
    image_url:
      'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString(),
    unit: '500g/팩',
    special_price: 9900,
    special_discount_text: 'GS Pay/팝 5천원 추가할인',
  },
  {
    id: '2',
    flyer_id: 'f1',
    name: '서귀포 감귤',
    original_price: null,
    sale_price: 14900,
    discount_rate: null,
    category: '과일',
    image_url:
      'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString(),
    unit: '3kg/박스',
    special_price: 11900,
    special_discount_text: 'GS Pay/팝 3천원 추가할인',
  },
  {
    id: '3',
    flyer_id: 'f1',
    name: '한돈 삼겹살/오겹살/목심 구이용',
    original_price: null,
    sale_price: 16900,
    discount_rate: null,
    category: '정육',
    image_url:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString(),
    unit: '500g/팩',
    special_price: 13900,
    special_discount_text: '카드/GS Pay/팝 3천원 추가할인',
  },
  {
    id: '4',
    flyer_id: 'f1',
    name: '오뚜기 봉지면 전품목',
    original_price: null,
    sale_price: 4980,
    discount_rate: 20,
    category: '가공식품',
    image_url:
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString(),
    unit: '각',
    special_price: null,
    special_discount_text: 'GS Pay/팝카드 20% 할인',
  },
];

const CATEGORIES = ['전체', '정육', '채소', '과일', '수산', '가공식품'];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2ECC71] rounded-lg flex items-center justify-center text-white">
              <Leaf size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">
                GS FRESH
              </h1>
              <p className="text-[10px] text-[#2ECC71] font-bold tracking-widest uppercase leading-none mt-0.5">
                WEEKLY SALE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            <span className="text-sm font-medium hidden sm:block">
              이번주 행사 상품
            </span>
            <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
              <ShoppingBag size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#4ade80] to-[#059669] pt-12 pb-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/20 shadow-sm">
            <Sparkles
              size={14}
              className="text-yellow-300"
              fill="currentColor"
            />
            매주 목요일 업데이트
          </div>

          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight drop-shadow-sm">
            이번 주<br />
            신선함 그대로
          </h2>

          <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto font-medium mb-10 leading-relaxed opacity-90">
            산지의 신선함을 식탁까지, GS FRESH 주간 특가 상품을 만나보세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-white relative z-10 rounded-t-[2.5rem] -mt-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            이번주 행사 상품
          </h3>
          <p className="text-gray-500">12월 첫째주 특가 상품을 확인하세요</p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-2 overflow-x-auto pb-4 px-4 sm:px-0 no-scrollbar max-w-full">
            {CATEGORIES.map((category, index) => (
              <button
                key={category}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  index === 0
                    ? 'bg-[#2ECC71] text-white shadow-md shadow-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {MOCK_PRODUCTS.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">
              상품 정보를 불러오는 중입니다...
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} GS FRESH. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
