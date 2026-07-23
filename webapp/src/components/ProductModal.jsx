import { useEffect, useState } from 'react'

export default function ProductModal({ product, onClose, onAddToCart, onToggleWishlist, isWishlisted }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleAdd() {
    if (product.stock === 0) return
    onAddToCart(product)
    onClose()
  }

  // Resolve images array
  const imageUrls = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image 
      ? [product.image, product.image, product.image]
      : []

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= (product.min_stock || 5)

  return (
    <div className="product-modal-shell" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="product-modal max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        <button className="close-button product-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Left Side: Product Gallery */}
        <div className="flex flex-col gap-4">
          <div className="product-modal-image w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center p-4">
            {imageUrls[activeImgIndex] ? (
              <img 
                src={imageUrls[activeImgIndex]} 
                alt={`${product.name} View ${activeImgIndex + 1}`} 
                className="w-full h-full object-contain transition-all duration-300"
              />
            ) : (
              <span className="text-zinc-400 text-sm">No Image View Available</span>
            )}
          </div>

          {/* 3 Thumbnails Strip */}
          {imageUrls.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.slice(0, 3).map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-full h-20 rounded-xl overflow-hidden bg-zinc-50 border-2 transition-all p-1 flex items-center justify-center ${
                    activeImgIndex === idx ? 'border-black scale-[1.02]' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="product-modal-info flex flex-col justify-between py-2">
          <div>
            <p className="product-modal-eyebrow text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Studio Collection</p>
            <h2 className="product-modal-name text-2xl font-bold tracking-tight mt-1">{product.name}</h2>
            <p className="product-modal-price text-lg font-semibold mt-1">£{parseFloat(product.price).toFixed(2)}</p>
            <p className="product-modal-description text-sm text-zinc-500 leading-relaxed mt-4">{product.description}</p>
            
            {/* Live Stock Display */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-zinc-400">Availability:</span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">Only {product.stock} items left (Low Stock)</span>
              ) : (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">{product.stock} units available</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="product-modal-actions flex gap-3">
              <button 
                className={`product-modal-add-btn flex-1 h-12 font-semibold text-sm transition-all rounded-full flex items-center justify-center border-none ${
                  isOutOfStock 
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-zinc-800 active:scale-[0.98]'
                }`} 
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button
                className={`product-modal-wish-btn w-12 h-12 rounded-full border border-zinc-200 hover:border-black flex items-center justify-center bg-transparent transition-all ${
                  isWishlisted ? 'text-black bg-zinc-50 border-black' : 'text-zinc-500 hover:text-black'
                }`}
                onClick={() => onToggleWishlist(product)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            <p className="product-modal-note text-[11px] text-zinc-400 text-center mt-3">Free shipping on orders over £100</p>
          </div>
        </div>
      </div>
    </div>
  )
}
