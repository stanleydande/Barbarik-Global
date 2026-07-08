import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ title, items, onAddToCart }) {
  return (
    <main>
      <h1 className="page-title">{title}</h1>
      <div className="product-grid">
        {items.length === 0 ? (
          <p>No products found.</p>
        ) : (
          items.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))
        )}
      </div>
    </main>
  )
}
