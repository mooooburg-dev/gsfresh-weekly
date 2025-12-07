'use client'

import { useState, useEffect } from 'react'
import { supabase, type Product, type Flyer } from '@/lib/supabase'
import { fetchCoupangPrice } from './actions'
import { 
  Search, 
  Plus, 
  Save, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

export default function AdminPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [selectedFlyerId, setSelectedFlyerId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sale_price: 0,
    original_price: 0,
    coupang_url: '',
    coupang_price: 0,
    image_url: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [fetchingCoupang, setFetchingCoupang] = useState(false)

  useEffect(() => {
    fetchFlyers()
  }, [])

  useEffect(() => {
    if (selectedFlyerId) {
      fetchProducts(selectedFlyerId)
    }
  }, [selectedFlyerId])

  async function fetchFlyers() {
    const { data, error } = await supabase
      .from('gsfresh_weekly_flyers')
      .select('*')
      .order('week_start', { ascending: false })
    
    if (data && data.length > 0) {
      setFlyers(data)
      // Default to the most recent flyer
      if (!selectedFlyerId) setSelectedFlyerId(data[0].id)
    }
  }

  async function fetchProducts(flyerId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('gsfresh_weekly_products')
      .select('*')
      .eq('flyer_id', flyerId)
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleCoupangFetch = async () => {
    if (!formData.coupang_url) return
    setFetchingCoupang(true)
    try {
      const result = await fetchCoupangPrice(formData.coupang_url)
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          coupang_price: result.price || prev.coupang_price,
          // If we got an image and don't have one, maybe suggest it?
          // For now let's just alert or log, or auto-fill if empty
          image_url: prev.image_url || ((result.image && result.image.startsWith('//')) ? 'https:' + result.image : result.image) || prev.image_url
        }))
        alert(`Price fetched: ${result.price}`)
      } else {
        alert('Could not fetch price automatically. Please enter manually.')
      }
    } catch (e) {
      alert('Error fetching price')
    }
    setFetchingCoupang(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFlyerId) return alert('No flyer selected')

    const productData = {
      ...formData,
      flyer_id: selectedFlyerId,
      // Ensure numeric
      original_price: Number(formData.original_price) || null,
      sale_price: Number(formData.sale_price) || 0,
      coupang_price: Number(formData.coupang_price) || null,
    }

    if (isEditing && formData.id) {
        const { error } = await supabase
            .from('gsfresh_weekly_products')
            .update(productData)
            .eq('id', formData.id)
        if (error) alert('Error updating: ' + error.message)
        else {
            fetchProducts(selectedFlyerId)
            resetForm()
        }
    } else {
        const { error } = await supabase
            .from('gsfresh_weekly_products')
            .insert([productData])
        if (error) alert('Error creating: ' + error.message)
        else {
            fetchProducts(selectedFlyerId)
            resetForm()
        }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sale_price: 0,
      original_price: 0,
      coupang_url: '',
      coupang_price: 0,
      image_url: ''
    })
    setIsEditing(false)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('gsfresh_weekly_products').delete().eq('id', id)
    if (selectedFlyerId) fetchProducts(selectedFlyerId)
  }

  const editProduct = (p: Product) => {
    setFormData(p)
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">상품 관리 (Admin)</h1>
            <div className="flex gap-2">
                <select 
                    className="border border-gray-300 rounded p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedFlyerId || ''}
                    onChange={(e) => setSelectedFlyerId(e.target.value)}
                >
                    {flyers.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.week_start} ~ {f.week_end}
                        </option>
                    ))}
                </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Image</th>
                        <th className="p-4 font-semibold text-gray-600">Product</th>
                        <th className="p-4 font-semibold text-gray-600">GS Price</th>
                        <th className="p-4 font-semibold text-gray-600">Coupang</th>
                        <th className="p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <ImageIcon size={16} className="text-gray-400" />
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{product.name}</div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-blue-600">{product.sale_price?.toLocaleString()}원</div>
                                {product.original_price && (
                                    <div className="text-xs text-gray-400 line-through">{product.original_price.toLocaleString()}</div>
                                )}
                            </td>
                            <td className="p-4">
                                {product.coupang_price ? (
                                    <div className="font-bold text-red-600">
                                        {product.coupang_price.toLocaleString()}원
                                        {product.sale_price && product.coupang_price && (
                                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${product.sale_price < product.coupang_price ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.sale_price < product.coupang_price ? 'WIN' : 'LOSE'}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                                {product.coupang_url && (
                                    <a href={product.coupang_url} target="_blank" className="text-xs text-blue-500 hover:underline block mt-1">Link &rarr;</a>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button onClick={() => editProduct(product)} className="p-1 hover:bg-gray-200 rounded text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => deleteProduct(product.id)} className="p-1 hover:bg-gray-200 rounded text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No products found. Add one!</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-8">
            <h2 className="text-lg font-bold mb-4">{isEditing ? '상품 수정' : '상품 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">상품명 (Product Name)</label>
                    <input 
                        className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">할인가 (Sale Price)</label>
                        <input 
                            type="number"
                            className="w-full border border-gray-300 rounded p-2 font-bold text-blue-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.sale_price || 0}
                            onChange={e => setFormData({...formData, sale_price: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">정상가 (Original)</label>
                        <input 
                            type="number"
                            className="w-full border border-gray-300 rounded p-2 text-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.original_price || 0}
                            onChange={e => setFormData({...formData, original_price: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium mb-1 text-red-600">쿠팡 비교 (Coupang)</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="https://coupang.com/..."
                            value={formData.coupang_url || ''}
                            onChange={e => setFormData({...formData, coupang_url: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={handleCoupangFetch}
                            disabled={fetchingCoupang || !formData.coupang_url}
                            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded px-3 flex items-center transition-colors"
                            title="Fetch Price"
                        >
                            {fetchingCoupang ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-700">쿠팡 가격:</span>
                         <input 
                            type="number"
                            className="flex-1 border border-gray-300 rounded p-2 font-bold text-red-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.coupang_price || 0}
                            onChange={e => setFormData({...formData, coupang_price: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium mb-1 text-gray-700">이미지 URL</label>
                    <div className="flex gap-2">
                        <input 
                            className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.image_url || ''}
                            onChange={e => setFormData({...formData, image_url: e.target.value})}
                        />
                        {formData.image_url && (
                             <img src={formData.image_url} className="w-10 h-10 object-cover rounded border border-gray-200" />
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 flex justify-center items-center gap-2">
                        <Save size={18} />
                        {isEditing ? '수정 완료' : '등록'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">
                            취소
                        </button>
                    )}
                </div>

            </form>
        </div>
      </div>
    </div>
  )
}
