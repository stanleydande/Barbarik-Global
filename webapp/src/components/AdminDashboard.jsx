import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Package, 
  ShoppingCart, 
  Bell, 
  LogOut, 
  Eye, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ArrowLeft,
  RefreshCw,
  Sliders,
  DollarSign,
  Loader2
} from 'lucide-react'
import { dbService } from '../lib/dbService'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import AddProductModal from './AddProductModal'

export default function AdminDashboard({ user, onLogout, onGoToStore, onProfileClick }) {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders' | 'notifications'
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  
  // Searches
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  
  // Modals
  const [showAddProduct, setShowAddProduct] = useState(false)
  
  // Loading & statuses
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // holds product/order ID being processed
  const [restockAmount, setRestockAmount] = useState({}) // product id -> amount to restock

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const fetchedProducts = await dbService.fetchProducts()
      const fetchedOrders = await dbService.fetchOrders()
      setProducts(fetchedProducts || [])
      setOrders(fetchedOrders || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRestock(productId, qty) {
    const amt = parseInt(qty)
    if (isNaN(amt) || amt <= 0) return
    
    setActionLoading(productId)
    try {
      const prod = products.find(p => p.id === productId)
      if (!prod) return
      
      const newStock = prod.stock + amt
      const updated = await dbService.updateProductStock(productId, newStock)
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? updated : p))
      setRestockAmount(prev => ({ ...prev, [productId]: '' }))
    } catch (err) {
      console.error(err)
      alert('Failed to update stock level.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    setActionLoading(orderId)
    try {
      const updated = await dbService.updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
    } catch (err) {
      console.error(err)
      alert('Failed to update order status.')
    } finally {
      setActionLoading(null)
    }
  }

  function handleProductAdded(newProduct) {
    setProducts(prev => [newProduct, ...prev])
  }

  // Dashboard Stats Calculations
  const totalProducts = products.length
  
  const lowStockProducts = products.filter(p => p.stock <= p.min_stock)
  const lowStockCount = lowStockProducts.length

  const totalOrdersCount = orders.length
  
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  // Filtering
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toString().includes(orderSearch) ||
    o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.email.toLowerCase().includes(orderSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Mock Mode Banner */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-500 text-white text-xs py-2.5 px-4 font-semibold tracking-wide flex items-center justify-between shadow-sm animate-pulse z-40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Running in Mock Demo Mode (Supabase keys are missing. Data is preserved in LocalStorage).</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Demo Mode</span>
        </div>
      )}

      {/* Main Admin layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white p-6 flex flex-col justify-between border-r border-zinc-900">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-white rounded-full flex items-center justify-center font-bold tracking-wider text-sm bg-zinc-900">
                ST
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-sm">STUDIO</h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'products' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'orders' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Orders</span>
                {orders.filter(o => o.status === 'processing').length > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-white text-black text-[10px] font-bold">
                    {orders.filter(o => o.status === 'processing').length}
                  </Badge>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'notifications' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {lowStockCount > 0 && (
                  <Badge variant="destructive" className="ml-auto bg-red-600 text-white text-[10px] font-bold animate-bounce">
                    {lowStockCount}
                  </Badge>
                )}
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="flex flex-col gap-4 border-t border-zinc-900 pt-6">
            <button
              onClick={onGoToStore}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-950 transition-colors uppercase tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View Storefront</span>
            </button>

            <div className="flex items-center gap-3 px-2 py-1">
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-3 px-2 py-1 rounded-xl text-left hover:bg-zinc-900 transition-colors"
              title="Open profile"
            >
              <Avatar className="w-9 h-9 border border-zinc-800">
                <AvatarImage src={user?.profile?.avatar_url || ''} />
                <AvatarFallback className="bg-zinc-800 text-white text-xs uppercase font-bold">
                  {user?.profile?.full_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.profile?.full_name || 'Admin User'}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'admin@studio.com'}</p>
              </div>
            </button>
              <button 
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard Area */}
        <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto max-h-screen">
          {/* Header Stats */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">Dashboard Overview</h2>
              <p className="text-xs text-zinc-500">Real-time statistics and catalogue inventory management.</p>
            </div>
            <Button 
              onClick={fetchDashboardData} 
              variant="outline" 
              className="rounded-full bg-white border-zinc-200 text-xs font-bold flex items-center gap-1.5 py-1.5 h-auto hover:bg-zinc-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Data
            </Button>
          </div>

          {/* Analytics Widgets */}
          <div className="grid grid-cols-4 gap-5">
            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
              <div className="p-3.5 bg-green-50 text-green-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Revenue</span>
                <h3 className="text-xl font-bold mt-0.5">£{totalSales.toFixed(2)}</h3>
              </div>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Orders</span>
                <h3 className="text-xl font-bold mt-0.5">{totalOrdersCount}</h3>
              </div>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm p-5 flex items-center gap-4 ${lowStockCount > 0 ? 'bg-red-50 text-red-900' : 'bg-white'}`}>
              <div className={`p-3.5 rounded-xl ${lowStockCount > 0 ? 'bg-red-200 text-red-700' : 'bg-zinc-50 text-zinc-600'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Low Stock Alerts</span>
                <h3 className="text-xl font-bold mt-0.5">{lowStockCount} items</h3>
              </div>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Catalogue Items</span>
                <h3 className="text-xl font-bold mt-0.5">{totalProducts} products</h3>
              </div>
            </Card>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading Dashboard...</span>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex-1 overflow-hidden flex flex-col">
              
              {/* Tab 1: Products Panel */}
              {activeTab === 'products' && (
                <div className="flex flex-col flex-1">
                  <div className="p-5 border-b border-zinc-100 flex justify-between items-center gap-4 bg-zinc-50/50">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <Input
                        placeholder="Search products or category..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="pl-9 rounded-xl bg-white border-zinc-200 text-xs"
                      />
                    </div>
                    <Button 
                      onClick={() => setShowAddProduct(true)}
                      className="bg-black text-white hover:bg-zinc-800 rounded-full px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </Button>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          <th className="p-4 pl-6">Product</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock Status</th>
                          <th className="p-4">Threshold</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center p-8 text-zinc-400">
                              No products found. Add a product to get started.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map(prod => {
                            const isLowStock = prod.stock <= prod.min_stock
                            const isOutOfStock = prod.stock === 0

                            return (
                              <tr key={prod.id} className="hover:bg-zinc-50/30">
                                <td className="p-4 pl-6 flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center flex-shrink-0">
                                    {prod.images?.[0] ? (
                                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <Package className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-zinc-950 block">{prod.name}</span>
                                    <span className="text-[10px] text-zinc-400 truncate max-w-[200px] block">{prod.description}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-medium text-zinc-600">{prod.category}</td>
                                <td className="p-4 font-semibold">£{parseFloat(prod.price).toFixed(2)}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">{prod.stock} units</span>
                                    {isOutOfStock ? (
                                      <Badge className="bg-red-100 hover:bg-red-100 text-red-700 text-[9px] font-bold border-none px-2 rounded-md">Out of Stock</Badge>
                                    ) : isLowStock ? (
                                      <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-700 text-[9px] font-bold border-none px-2 rounded-md">Low Stock</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 hover:bg-green-100 text-green-700 text-[9px] font-bold border-none px-2 rounded-md">Healthy</Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 font-medium text-zinc-400">{prod.min_stock} units</td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Input
                                      type="number"
                                      placeholder="+10"
                                      value={restockAmount[prod.id] || ''}
                                      onChange={e => setRestockAmount(prev => ({ ...prev, [prod.id]: e.target.value }))}
                                      className="w-14 h-8 text-center text-xs rounded-xl border-zinc-200"
                                    />
                                    <Button
                                      onClick={() => handleRestock(prod.id, restockAmount[prod.id] || 10)}
                                      disabled={actionLoading === prod.id}
                                      variant="outline"
                                      className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-bold h-8 px-4 flex items-center justify-center gap-1 border-none"
                                    >
                                      {actionLoading === prod.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        'Restock'
                                      )}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders Panel */}
              {activeTab === 'orders' && (
                <div className="flex flex-col flex-1">
                  <div className="p-5 border-b border-zinc-100 flex justify-between items-center gap-4 bg-zinc-50/50">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <Input
                        placeholder="Search by customer name or order number..."
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        className="pl-9 rounded-xl bg-white border-zinc-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          <th className="p-4 pl-6">Order ID & Date</th>
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Shipping Address</th>
                          <th className="p-4">Items Ordered</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4 pr-6 text-right">Order Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center p-8 text-zinc-400">
                              No orders found.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map(order => {
                            return (
                              <tr key={order.id} className="hover:bg-zinc-50/30">
                                <td className="p-4 pl-6">
                                  <span className="font-bold text-zinc-950 block">#{order.orderNumber}</span>
                                  <span className="text-[10px] text-zinc-400 block">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-zinc-800 block">{order.customer_name}</span>
                                  <span className="text-[10px] text-zinc-400 block">{order.email}</span>
                                </td>
                                <td className="p-4 max-w-[200px] truncate text-zinc-500 font-medium" title={order.shipping_address}>
                                  {order.shipping_address}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-0.5">
                                    {order.order_items?.map((item, idx) => (
                                      <span key={item.id || idx} className="text-[10.5px] text-zinc-600 font-medium">
                                        • {item.product_name} <span className="text-zinc-400 font-semibold text-[10px]">x{item.qty}</span>
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-sm">£{parseFloat(order.total_amount).toFixed(2)}</td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {actionLoading === order.id && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                                    )}
                                    <select
                                      value={order.status}
                                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                      disabled={actionLoading === order.id}
                                      className="text-xs font-semibold rounded-lg bg-zinc-50 border border-zinc-200 px-2 py-1 focus:ring-0 focus:outline-none"
                                    >
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Notifications Panel */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col flex-1 p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-bold">Restock Alerts</h3>
                    <p className="text-xs text-zinc-500">Products currently below or at their configured minimum stock warning limit.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {lowStockProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">All Stocks Healthy</span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">No products have triggered restock warnings.</p>
                      </div>
                    ) : (
                      lowStockProducts.map(prod => {
                        const unitsNeeded = prod.min_stock - prod.stock + 10 // recommended stock replenishment
                        
                        return (
                          <div 
                            key={prod.id} 
                            className="flex items-center justify-between p-4 bg-red-50/50 border border-red-200/80 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                              </div>
                              <div>
                                <span className="font-bold text-zinc-950 text-xs block">{prod.name} ({prod.category})</span>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                  Current Stock: <strong className="text-red-600 font-bold">{prod.stock}</strong> units. 
                                  Threshold Alert level is <strong>{prod.min_stock}</strong>.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleRestock(prod.id, unitsNeeded)}
                                disabled={actionLoading === prod.id}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-bold h-8 px-4 flex items-center justify-center gap-1 border-none shadow-sm"
                              >
                                {actionLoading === prod.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" /> Quick Restock +{unitsNeeded} Units
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}
    </div>
  )
}
