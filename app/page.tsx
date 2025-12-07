'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase, type Product, type Flyer } from '@/lib/supabase';
import { Leaf, ShoppingBag, Sparkles, X, FileText } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

const CATEGORIES = ['전체', '정육', '채소', '과일', '수산', '가공식품'];

import WeatherWidget from '@/components/WeatherWidget';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [currentFlyer, setCurrentFlyer] = useState<Flyer | null>(null);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  async function fetchLatestProducts() {
    try {
      // 1. Get latest flyer
      const { data: flyers } = await supabase
        .from('gsfresh_weekly_flyers')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1);

      if (flyers && flyers.length > 0) {
        const latestFlyer = flyers[0];
        setCurrentFlyer(latestFlyer);
        const latestFlyerId = latestFlyer.id;

        // 2. Get products for that flyer
        const { data: products } = await supabase
          .from('gsfresh_weekly_products')
          .select('*')
          .eq('flyer_id', latestFlyerId)
          .order('category'); // Sort by category or created_at

        if (products) {
          setProducts(products);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts =
    activeCategory === '전체'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const getFormattedWeekString = (dateStr?: string) => {
    if (!dateStr) return '이번주 특가 상품을 확인하세요';

    const date = new Date(dateStr);
    const month = date.getMonth() + 1;

    // Calculate week number based on calendar row
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    const day = date.getDate();
    const week = Math.ceil((day + dayOfWeek) / 7);

    const weekMap = ['첫', '둘', '셋', '넷', '다섯', '여섯'];
    const weekText = weekMap[week - 1] || week;

    return `${month}월 ${weekText}째주 특가 상품을 확인하세요`;
  };

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
                캐파 장바구니
              </h1>
              <p className="text-[10px] text-[#2ECC71] font-bold tracking-widest uppercase leading-none mt-0.5">
                GS프레시 김포고촌점
              </p>
            </div>
          </div>
          <WeatherWidget />
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
            매주 수요일 업데이트
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight drop-shadow-sm">
            {currentFlyer ? (
              <>{currentFlyer.title}</>
            ) : (
              <>
                이번 주<br />
                <span className="relative">
                  신선함 그대로
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C50 4 100 2 150 4C200 6 250 8 298 2"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </span>
              </>
            )}
          </h2>

          <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto font-medium leading-relaxed opacity-90 mb-8">
            {currentFlyer
              ? `${currentFlyer.week_start} ~ ${currentFlyer.week_end}`
              : '산지의 신선함을 식탁까지, GS FRESH 주간 특가 상품을 만나보세요.'}
          </p>

          <div className="flex flex-col items-center justify-center gap-6">
            <CountdownTimer targetDateStr={currentFlyer?.week_end} />

            {currentFlyer?.image_url && (
              <button
                onClick={() => setIsFlyerModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <FileText size={18} />
                전단 이미지 보기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-16 sm:px-6 lg:px-8 bg-white relative z-10 rounded-t-[2.5rem] -mt-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-6 md:mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            이번주 행사 상품
          </h3>
          <p className="text-gray-500">
            {getFormattedWeekString(currentFlyer?.week_start)}
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-2 md:mb-12">
          <div className="flex gap-2 overflow-x-auto pb-4 px-4 sm:px-0 no-scrollbar max-w-full">
            {CATEGORIES.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[#2ECC71] text-white shadow-md shadow-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#2ECC71] mb-4"></div>
            <p className="text-gray-500">상품을 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2 md:gap-x-6 md:gap-y-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">
                  등록된 행사 상품이 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} GS FRESH. All rights reserved.
          <a
            href="/admin"
            className="ml-2 text-gray-300 hover:text-gray-500 transition-colors"
          >
            Admin
          </a>
        </div>
      </footer>
      {/* Flyer Modal */}
      {isFlyerModalOpen && currentFlyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFlyerModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {currentFlyer.title || '전단 행사'}
              </h3>
              <button
                onClick={() => setIsFlyerModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100">
              <div className="flex flex-col items-center min-h-full">
                {(currentFlyer.image_urls && currentFlyer.image_urls.length > 0
                  ? currentFlyer.image_urls
                  : [currentFlyer.image_url]
                ).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`전단 행사 이미지 ${index + 1}`}
                    className="w-full max-w-4xl h-auto object-contain shadow-sm"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
