import { useEffect } from 'react'

const STATUS_CONFIG = {
  processing: { label: 'Processing', color: '#b07d00', bg: '#fff8e6' },
  shipped:    { label: 'Shipped',    color: '#0a5fbf', bg: '#e8f1ff' },
  delivered:  { label: 'Delivered', color: '#1a7a3f', bg: '#e8f7ee' },
  cancelled:  { label: 'Cancelled', color: '#c0392b', bg: '#fdecea' },
}

function OrderCard({ order }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing

  return (
    <div className="order-card">
      {/* Order header */}
      <div className="order-card-header">
        <div className="order-card-meta">
          <span className="order-number">Order #{order.orderNumber}</span>
          <span className="order-date">{new Date(order.date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}</span>
        </div>
        <span
          className="order-status-badge"
          style={{ color: status.color, background: status.bg }}
        >
          {status.label}
        </span>
      </div>

      {/* Items preview */}
      <div className="order-items-preview">
        {order.items.slice(0, 4).map((item, i) => (
          <div
            key={item.cartKey || i}
            className="order-item-thumb"
            title={item.name}
          >
            {item.image
              ? <img src={item.image} alt={item.name} />
              : <span className="order-thumb-placeholder" />}
            {item.qty > 1 && (
              <span className="order-thumb-qty">×{item.qty}</span>
            )}
          </div>
        ))}
        {order.items.length > 4 && (
          <div className="order-item-thumb order-thumb-more">
            +{order.items.length - 4}
          </div>
        )}
      </div>

      {/* Item names */}
      <div className="order-item-names">
        {order.items.map((item, i) => (
          <span key={item.cartKey || i} className="order-item-name-tag">
            {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="order-card-footer">
        <div className="order-delivery">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span>{order.shipping || 'Standard Delivery'}</span>
        </div>
        <span className="order-total">£{order.total.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default function OrderHistory({ orders, onClose }) {
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
      <aside className="cart-drawer orders-drawer" role="dialog" aria-modal="true" aria-label="Order history">
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <h2>Order History</h2>
            {orders.length > 0 && (
              <span className="cart-drawer-count">{orders.length}</span>
            )}
          </div>
          <button className="close-button cart-close-btn" onClick={onClose} aria-label="Close orders">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cart-divider" />

        <div className="cart-items-list orders-list">
          {orders.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p>No orders yet</p>
              <span>Your completed orders will appear here</span>
            </div>
          ) : (
            [...orders].reverse().map((order) => (
              <OrderCard key={order.orderNumber} order={order} />
            ))
          )}
        </div>
      </aside>
    </>
  )
}
