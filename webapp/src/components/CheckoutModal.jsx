import { useState, useEffect } from 'react'

const STEPS = ['Delivery', 'Payment', 'Confirmation']

function StepIndicator({ current }) {
  return (
    <div className="checkout-steps">
      {STEPS.map((step, i) => (
        <div key={step} className={`checkout-step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
          <div className="checkout-step-circle">
            {i < current
              ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span>{i + 1}</span>}
          </div>
          <span className="checkout-step-label">{step}</span>
          {i < STEPS.length - 1 && <div className="checkout-step-line" />}
        </div>
      ))}
    </div>
  )
}

function DeliveryStep({ data, onChange, onNext }) {
  const fields = [
    { id: 'firstName', label: 'First Name', type: 'text', half: true },
    { id: 'lastName', label: 'Last Name', type: 'text', half: true },
    { id: 'email', label: 'Email Address', type: 'email', half: false },
    { id: 'phone', label: 'Phone Number', type: 'tel', half: false },
    { id: 'address', label: 'Street Address', type: 'text', half: false },
    { id: 'city', label: 'City', type: 'text', half: true },
    { id: 'postcode', label: 'Postcode', type: 'text', half: true },
    { id: 'country', label: 'Country', type: 'text', half: false },
  ]

  function handleSubmit(e) {
    e.preventDefault()
    onNext()
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <h3 className="checkout-section-title">Delivery Details</h3>
      <div className="checkout-fields">
        {fields.map(f => (
          <div key={f.id} className={`field ${f.half ? 'field-half' : ''}`}>
            <label htmlFor={`checkout-${f.id}`}>{f.label}</label>
            <input
              id={`checkout-${f.id}`}
              type={f.type}
              required
              value={data[f.id] || ''}
              onChange={e => onChange(f.id, e.target.value)}
              placeholder={f.label}
            />
          </div>
        ))}
      </div>
      <div className="checkout-shipping-options">
        <h3 className="checkout-section-title" style={{ marginBottom: '12px' }}>Shipping Method</h3>
        {[
          { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', price: '£8.50' },
          { id: 'express', label: 'Express Delivery', desc: '1–2 business days', price: '£14.00' },
          { id: 'free', label: 'Free Shipping', desc: 'Orders over £100 · 5–7 business days', price: 'Free' },
        ].map(opt => (
          <label key={opt.id} className={`shipping-option ${data.shipping === opt.id ? 'selected' : ''}`}>
            <input
              type="radio"
              name="shipping"
              value={opt.id}
              checked={data.shipping === opt.id}
              onChange={() => onChange('shipping', opt.id)}
            />
            <div className="shipping-option-info">
              <span className="shipping-option-label">{opt.label}</span>
              <span className="shipping-option-desc">{opt.desc}</span>
            </div>
            <span className="shipping-option-price">{opt.price}</span>
          </label>
        ))}
      </div>
      <button type="submit" className="checkout-next-btn">
        Continue to Payment
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  )
}

function PaymentStep({ data, onChange, onNext, onBack }) {
  function formatCard(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(val) {
    return val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
  }

  function handleSubmit(e) {
    e.preventDefault()
    onNext()
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <h3 className="checkout-section-title">Payment Details</h3>

      <div className="payment-card-preview">
        <div className="payment-card-chip">
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <rect x="0.5" y="0.5" width="27" height="21" rx="3.5" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.1)"/>
            <rect x="8" y="7" width="12" height="8" rx="1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
            <line x1="14" y1="7" x2="14" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
            <line x1="8" y1="11" x2="20" y2="11" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          </svg>
        </div>
        <p className="payment-card-number">{data.cardNumber || '•••• •••• •••• ••••'}</p>
        <div className="payment-card-meta">
          <span>{data.cardName || 'CARD HOLDER'}</span>
          <span>{data.expiry || 'MM/YY'}</span>
        </div>
      </div>

      <div className="checkout-fields">
        <div className="field">
          <label htmlFor="checkout-cardNumber">Card Number</label>
          <input
            id="checkout-cardNumber"
            type="text"
            inputMode="numeric"
            required
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            value={data.cardNumber || ''}
            onChange={e => onChange('cardNumber', formatCard(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="checkout-cardName">Name on Card</label>
          <input
            id="checkout-cardName"
            type="text"
            required
            placeholder="Full Name"
            value={data.cardName || ''}
            onChange={e => onChange('cardName', e.target.value.toUpperCase())}
          />
        </div>
        <div className="field field-half">
          <label htmlFor="checkout-expiry">Expiry Date</label>
          <input
            id="checkout-expiry"
            type="text"
            required
            maxLength={5}
            placeholder="MM/YY"
            value={data.expiry || ''}
            onChange={e => onChange('expiry', formatExpiry(e.target.value))}
          />
        </div>
        <div className="field field-half">
          <label htmlFor="checkout-cvv">CVV</label>
          <input
            id="checkout-cvv"
            type="text"
            inputMode="numeric"
            required
            maxLength={4}
            placeholder="•••"
            value={data.cvv || ''}
            onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>
      </div>

      <div className="checkout-secure-note">
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <path d="M6 0L0.5 2.5V6.5C0.5 9.64 2.88 12.6 6 13.5C9.12 12.6 11.5 9.64 11.5 6.5V2.5L6 0Z" fill="currentColor"/>
        </svg>
        <span>Your payment information is encrypted and secure</span>
      </div>

      <div className="checkout-btn-row">
        <button type="button" className="checkout-back-btn" onClick={onBack}>← Back</button>
        <button type="submit" className="checkout-next-btn" style={{ flex: 1 }}>
          Place Order
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </form>
  )
}

function ConfirmationStep({ orderNumber, onClose }) {
  return (
    <div className="checkout-confirmation">
      <div className="checkout-confirm-icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="var(--black)" strokeWidth="1.5"/>
          <path d="M10 18l5.5 5.5 10-11" stroke="var(--black)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="checkout-confirm-title">Order Confirmed!</h3>
      <p className="checkout-confirm-sub">
        Thank you for your order. We've received your payment and will begin processing immediately.
      </p>
      <div className="checkout-confirm-order">
        <span>Order Number</span>
        <strong>#{orderNumber}</strong>
      </div>
      <p className="checkout-confirm-note">
        A confirmation email will be sent to your email address shortly.
      </p>
      <button className="checkout-next-btn" style={{ marginTop: '8px' }} onClick={onClose}>
        Continue Shopping
      </button>
    </div>
  )
}

export default function CheckoutModal({ cartItems, onClose, onClearCart, onPlaceOrder, user }) {
  const [step, setStep] = useState(0)
  
  const [delivery, setDelivery] = useState(() => {
    const defaultData = { shipping: 'standard' }
    if (user && user.profile) {
      const nameParts = (user.profile.full_name || '').split(' ')
      defaultData.firstName = nameParts[0] || ''
      defaultData.lastName = nameParts.slice(1).join(' ') || ''
      defaultData.email = user.email || ''
      
      const addr = user.profile.shipping_address || ''
      const parts = addr.split(',').map(s => s.trim())
      if (parts.length >= 4) {
        defaultData.address = parts[0] || ''
        defaultData.city = parts[1] || ''
        defaultData.postcode = parts[2] || ''
        defaultData.country = parts[3] || ''
      } else {
        defaultData.address = addr
      }
    }
    return defaultData
  })

  const [payment, setPayment] = useState({})
  const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000))

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingCost = delivery.shipping === 'express' ? 14 : delivery.shipping === 'free' ? 0 : 8.5
  const total = subtotal + shippingCost

  const shippingLabels = {
    standard: 'Standard Delivery',
    express: 'Express Delivery',
    free: 'Free Shipping',
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && step < 2) onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, step])

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && step < 2) onClose()
  }

  function handlePlaceOrder() {
    onPlaceOrder?.({
      orderNumber,
      date: new Date().toISOString(),
      items: cartItems,
      total,
      shipping: shippingLabels[delivery.shipping] || 'Standard Delivery',
      status: 'processing',
      customer_name: `${delivery.firstName || ''} ${delivery.lastName || ''}`.trim(),
      email: delivery.email || user?.email || '',
      shipping_address: `${delivery.address || ''}, ${delivery.city || ''}, ${delivery.postcode || ''}, ${delivery.country || ''}`.trim().replace(/^,|,$/g, '').trim()
    })
    setStep(2)
    onClearCart()
  }

  function handleClose() {
    setStep(0)
    onClose()
  }

  return (
    <div className="checkout-shell" onClick={handleBackdropClick}>
      <div className="checkout-modal">
        {/* Close */}
        {step < 2 && (
          <button className="close-button checkout-close-btn" onClick={onClose} aria-label="Close checkout">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Left – form */}
        <div className="checkout-left">
          <div className="checkout-brand">Studio</div>
          <StepIndicator current={step} />

          {step === 0 && (
            <DeliveryStep
              data={delivery}
              onChange={(k, v) => setDelivery(p => ({ ...p, [k]: v }))}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <PaymentStep
              data={payment}
              onChange={(k, v) => setPayment(p => ({ ...p, [k]: v }))}
              onNext={handlePlaceOrder}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ConfirmationStep orderNumber={orderNumber} onClose={handleClose} />
          )}
        </div>

        {/* Right – order summary */}
        {step < 2 && (
          <div className="checkout-right">
            <h3 className="checkout-summary-title">Order Summary</h3>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.cartKey} className="checkout-summary-item">
                  <div className="checkout-summary-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} />
                      : <span />}
                    <span className="checkout-summary-qty">{item.qty}</span>
                  </div>
                  <div className="checkout-summary-info">
                    <p>{item.name}</p>
                  </div>
                  <p className="checkout-summary-price">£{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="checkout-summary-totals">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className="cart-free">Free</span> : `£${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="cart-divider" style={{ margin: '12px 0' }} />
              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
