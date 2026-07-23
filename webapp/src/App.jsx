import { useState, useMemo, useEffect } from 'react'
import TopBar from './components/TopBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductModal from './components/ProductModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import WishlistDrawer from './components/WishlistDrawer.jsx'
import OrderHistory from './components/OrderHistory.jsx'
import LoginCard from './components/logincard.tsx'
import SignUpCard from './components/SignUpCard.tsx'
import ProfileView from './components/ProfileView.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import { categories } from './data/products.js'
import { dbService } from './lib/dbService'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  
  // cart: array of { ...product, cartKey, qty }
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [activeModal, setActiveModal] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Supabase states
  const [user, setUser] = useState(null)
  const [productsList, setProductsList] = useState([])
  const [ordersList, setOrdersList] = useState([])
  const [viewMode, setViewMode] = useState('store') // 'store' | 'admin'
  const [loading, setLoading] = useState(true)
  const [checkoutAfterProfile, setCheckoutAfterProfile] = useState(false)

  // Prepend "All" and "New Products" to categories
  const storeCategories = useMemo(() => ['All', 'New Products', ...categories], [])

  useEffect(() => {
    async function initApp() {
      setLoading(true)
      try {
        // Fetch current active user session
        const currentUser = await dbService.getCurrentUser()
        setUser(currentUser)
        
        if (currentUser?.profile && !currentUser.profile.first_login_completed) {
          setActiveModal('profile')
        }

        // Fetch products and orders
        const productsData = await dbService.fetchProducts()
        setProductsList(productsData || [])

        const ordersData = await dbService.fetchOrders()
        setOrdersList(ordersData || [])
      } catch (err) {
        console.error('App init error:', err)
      } finally {
        setLoading(false)
      }
    }
    initApp()

    // Listen for Supabase auth changes (handles email confirmation redirect)
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const profile = await dbService.getProfile(session.user.id)
              const fullUser = { ...session.user, profile }
              setUser(fullUser)
              setViewMode('store')
              if (profile && !profile.first_login_completed) {
                setActiveModal('profile')
              }
              // Refresh orders for the newly logged in user
              const ordersData = await dbService.fetchOrders()
              setOrdersList(ordersData || [])
            } catch (err) {
              console.error('Auth state change error:', err)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setViewMode('store')
          }
        }
      )
      return () => subscription.unsubscribe()
    }
  }, [])

  async function refreshProducts() {
    try {
      const data = await dbService.fetchProducts()
      setProductsList(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function refreshOrders() {
    try {
      const data = await dbService.fetchOrders()
      setOrdersList(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const visibleProducts = useMemo(() => {
    let items = productsList

    if (activeCategory === 'New Products') {
      // Sort by created_at descending (newest first)
      items = [...productsList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (activeCategory !== 'All') {
      items = productsList.filter((p) => p.category === activeCategory)
    }

    if (!searchTerm.trim()) return items
    return items.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeCategory, searchTerm, productsList])

  // Derived cart items with qty merged
  const cartItems = useMemo(() => {
    const map = {}
    cart.forEach((p) => {
      const key = p.id
      if (map[key]) {
        map[key].qty += 1
      } else {
        map[key] = { ...p, cartKey: key, qty: 1 }
      }
    })
    return Object.values(map)
  }, [cart])

  const totalCartCount = cart.length

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.id)),
    [wishlist]
  )

  const customerOrders = useMemo(() => {
    if (!user) return []
    return ordersList.filter(o => o.user_id === user.id || o.email === user.email)
  }, [ordersList, user])

  function handleToggleWishlist(product) {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      return exists
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    })
  }

  function handleRemoveFromWishlist(productId) {
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  function handleMoveWishlistToCart(product) {
    handleAddToCart(product)
    handleRemoveFromWishlist(product.id)
  }

  async function handlePlaceOrder(orderObj) {
    try {
      const rawOrder = {
        user_id: user?.id || null,
        customer_name: orderObj.customer_name || 'Guest Customer',
        email: orderObj.email || user?.email || 'guest@example.com',
        shipping_address: orderObj.shipping_address || 'No Shipping Address',
        total_amount: orderObj.total,
        status: 'processing',
        orderNumber: orderObj.orderNumber,
        shipping: orderObj.shipping
      }
      
      await dbService.createOrder(rawOrder, orderObj.items)
      
      // Update local copy
      await refreshProducts()
      await refreshOrders()
    } catch (err) {
      console.error(err)
      alert('Checkout failed: ' + (err.message || err))
    }
  }

  function handleAddToCart(product) {
    setCart((prev) => [...prev, product])
  }

  function handleIncrement(cartKey) {
    const product = cartItems.find((i) => i.cartKey === cartKey)
    if (product) setCart((prev) => [...prev, { ...product, cartKey: undefined }])
  }

  function handleDecrement(cartKey) {
    setCart((prev) => {
      const idx = prev.findLastIndex ? prev.findLastIndex((p) => p.id === cartKey) : (() => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].id === cartKey) return i
        }
        return -1
      })()
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }

  function handleRemove(cartKey) {
    setCart((prev) => prev.filter((p) => p.id !== cartKey))
  }

  function handleClearCart() {
    setCart([])
  }

  function handleOpenModal(product) {
    setSelectedProduct(product)
    setActiveModal('product')
  }

  function handleCloseProductModal() {
    setSelectedProduct(null)
    setActiveModal(null)
  }

  async function handleLogout() {
    try {
      await dbService.signOut()
      setUser(null)
      setViewMode('store')
    } catch (err) {
      console.error(err)
    }
  }

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser)
    setViewMode('store')
    if (loggedInUser.profile && !loggedInUser.profile.first_login_completed) {
      // LoginCard closes itself after this callback; defer the reminder so it stays open.
      setTimeout(() => setActiveModal('profile'), 0)
    }
    // Reload items for the logged in user context
    refreshOrders()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-950" />
        <span className="text-xs uppercase font-bold tracking-widest text-zinc-400">Loading Studio Store...</span>
      </div>
    )
  }

  // Render Admin Dashboard layout
  if (user && user.profile?.role === 'admin' && viewMode === 'admin') {
    return (
      <>
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onGoToStore={() => setViewMode('store')}
          onProfileClick={() => setActiveModal('profile')}
        />
        {activeModal === 'profile' && (
          <ProfileView
            user={user}
            isFirstLogin={Boolean(user?.profile && !user.profile.first_login_completed)}
            onClose={() => setActiveModal(null)}
            onComplete={(updatedProfile) => {
              setUser(prev => ({ ...prev, profile: updatedProfile }))
              setActiveModal(null)
            }}
          />
        )}
      </>
    )
  }

  // Storefront Layout
  return (
    <>
      <TopBar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCartClick={() => setActiveModal('cart')}
        onWishlistClick={() => setActiveModal('wishlist')}
        onOrdersClick={() => setActiveModal('orders')}
        onLoginClick={() => setActiveModal('login')}
        onSignUpClick={() => setActiveModal('signup')}
        user={user}
        onLogout={handleLogout}
        onGoToAdmin={() => setViewMode('admin')}
        onProfileClick={() => setActiveModal('profile')}
      />
      <div className="shell">
        <Sidebar
          categories={storeCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        <div className="content-stack">
          <ProductGrid
            title={activeCategory}
            items={visibleProducts}
            onOpenModal={handleOpenModal}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        </div>
      </div>

      {/* Product Detail Modal */}
      {activeModal === 'product' && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onAddToCart={(p) => {
            handleAddToCart(p)
            handleCloseProductModal()
          }}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistIds.has(selectedProduct.id)}
        />
      )}

      {/* Cart Drawer */}
      {activeModal === 'cart' && (
        <CartDrawer
          cartItems={cartItems}
          onClose={() => setActiveModal(null)}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          onCheckout={() => {
            if (user?.profile && !user.profile.first_login_completed) {
              setCheckoutAfterProfile(true)
              setActiveModal('profile')
              return
            }
            setActiveModal('checkout')
          }}
        />
      )}

      {/* Checkout Modal */}
      {activeModal === 'checkout' && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={() => setActiveModal('cart')}
          onClearCart={handleClearCart}
          onPlaceOrder={handlePlaceOrder}
          user={user}
        />
      )}

      {/* Wishlist Drawer */}
      {activeModal === 'wishlist' && (
        <WishlistDrawer
          wishlist={wishlist}
          onClose={() => setActiveModal(null)}
          onRemove={handleRemoveFromWishlist}
          onMoveToCart={handleMoveWishlistToCart}
        />
      )}

      {/* Profile Page Modal */}
      {activeModal === 'profile' && (
        <ProfileView
          user={user}
          isFirstLogin={Boolean(user?.profile && !user.profile.first_login_completed)}
          onClose={() => {
            setCheckoutAfterProfile(false)
            setActiveModal(null)
          }}
          onComplete={(updatedProfile) => {
            setUser(prev => ({ ...prev, profile: updatedProfile }))
            setActiveModal(checkoutAfterProfile ? 'checkout' : null)
            setCheckoutAfterProfile(false)
          }}
        />
      )}

      {/* Order History */}
      {activeModal === 'orders' && (
        <OrderHistory
          orders={customerOrders}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Auth Modals */}
      {activeModal === 'login' && (
        <LoginCard
          onClose={() => setActiveModal(null)}
          onSwitchToSignUp={() => setActiveModal('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {activeModal === 'signup' && (
        <SignUpCard
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal('login')}
          onSignUpSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
}
