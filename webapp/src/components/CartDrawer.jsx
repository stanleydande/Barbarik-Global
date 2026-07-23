import { useEffect } from 'react'

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.image
          ? <img src={item.image} alt={item.name} />
          : <span className="cart-item-img-placeholder" />}
      </div>
      <div className="cart-item-details">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-price">£{(item.price * item.qty).toFixed(2)}</p>
        <div className="cart-item-qty">
          <button className="qty-btn" onClick={() => onDecrement(item.cartKey)} aria-label="Decrease quantity">−</button>
          <span className="qty-value">{item.qty}</span>
          <button className="qty-btn" onClick={() => onIncrement(item.cartKey)} aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button className="cart-item-remove" onClick={() => onRemove(item.cartKey)} aria-label="Remove item">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export default function CartDrawer({ cartItems, onClose, onIncrement, onDecrement, onRemove, onCheckout }) {
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const shipping = subtotal >= 100 ? 0 : 8.5
  const total = subtotal + shipping

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
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
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <h2>Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="cart-drawer-count">{cartItems.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </div>
          <button className="close-button cart-close-btn" onClick={onClose} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="cart-divider" />

        {/* Items */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Your cart is empty</p>
              <span>Add some items to get started</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.cartKey}
                item={item}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-divider" />
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="cart-free">Free</span> : `£${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 100 && (
                <p className="cart-shipping-note">
                  Add £{(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="cart-divider" style={{ margin: '12px 0' }} />
              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
            <button className="cart-checkout-btn" onClick={onCheckout}>
              Checkout
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="cart-continue-btn" onClick={onClose}>Continue Shopping</button>
          </div>
        )}
      </aside>
    </>
  )
}
