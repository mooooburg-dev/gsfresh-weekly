'use client';

import { useState, useEffect } from 'react';
import { supabase, type Product, type Flyer } from '@/lib/supabase';
import { fetchCoupangPrice, analyzeImageWithOCR } from './actions';
import imageCompression from 'browser-image-compression';
import {
  Search,
  Plus,
  Save,
  ExternalLink,
  RefreshCw,
  Trash2,
  Edit,
  Loader2,
  Image as ImageIcon,
  Upload,
  FileText,
  Lock,
  X,
} from 'lucide-react';

export default function AdminPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [selectedFlyerId, setSelectedFlyerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sale_price: 0,
    original_price: 0,
    coupang_url: '',
    coupang_price: 0,
    image_url: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [fetchingCoupang, setFetchingCoupang] = useState(false);

  // Flyer creation state
  const [isCreatingFlyer, setIsCreatingFlyer] = useState(false);
  const [flyerForm, setFlyerForm] = useState({
    week_start: '',
    week_end: '',
    title: '',
  });
  const [editingFlyerId, setEditingFlyerId] = useState<string | null>(null);

  // OCR state
  const [isOCRMode, setIsOCRMode] = useState(false);
  const [analyzingOCR, setAnalyzingOCR] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [ocrResults, setOcrResults] = useState<Array<Partial<Product>>>([]);
  const [ocrFullText, setOcrFullText] = useState('');
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('gsfresh_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'gsfresh') {
      localStorage.setItem('gsfresh_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleCreateOrUpdateFlyer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFlyerId) {
      // Update
      const { error } = await supabase
        .from('gsfresh_weekly_flyers')
        .update(flyerForm)
        .eq('id', editingFlyerId);

      if (error) {
        alert('Error updating flyer: ' + error.message);
      } else {
        await fetchFlyers();
        closeFlyerModal();
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from('gsfresh_weekly_flyers')
        .insert([flyerForm])
        .select()
        .single();

      if (error) {
        alert('Error creating flyer: ' + error.message);
      } else {
        await fetchFlyers();
        closeFlyerModal();
        if (data) setSelectedFlyerId(data.id);
      }
    }
  };

  const openCreateFlyerModal = () => {
    setEditingFlyerId(null);
    setFlyerForm({ week_start: '', week_end: '', title: '' });
    setIsCreatingFlyer(true);
  };

  const openEditFlyerModal = () => {
    if (!selectedFlyerId) return;
    const flyer = flyers.find((f) => f.id === selectedFlyerId);
    if (flyer) {
      setEditingFlyerId(flyer.id);
      setFlyerForm({
        week_start: flyer.week_start,
        week_end: flyer.week_end,
        title: flyer.title || '',
      });
      setIsCreatingFlyer(true);
    }
  };

  const closeFlyerModal = () => {
    setIsCreatingFlyer(false);
    setEditingFlyerId(null);
    setFlyerForm({ week_start: '', week_end: '', title: '' });
  };

  const fetchFlyers = async () => {
    const { data, error } = await supabase
      .from('gsfresh_weekly_flyers')
      .select('*')
      .order('week_start', { ascending: false });

    if (data && data.length > 0) {
      setFlyers(data);
      // Default to the most recent flyer
      if (!selectedFlyerId) setSelectedFlyerId(data[0].id);
    }
  };

  const fetchProducts = async (flyerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gsfresh_weekly_products')
      .select('*')
      .eq('flyer_id', flyerId)
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFlyers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedFlyerId && isAuthenticated) {
      fetchProducts(selectedFlyerId);
    }
  }, [selectedFlyerId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#2ECC71]/10 rounded-full flex items-center justify-center text-[#2ECC71]">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
            관리자 접근
          </h1>
          <p className="text-gray-500 text-center mb-8 text-sm">
            페이지 접근을 위해 비밀번호를 입력하세요.
          </p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3.5 mb-4 focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none bg-gray-50 transition-all font-medium"
            placeholder="비밀번호"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#2ECC71] text-white py-3.5 rounded-xl font-bold hover:bg-[#27ae60] transition-colors shadow-lg shadow-[#2ECC71]/20 active:scale-[0.98]"
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  // Helper to upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    if (!selectedFlyerId) return null;

    // Create a unique file name: flyer_id/timestamp_filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedFlyerId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('flyers')
      .upload(fileName, file);

    if (error) {
      console.error('Upload Error:', error);
      alert(
        `이미지 업로드 실패: ${error.message}\n(Supabase Storage 'flyers' 버킷이 존재하는지, RLS 정책이 설정되었는지 확인해주세요)`
      );
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('flyers').getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedFlyerId) {
      if (!selectedFlyerId) alert('전단지를 먼저 선택해주세요.');
      return;
    }

    setAnalyzingOCR(true);
    try {
      // 0. Get current flyer to append images
      const currentFlyer = flyers.find((f) => f.id === selectedFlyerId);
      let newImageUrls = currentFlyer?.image_urls || [];
      // Fallback for legacy image_url
      if (!newImageUrls.length && currentFlyer?.image_url) {
        newImageUrls = [currentFlyer.image_url];
      }

      // 1. Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Compress
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
          fileType: 'image/jpeg' as const,
        };
        const compressedFile = await imageCompression(file, options);

        // Upload
        const uploadedUrl = await uploadImage(compressedFile);

        if (uploadedUrl) {
          newImageUrls = [...newImageUrls, uploadedUrl];

          // For the first uploaded image, run OCR automatically (as a convenience)
          if (i === 0) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64Image = event.target?.result as string;
              setOcrImagePreview(base64Image); // Show this one

              // Run OCR
              const result = await analyzeImageWithOCR(base64Image);
              if (result.success && result.products) {
                const convertedProducts = result.products.map((p) => ({
                  name: p.name,
                  sale_price: p.sale_price ?? undefined,
                  original_price: p.original_price ?? undefined,
                  category: p.category ?? undefined,
                  flyer_id: selectedFlyerId,
                }));
                setOcrResults(convertedProducts);
                setOcrFullText(result.fullText || '');
                setIsOCRMode(true);
                alert(`OCR 분석 완료! ${result.products.length}개 상품 감지됨`);
              }
              setAnalyzingOCR(false);
            };
            reader.readAsDataURL(compressedFile);
          }
        }
      }

      // Update DB with all new URLs
      // Note: We update both image_url (legacy, set to first) and image_urls (new)
      const { error: updateError } = await supabase
        .from('gsfresh_weekly_flyers')
        .update({
          image_urls: newImageUrls,
          image_url: newImageUrls[0], // Keep legacy field sync for now
        })
        .eq('id', selectedFlyerId);

      if (updateError) {
        console.error('DB Update Error:', updateError);
        alert('이미지 저장 실패 (DB 오류): ' + updateError.message);
      } else {
        fetchFlyers();
      }
    } catch (error) {
      console.error(error);
      alert('작업 실패');
      setAnalyzingOCR(false);
    }
  };

  const updateOcrResult = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    const updated = [...ocrResults];
    updated[index] = { ...updated[index], [field]: value };
    setOcrResults(updated);
  };

  const deleteOcrResult = (index: number) => {
    setOcrResults(ocrResults.filter((_, i) => i !== index));
  };

  const handleDeleteFlyer = async () => {
    if (!selectedFlyerId) return;
    if (
      !confirm(
        '정말 이 기획전을 삭제하시겠습니까?\n\n주의: 이 기획전에 등록된 모든 상품 데이터도 함께 삭제될 수 있습니다.'
      )
    )
      return;

    try {
      // 1. Delete products first (safeguard against non-cascade)
      const { error: productsError } = await supabase
        .from('gsfresh_weekly_products')
        .delete()
        .eq('flyer_id', selectedFlyerId);

      if (productsError) {
        console.error('Products delete error:', productsError);
      }

      // 2. Delete flyer
      const { error } = await supabase
        .from('gsfresh_weekly_flyers')
        .delete()
        .eq('id', selectedFlyerId);

      if (error) {
        throw error;
      }

      alert('기획전이 삭제되었습니다.');
      
      // Refresh list
      const { data } = await supabase
        .from('gsfresh_weekly_flyers')
        .select('*')
        .order('week_start', { ascending: false });

      if (data) {
        setFlyers(data);
        if (data.length > 0) {
          setSelectedFlyerId(data[0].id);
        } else {
          setSelectedFlyerId(null);
          setProducts([]);
        }
      } else {
        setFlyers([]);
        setSelectedFlyerId(null);
        setProducts([]);
      }
    } catch (e: any) {
      alert('삭제 실패: ' + e.message);
    }
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    if (!selectedFlyerId) return;
    if (!confirm('정말 이 이미지를 삭제하시겠습니까?')) return;

    try {
      const currentFlyer = flyers.find((f) => f.id === selectedFlyerId);
      if (!currentFlyer) return;

      const currentImages = currentFlyer.image_urls?.length
        ? currentFlyer.image_urls
        : currentFlyer.image_url
        ? [currentFlyer.image_url]
        : [];

      const newImageUrls = currentImages.filter((url) => url !== urlToDelete);
      const newLegacyUrl = newImageUrls.length > 0 ? newImageUrls[0] : null;

      const { error } = await supabase
        .from('gsfresh_weekly_flyers')
        .update({
          image_urls: newImageUrls,
          image_url: newLegacyUrl,
        })
        .eq('id', selectedFlyerId);

      if (error) {
        alert('삭제 실패: ' + error.message);
      } else {
        // Optimistic update or refetch
        await fetchFlyers();
        // If the deleted image was the currently displayed one, switch to another or clear
        if (ocrImagePreview === urlToDelete) {
          setOcrImagePreview(newLegacyUrl);
        }
      }
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류 발생');
    }
  };

  // Re-entering Edit Mode
  const enterEditMode = async () => {
    if (!selectedFlyerId) return;

    setLoading(true);
    // Fetch fresh flyer data to ensure we have the image URL
    const { data: currentFlyer, error } = await supabase
      .from('gsfresh_weekly_flyers')
      .select('*')
      .eq('id', selectedFlyerId)
      .single();

    setLoading(false);

    if (error || !currentFlyer) {
      alert('전단지 정보를 불러올 수 없습니다.');
      return;
    }

    if (
      !currentFlyer.image_url &&
      (!currentFlyer.image_urls || currentFlyer.image_urls.length === 0)
    ) {
      alert(
        '등록된 전단지 이미지가 없습니다. 이미지를 새로 업로드하거나 OCR 분석을 다시 실행해주세요.'
      );
      return;
    }

    // Prefer image_urls[0] or image_url
    const validImages =
      currentFlyer.image_urls && currentFlyer.image_urls.length > 0
        ? currentFlyer.image_urls
        : currentFlyer.image_url
        ? [currentFlyer.image_url]
        : [];

    if (validImages.length === 0) {
      alert(
        '등록된 전단지 이미지가 없습니다. 이미지를 새로 업로드하거나 OCR 분석을 다시 실행해주세요.'
      );
      return;
    }

    setOcrImagePreview(validImages[0]);
    // Load existing products into "OCR Results" (Editor)
    setOcrResults(products); // products should already be loaded by useEffect
    setOcrFullText(''); // No raw text when loading from DB
    setIsOCRMode(true);
  };

  const handleBulkSave = async () => {
    if (!selectedFlyerId) return alert('전단지를 먼저 선택하세요');
    if (ocrResults.length === 0) return alert('저장할 상품이 없습니다');

    setIsImporting(true);

    try {
      // Separate new items (no ID) and existing items (has ID)
      const newItems = ocrResults
        .filter((p) => !p.id)
        .map((p) => ({
          flyer_id: selectedFlyerId,
          name: p.name || '이름 없음',
          sale_price: Number(p.sale_price) || 0,
          original_price: Number(p.original_price) || null,
          category: p.category || null,
          coupang_price: Number(p.coupang_price) || null,
          discount_option: p.discount_option || null,
          discount_amount_text: p.discount_amount_text || null,
          discount_percent_text: p.discount_percent_text || null,
        }));

      const existingItems = ocrResults
        .filter((p) => p.id)
        .map((p) => ({
          id: p.id,
          flyer_id: selectedFlyerId,
          name: p.name,
          sale_price: Number(p.sale_price) || 0,
          original_price: Number(p.original_price) || null,
          category: p.category || null,
          coupang_price: Number(p.coupang_price) || null,
          discount_option: p.discount_option || null,
          discount_amount_text: p.discount_amount_text || null,
          discount_percent_text: p.discount_percent_text || null,
        }));

      // 1. Insert New Items
      if (newItems.length > 0) {
        const { error: insertError } = await supabase
          .from('gsfresh_weekly_products')
          .insert(newItems);
        if (insertError) throw insertError;
      }

      // 2. Update Existing Items
      if (existingItems.length > 0) {
        // Supabase UPSERT allows bulk update if Primary Key is present
        const { error: updateError } = await supabase
          .from('gsfresh_weekly_products')
          .upsert(existingItems);
        if (updateError) throw updateError;
      }

      // 3. (Optional) Detect Deleted Items?
      // Current logic strictly adds/updates.
      // Deletions should probably be explicit in this view or handled by "Delete" action immediately?
      // For now, let's assume deletions in the editor are just "don't save/update these" if they were new,
      // but if they were existing, "removing from the list" naturally doesn't delete from DB in this logic
      // unless we track removals.
      // USER asked to "Delete" via the trash icon.
      // If we are in "Edit Mode" and delete a row that HAS an ID, we should probably delete it from DB immediately or mark for deletion?
      // Let's keep it simple: "Garbage Can" icon in the table removes from the *List*.
      // If it had an ID, we should probably record it to delete on save, or just delete immediately.
      // Immediate deletion is safer/easier logic-wise for now:
      // See `deleteOcrResult`.

      alert('저장 완료!');

      // Do we exit mode? Or stay?
      // User asked to "re-enter", implying they might want to stay or come back.
      // But refreshing the list is good.
      await fetchProducts(selectedFlyerId);

      // Update the "OCR Results" with the latest ID-assigned list so subsequent saves are updates
      // Actually, fetching products updates `products`. We should reload `ocrResults` from that if we stay.
      // Let's just exit mode for clarity, or reload.
      // Reloading is better experience.
      // We will perform a fetch and then sync ocrResults.
      // BUT `fetchProducts` is async.

      // Let's restart the flow:
      const { data: refreshedProducts } = await supabase
        .from('gsfresh_weekly_products')
        .select('*')
        .eq('flyer_id', selectedFlyerId)
        .order('created_at', { ascending: false });

      if (refreshedProducts) {
        setProducts(refreshedProducts);
        setOcrResults(refreshedProducts);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      alert('저장 실패: ' + message);
    }

    setIsImporting(false);
  };

  // Override delete logic to handle persistent DB deletion in Edit Mode
  const handleDeleteItem = async (index: number) => {
    const item = ocrResults[index];
    if (item.id) {
      if (!confirm('DB에 저장된 상품입니다. 정말 삭제하시겠습니까?')) return;
      // Delete from DB immediately
      const { error } = await supabase
        .from('gsfresh_weekly_products')
        .delete()
        .eq('id', item.id);
      if (error) {
        alert('삭제 실패: ' + error.message);
        return;
      }
    }
    deleteOcrResult(index);
  };

  const handleCoupangFetch = async () => {
    if (!formData.coupang_url) return;
    setFetchingCoupang(true);
    try {
      const result = await fetchCoupangPrice(formData.coupang_url);
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          coupang_price: result.price || prev.coupang_price,
          // If we got an image and don't have one, maybe suggest it?
          // For now let's just alert or log, or auto-fill if empty
          image_url:
            prev.image_url ||
            (result.image && result.image.startsWith('//')
              ? 'https:' + result.image
              : result.image) ||
            prev.image_url,
        }));
        alert(`Price fetched: ${result.price}`);
      } else {
        alert('Could not fetch price automatically. Please enter manually.');
      }
    } catch (e) {
      alert('Error fetching price');
    }
    setFetchingCoupang(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlyerId) return alert('No flyer selected');

    const productData = {
      ...formData,
      flyer_id: selectedFlyerId,
      // Ensure numeric
      original_price: Number(formData.original_price) || null,
      sale_price: Number(formData.sale_price) || 0,
      coupang_price: Number(formData.coupang_price) || null,
    };

    if (isEditing && formData.id) {
      const { error } = await supabase
        .from('gsfresh_weekly_products')
        .update(productData)
        .eq('id', formData.id);
      if (error) alert('Error updating: ' + error.message);
      else {
        fetchProducts(selectedFlyerId);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('gsfresh_weekly_products')
        .insert([productData]);
      if (error) alert('Error creating: ' + error.message);
      else {
        fetchProducts(selectedFlyerId);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sale_price: 0,
      original_price: 0,
      coupang_url: '',
      coupang_price: 0,
      image_url: '',
    });
    setIsEditing(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('gsfresh_weekly_products').delete().eq('id', id);
    if (selectedFlyerId) fetchProducts(selectedFlyerId);
  };

  const editProduct = (p: Product) => {
    setFormData(p);
    setIsEditing(true);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 p-6 transition-all mx-auto ${
        isOCRMode ? 'max-w-[1920px]' : 'max-w-[1600px]'
      }`}
    >
      <div
        className={`grid grid-cols-1 gap-6 ${
          isOCRMode ? '' : 'lg:grid-cols-12'
        }`}
      >
        {/* Left Column: List (Takes up more space now) */}
        <div
          className={isOCRMode ? 'w-full space-y-6' : 'lg:col-span-8 space-y-6'}
        >
          {/* Top Control Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                상품 관리
              </h1>
              <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

              <div className="flex items-center gap-2 flex-1 md:flex-none">
                <select
                  className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none min-w-[200px]"
                  value={selectedFlyerId || ''}
                  onChange={(e) => setSelectedFlyerId(e.target.value)}
                >
                  <option value="" disabled>
                    기획전을 선택하세요
                  </option>
                  {flyers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title ? f.title + ' (' : ''}
                      {f.week_start} ~ {f.week_end}
                      {f.title ? ')' : ''}
                    </option>
                  ))}
                </select>

                {selectedFlyerId && !isOCRMode && (
                  <button
                    onClick={openEditFlyerModal}
                    className="p-2 border border-gray-200 bg-white text-gray-500 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
                    title="기획전 일정/제목 수정"
                  >
                    <Edit size={18} />
                  </button>
                )}

                {selectedFlyerId && !isOCRMode && (
                  <button
                    onClick={handleDeleteFlyer}
                    className="p-2 border border-gray-200 bg-white text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="기획전 삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {selectedFlyerId && !isOCRMode && (
                <button
                  onClick={enterEditMode}
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-black hover:border-black transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <ImageIcon size={18} /> 전단지 보기
                </button>
              )}

              <button
                onClick={openCreateFlyerModal}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-black hover:border-black transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={18} /> 기획전 추가
              </button>

              <label className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer text-sm font-bold shadow-md shadow-gray-200">
                {analyzingOCR ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    OCR 분석/추가
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={analyzingOCR}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          </div>

          {/* OCR Results - Side by Side Layout */}
          {isOCRMode && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b bg-blue-50 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {ocrFullText ? 'OCR 분석 결과' : '전단지 편집 모드'} (
                      {ocrResults.length}개)
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      왼쪽 전단지 이미지를 보면서 오른쪽 데이터를 수정하세요.{' '}
                      {ocrFullText ? '(OCR 추출됨)' : '(DB 데이터 로드됨)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsOCRMode(false);
                        setOcrImagePreview(null);
                        setOcrFullText('');
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      나가기
                    </button>
                    <button
                      onClick={handleBulkSave}
                      disabled={isImporting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {ocrFullText ? '일괄 등록' : '변경사항 저장'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Side by Side Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-200">
                {/* Left: Image Preview */}
                <div className="bg-gray-50 p-6 overflow-hidden relative">
                  <div className="sticky top-6">
                    <div className="bg-gray-800 text-white px-4 py-2 text-sm font-semibold rounded-t-lg w-full flex justify-between items-center">
                      <span>전단지 이미지</span>
                      <span className="text-xs font-normal text-gray-400">
                        이미지를 클릭하여 OCR 실행
                      </span>
                    </div>
                    {ocrImagePreview ? (
                      <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-b-lg rounded-r-lg shadow-sm">
                        <div className="space-y-4 p-4">
                          {/* Main Preview (Active Image) */}
                          <div className="border-2 border-blue-500 rounded-lg overflow-hidden relative group">
                            <img
                              src={ocrImagePreview}
                              alt="Selected Flyer"
                              className="w-full h-auto"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              현재 선택됨 (OCR 대상)
                            </div>
                          </div>

                          {/* Thumbnail List */}
                          {(() => {
                            const currentFlyer = flyers.find(
                              (f) => f.id === selectedFlyerId
                            );
                            const images = currentFlyer?.image_urls?.length
                              ? currentFlyer.image_urls
                              : currentFlyer?.image_url
                              ? [currentFlyer.image_url]
                              : [];

                            if (images.length > 0) {
                              return (
                                <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                                  {images.map((url, idx) => (
                                    <div
                                      key={idx}
                                      className="relative group/item"
                                    >
                                      <div
                                        className={`cursor-pointer rounded-lg overflow-hidden border-2 hover:opacity-100 transition-all ${
                                          ocrImagePreview === url
                                            ? 'border-blue-500 opacity-100 ring-2 ring-blue-200'
                                            : 'border-transparent opacity-60'
                                        }`}
                                        onClick={async () => {
                                          if (ocrImagePreview === url) return; // Already selected
                                          setOcrImagePreview(url);

                                          if (
                                            confirm(
                                              '이 이미지로 다시 OCR 분석을 실행할까요? (기존 목록에 추가됩니다)'
                                            )
                                          ) {
                                            setAnalyzingOCR(true);
                                            try {
                                              const response = await fetch(url);
                                              const blob =
                                                await response.blob();
                                              const reader = new FileReader();
                                              reader.onload = async (e) => {
                                                const base64 = e.target
                                                  ?.result as string;
                                                const result =
                                                  await analyzeImageWithOCR(
                                                    base64
                                                  );
                                                if (
                                                  result.success &&
                                                  result.products
                                                ) {
                                                  const newItems =
                                                    result.products.map(
                                                      (p) => ({
                                                        name: p.name,
                                                        sale_price:
                                                          p.sale_price ??
                                                          undefined,
                                                        original_price:
                                                          p.original_price ??
                                                          undefined,
                                                        category:
                                                          p.category ??
                                                          undefined,
                                                        flyer_id:
                                                          selectedFlyerId!,
                                                      })
                                                    );
                                                  setOcrResults((prev) => [
                                                    ...prev,
                                                    ...newItems,
                                                  ]);
                                                  alert(
                                                    `추가 분석 완료! ${result.products.length}개 상품이 목록에 추가되었습니다.`
                                                  );
                                                }
                                                setAnalyzingOCR(false);
                                              };
                                              reader.readAsDataURL(blob);
                                            } catch (e) {
                                              alert('이미지 로드 실패');
                                              setAnalyzingOCR(false);
                                            }
                                          }
                                        }}
                                      >
                                        <img
                                          src={url}
                                          className="w-full h-full object-cover aspect-[3/4]"
                                        />
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteImage(url);
                                        }}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm hover:bg-red-600 border border-white z-10"
                                        title="이미지 삭제"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-400 border rounded bg-white">
                        이미지 없음
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Editable Table */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)] bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50">
                          상품명
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50">
                          할인가
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50">
                          정상가
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50">
                          카테고리
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50 text-xs">
                          할인옵션
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50 text-xs">
                          할인금액
                        </th>
                        <th className="p-3 text-left font-semibold border-b bg-gray-50 text-xs">
                          할인율
                        </th>
                        <th className="p-3 text-center font-semibold border-b bg-gray-50">
                          삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y relative">
                      {ocrResults.map((product, index) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50 transition-colors group"
                        >
                          <td className="p-2">
                            <textarea
                              value={product.name || ''}
                              onChange={(e) =>
                                updateOcrResult(index, 'name', e.target.value)
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-10 leading-tight min-w-[150px]"
                              placeholder="상품명 입력"
                              rows={1}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={product.sale_price || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'sale_price',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 font-bold text-blue-600 bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[80px]"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={product.original_price || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'original_price',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[80px]"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={product.category || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'category',
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[90px]"
                            >
                              <option value="" className="text-gray-400">
                                선택
                              </option>
                              <option value="정육">정육</option>
                              <option value="채소">채소</option>
                              <option value="과일">과일</option>
                              <option value="수산">수산</option>
                              <option value="가공식품">가공식품</option>
                              <option value="공산품">공산품</option>
                              <option value="기타">기타</option>
                            </select>
                          </td>
                          {/* 할인 옵션 선택 */}
                          <td className="p-2">
                            <select
                              value={product.discount_option || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'discount_option',
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="">선택안함</option>
                              <option value="gspay">💳 GS Pay/팝</option>
                              <option value="kakaopay">💛 카카오페이</option>
                              <option value="ncoupon">🎫 엔쿠폰</option>
                              <option value="gsmembership">⭐ GS멤버십</option>
                            </select>
                          </td>
                          {/* 할인 금액 */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={product.discount_amount_text || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'discount_amount_text',
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="3000원"
                            />
                          </td>
                          {/* 할인율 */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={product.discount_percent_text || ''}
                              onChange={(e) =>
                                updateOcrResult(
                                  index,
                                  'discount_percent_text',
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="10%"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDeleteItem(index)}
                              className="p-2 hover:bg-red-100 rounded text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              title="삭제"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Add Manual Item Row */}
                      <tr>
                        <td colSpan={7} className="p-4 bg-gray-50/50">
                          <button
                            onClick={() =>
                              setOcrResults([
                                ...ocrResults,
                                {
                                  name: '',
                                  sale_price: 0,
                                  original_price: 0,
                                  category: '',
                                },
                              ])
                            }
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 transition-all font-medium"
                          >
                            <Plus size={18} />
                            직접 추가하기
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OCR Full Text (Collapsible) */}
              {ocrFullText && (
                <div className="border-t bg-gray-50">
                  <details className="p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                      📄 원본 OCR 텍스트 보기
                    </summary>
                    <pre className="mt-3 p-4 bg-white border rounded-lg text-xs overflow-auto max-h-48 whitespace-pre-wrap text-gray-800 font-mono">
                      {ocrFullText}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}

          {isCreatingFlyer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingFlyerId ? '기획전 수정' : '새 전단지 등록'}
                </h2>
                <form
                  onSubmit={handleCreateOrUpdateFlyer}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      기획전 제목 (선택)
                    </label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
                      placeholder="예: 12월 첫째주 특가"
                      value={flyerForm.title}
                      onChange={(e) =>
                        setFlyerForm({
                          ...flyerForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        시작일
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full border p-2 rounded"
                        value={flyerForm.week_start}
                        onChange={(e) =>
                          setFlyerForm({
                            ...flyerForm,
                            week_start: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        종료일
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full border p-2 rounded"
                        value={flyerForm.week_end}
                        onChange={(e) =>
                          setFlyerForm({
                            ...flyerForm,
                            week_end: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={closeFlyerModal}
                      className="flex-1 bg-gray-100 py-2 rounded hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                    >
                      {editingFlyerId ? '수정하기' : '등록하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Image</th>
                  <th className="p-4 font-semibold text-gray-600">Product</th>
                  <th className="p-4 font-semibold text-gray-600">Option</th>
                  <th className="p-4 font-semibold text-gray-600">GS Price</th>
                  <th className="p-4 font-semibold text-gray-600">Coupang</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="p-4">
                      {product.discount_option ? (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          {product.discount_option === 'gspay' && 'GS Pay'}
                          {product.discount_option === 'kakaopay' &&
                            '카카오페이'}
                          {product.discount_option === 'ncoupon' && '엔쿠폰'}
                          {product.discount_option === 'gsmembership' &&
                            'GS멤버십'}
                          {![
                            'gspay',
                            'kakaopay',
                            'ncoupon',
                            'gsmembership',
                          ].includes(product.discount_option) &&
                            product.discount_option}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                      {product.discount_amount_text && (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.discount_amount_text} 할인
                        </div>
                      )}
                      {product.discount_percent_text && (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.discount_percent_text} 할인
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-blue-600">
                        {product.sale_price?.toLocaleString()}원
                      </div>
                      {product.original_price && (
                        <div className="text-xs text-gray-400 line-through">
                          {product.original_price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {product.coupang_price ? (
                        <div className="font-bold text-red-600">
                          {product.coupang_price.toLocaleString()}원
                          {product.sale_price && product.coupang_price && (
                            <span
                              className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                product.sale_price < product.coupang_price
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {product.sale_price < product.coupang_price
                                ? 'WIN'
                                : 'LOSE'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {product.coupang_url && (
                        <a
                          href={product.coupang_url}
                          target="_blank"
                          className="text-xs text-blue-500 hover:underline block mt-1"
                        >
                          Link &rarr;
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="p-1 hover:bg-gray-200 rounded text-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1 hover:bg-gray-200 rounded text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No products found. Add one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Form (Takes up less space) */}
        {!isOCRMode && (
          <div className="lg:col-span-4 h-fit sticky top-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">
                {isEditing ? '기존 상품 수정' : '신규 상품 등록'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    상품명 (Product Name)
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      할인가 (Sale Price)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-lg p-3 font-bold text-lg text-blue-600 bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={formData.sale_price || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sale_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">
                      정상가 (Original)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-lg p-3 text-gray-500 bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      value={formData.original_price || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-red-600 flex items-center gap-2">
                      <ExternalLink size={14} />
                      쿠팡 비교 (Coupang)
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="쿠팡 상품 URL 입력..."
                        value={formData.coupang_url || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupang_url: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={handleCoupangFetch}
                        disabled={fetchingCoupang || !formData.coupang_url}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg px-4 flex items-center transition-colors"
                        title="가격 가져오기"
                      >
                        {fetchingCoupang ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <RefreshCw size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-medium text-red-800">
                      쿠팡 가격:
                    </span>
                    <input
                      type="number"
                      className="flex-1 bg-transparent border-none p-0 font-bold text-red-600 focus:ring-0 text-lg placeholder-red-300"
                      placeholder="0"
                      value={formData.coupang_price || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coupang_price: Number(e.target.value),
                        })
                      }
                    />
                    <span className="text-sm text-red-400">원</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    이미지 URL
                  </label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-10"
                        value={formData.image_url || ''}
                        placeholder="https://..."
                        onChange={(e) => {
                          const url = e.target.value.replace(
                            /^(https?:)\/\/+/,
                            '$1//'
                          );
                          setFormData({ ...formData, image_url: url });
                        }}
                      />
                    </div>
                    {formData.image_url && (
                      <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={formData.image_url}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 할인 옵션 섹션 */}
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    추가 혜택 (Option)
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 할인 옵션 선택 */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1 text-gray-500">
                        할인 수단
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                        value={formData.discount_option || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_option: e.target.value,
                          })
                        }
                      >
                        <option value="">선택안함</option>
                        <option value="gspay">💳 GS Pay/팝</option>
                        <option value="kakaopay">💛 카카오페이</option>
                        <option value="ncoupon">🎫 엔쿠폰</option>
                        <option value="gsmembership">⭐ GS멤버십</option>
                      </select>
                    </div>

                    {/* 할인 금액 */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-500">
                        할인 금액 표기
                      </label>
                      <input
                        type="text"
                        placeholder="예: 3,000원"
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                        value={formData.discount_amount_text || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_amount_text: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* 할인율 */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-500">
                        할인율 표기
                      </label>
                      <input
                        type="text"
                        placeholder="예: 10%"
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                        value={formData.discount_percent_text || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_percent_text: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      취소
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-[2] bg-black text-white py-3 rounded-lg hover:bg-gray-800 flex justify-center items-center gap-2 font-bold shadow-lg shadow-black/10 active:scale-[0.98] transition-all"
                  >
                    <Save size={18} />
                    {isEditing ? '수정 내용 저장' : '상품 등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
