export default function ProductCard({ product, onOpenModal, onToggleWishlist, isWishlisted }) {
  const primaryImage = product.image || product.image_url || product.images?.[0]

  function handleHeartClick(e) {
    e.stopPropagation()
    onToggleWishlist(product)
  }

  return (
    <div
      className="product-card"
      onClick={() => onOpenModal(product)}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenModal(product)
        }
      }}
    >
      <div className="product-image">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} />
        ) : (
          <span>Image</span>
        )}

        {/* Wishlist heart */}
        <button
          className={`product-heart-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <div className="product-image-overlay">
          <span>Quick View</span>
        </div>
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">£{product.price.toFixed(2)}</div>
    </div>
  )
}
