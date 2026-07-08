export default function ProductCard({ product, onAddToCart }) {
  return (
    <div
      className="product-card"
      onClick={() => onAddToCart(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAddToCart(product)
        }
      }}
    >
      <div className="product-image">
        Image
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">£{product.price.toFixed(2)}</div>
    </div>
  )
}
