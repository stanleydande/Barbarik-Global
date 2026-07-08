import { useState, useMemo } from 'react'
import TopBar from './components/TopBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import LoginCard from './components/logincard.tsx'
import SignUpCard from './components/SignUpCard.tsx'
import { categories, products } from './data/products.js'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Hats')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [activeModal, setActiveModal] = useState(null)

  const visibleProducts = useMemo(() => {
    const items = products[activeCategory] || []
    if (!searchTerm.trim()) return items
    return items.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeCategory, searchTerm])

  function handleAddToCart(product) {
    setCart((prev) => [...prev, product])
  }

  return (
    <>
      <TopBar
        cartCount={cart.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLoginClick={() => setActiveModal('login')}
        onSignUpClick={() => setActiveModal('signup')}
      />
      <div className="shell">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        <div className="content-stack">
          <ProductGrid
            title={activeCategory}
            items={visibleProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
      {activeModal === 'login' && (
        <LoginCard
          onClose={() => setActiveModal(null)}
          onSwitchToSignUp={() => setActiveModal('signup')}
        />
      )}
      {activeModal === 'signup' && (
        <SignUpCard
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      )}
    </>
  )
}
