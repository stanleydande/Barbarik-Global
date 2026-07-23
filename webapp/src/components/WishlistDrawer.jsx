import { useEffect } from 'react'

export default function WishlistDrawer({ wishlist, onClose, onRemove, onMoveToCart }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Wishlist">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <h2>Wishlist</h2>
            {wishlist.length > 0 && (
              <span className="cart-drawer-count">{wishlist.length}</span>
            )}
          </div>
          <button className="close-button cart-close-btn" onClick={onClose} aria-label="Close wishlist">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cart-divider" />

        {/* Items */}
        <div className="cart-items-list">
          {wishlist.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p>Your wishlist is empty</p>
              <span>Save items you love for later</span>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="wishlist-item">
                <div className="cart-item-image">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <span className="cart-item-img-placeholder" />}
                </div>
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">£{item.price.toFixed(2)}</p>
                  <button
                    className="wishlist-move-btn"
                    onClick={() => onMoveToCart(item)}
                  >
                    Move to Cart
                  </button>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove from wishlist"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        {wishlist.length > 0 && (
          <div className="wishlist-footer">
            <div className="cart-divider" />
            <p className="wishlist-footer-note">
              Items in your wishlist are not reserved. Move them to cart to purchase.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
