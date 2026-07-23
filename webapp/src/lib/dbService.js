import { supabase, isSupabaseConfigured } from './supabaseClient'

// Mock state stored in localStorage for fallback
const getMockStorage = (key, defaultVal) => {
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : defaultVal
}

const setMockStorage = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val))
}

// The database stores product photos as an array, while storefront surfaces use
// a primary image. Keep both shapes available so every product view has a URL.
const normalizeProductImages = (product) => {
  let images = product?.images
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images)
    } catch {
      images = [images]
    }
  }

  const validImages = Array.isArray(images)
    ? images.filter((url) => typeof url === 'string' && url.trim())
    : []
  const primaryImage = product?.image || product?.image_url || product?.thumbnail_url || validImages[0] || ''

  return {
    ...product,
    image: primaryImage,
    images: validImages.length ? validImages : (primaryImage ? [primaryImage] : [])
  }
}

export const dbService = {
  // Auth & Profile
  async signUp(email, password, fullName) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) throw error
      return data
    } else {
      const users = getMockStorage('mock_users', [])
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists')
      }
      const newUser = {
        id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
        email,
        full_name: fullName,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
        first_login_completed: false,
        shipping_address: '',
        avatar_url: ''
      }
      users.push(newUser)
      setMockStorage('mock_users', users)
      
      // Store current user session in mock mode
      setMockStorage('mock_session', newUser)
      return { user: newUser, session: { access_token: 'mock_token' } }
    }
  },

  async signIn(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      // Fetch profile
      const profile = await this.getProfile(data.user.id)
      return { ...data.user, profile }
    } else {
      const users = getMockStorage('mock_users', [])
      let user = users.find(u => u.email === email)
      if (!user) {
        // Auto-create on login in mock mode for ease of testing
        user = {
          id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
          email,
          full_name: email.split('@')[0],
          role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
          first_login_completed: false,
          shipping_address: '',
          avatar_url: ''
        }
        users.push(user)
        setMockStorage('mock_users', users)
      }
      setMockStorage('mock_session', user)
      return user
    }
  },

  async signOut() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } else {
      localStorage.removeItem('mock_session')
    }
  },

  async getCurrentUser() {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const profile = await this.getProfile(user.id)
      return { ...user, profile }
    } else {
      return getMockStorage('mock_session', null)
    }
  },

  async getProfile(userId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        // If profile doesn't exist, create it (safety trigger fallback)
        if (error.code === 'PGRST116') {
          const { data: { user } } = await supabase.auth.getUser()
          const newProfile = {
            id: userId,
            full_name: user?.user_metadata?.full_name || '',
            role: user?.email?.toLowerCase().includes('admin') ? 'admin' : 'customer',
            first_login_completed: false,
            shipping_address: '',
            avatar_url: ''
          }
          const { data: created, error: createErr } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single()
          if (createErr) throw createErr
          return created
        }
        throw error
      }
      return data
    } else {
      const users = getMockStorage('mock_users', [])
      return users.find(u => u.id === userId) || null
    }
  },

  async updateProfile(userId, profileData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const users = getMockStorage('mock_users', [])
      const idx = users.findIndex(u => u.id === userId)
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...profileData }
        setMockStorage('mock_users', users)
        
        // Also update current active session if it matches
        const currentSession = getMockStorage('mock_session', null)
        if (currentSession && currentSession.id === userId) {
          setMockStorage('mock_session', users[idx])
        }
        return users[idx]
      }
      throw new Error('User profile not found')
    }
  },

  // Products
  async fetchProducts() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(normalizeProductImages)
    } else {
      // Mock seed data
      const stored = getMockStorage('mock_products', null)
      if (!stored) {
        // Initialize with default products
        const defaultProducts = []
        // Hardcode a default list based on products.js to avoid import issues
        const categories = ['Hats', 'Shirts', 'Magazines', 'Collabs']
        const sampleDescriptions = {
          'Classic Cap [Black]': 'A timeless structured six-panel cap crafted from premium cotton twill. Features an adjustable strap and embroidered logo. Perfect for everyday wear.',
          'Classic Cap [White]': 'The same iconic silhouette in crisp white. Lightweight, breathable, and built to last — a wardrobe essential.',
          'Bucket Hat [Stone]': 'Relaxed silhouette bucket hat in a warm stone colourway. Crafted from 100% cotton canvas with a downward-sloping brim for a laid-back summer look.',
          'Beanie [Black]': 'A heavyweight ribbed knit beanie in classic black. Slouchy fit, double-lined cuff, and made from a soft wool-acrylic blend for warmth and comfort.',
          'Beanie [Grey]': 'Same great beanie silhouette in a versatile grey. Pairs effortlessly with any outfit. Machine washable and built to keep you warm all season.',
          'Trucker Cap [White]': 'Retro-inspired mesh back trucker cap in white. Breathable open-mesh panels keep you cool while the structured foam front holds its shape.',
          'Essential Tee [Black]': 'Our foundational heavyweight tee in deep black. Crafted from 240gsm organic cotton with a relaxed fit and dropped shoulders. The perfect blank canvas.',
          'Essential Tee [White]': 'The Essential Tee in clean white. Same heavyweight organic cotton construction, same perfect fit — made to be worn and washed endlessly.',
          'Oversized Shirt [Stone]': 'A boxy, oversized woven shirt in a warm stone tone. Crafted from 100% linen-cotton blend for a relaxed, breathable feel. Features a button-up front and chest pocket.',
          'Long Sleeve [Black]': 'Heavyweight long-sleeve tee in black. Same 240gsm organic cotton as our Essential Tee, now with full-length sleeves and a slightly cropped body.',
          'Graphic Tee [White]': 'Premium white tee featuring original studio artwork screen-printed in water-based ink. Limited runs ensure each piece stays exclusive.',
          'Button Up [Off White]': 'A refined off-white button-up shirt in a relaxed, oversized cut. Made from a breathable cotton-linen blend with horn-effect buttons and a clean, minimal finish.',
          'Issue No. 01': 'The debut issue. 96 pages exploring the intersection of streetwear, art, and culture. Features interviews, editorials, and original photography. Printed on uncoated stock.',
          'Issue No. 02': 'Issue two goes deeper — new voices, new cities, new ideas. 104 pages of curated content including collaborator spotlights and behind-the-scenes studio access.',
          'Issue No. 03': 'Our largest issue to date. 120 pages covering the seasonal collection, studio conversations, travel diaries, and an exclusive collab feature. Collector\'s edition.',
          'Collab Cap [Limited]': 'Limited edition collaborative cap produced with an iconic creative partner. Features co-branded detailing, premium materials, and a numbered certificate of authenticity.',
          'Collab Tee [Limited]': 'A rare limited run tee born from a true creative partnership. Features exclusive co-designed artwork on heavyweight organic cotton. Once it\'s gone, it\'s gone.',
          'Collab Hoodie [Limited]': 'The crown jewel of our collab series. A premium heavyweight hoodie with embroidered co-branding, brushed fleece lining, and a silhouette built for the ages. Strictly limited.'
        }
        
        let idCounter = 1
        categories.forEach(cat => {
          Object.keys(sampleDescriptions).forEach(name => {
            // map categories to products
            const isMatch = (cat === 'Hats' && name.includes('Cap') || name.includes('Hat') || name.includes('Beanie')) ||
                            (cat === 'Shirts' && (name.includes('Tee') || name.includes('Shirt') || name.includes('Button Up') || name.includes('Long Sleeve'))) ||
                            (cat === 'Magazines' && name.includes('Issue')) ||
                            (cat === 'Collabs' && name.includes('Collab'))
            
            if (isMatch) {
              defaultProducts.push({
                id: `p_${idCounter++}`,
                name,
                price: name.includes('Hoodie') ? 120.0 : name.includes('Tee') ? 55.0 : name.includes('Cap') ? 45.0 : name.includes('Issue') ? 15.0 : 50.0,
                description: sampleDescriptions[name],
                // Add 3 mock image views using general web placeholder images (nice ones)
                images: [
                  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop'
                ],
                category: cat,
                stock: Math.floor(Math.random() * 15) + 2, // 2 to 16 items
                min_stock: 5,
                created_at: new Date(Date.now() - 3600000 * 24 * (idCounter)).toISOString()
              })
            }
          })
        })
        setMockStorage('mock_products', defaultProducts)
        return defaultProducts.map(normalizeProductImages)
      }
      return stored.map(normalizeProductImages)
    }
  },

  async createProduct(product) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()
      if (error) throw error
      return normalizeProductImages(data)
    } else {
      const stored = getMockStorage('mock_products', [])
      const newProduct = {
        ...product,
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
      stored.unshift(newProduct)
      setMockStorage('mock_products', stored)
      return normalizeProductImages(newProduct)
    }
  },

  async updateProductStock(productId, newStock) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const stored = getMockStorage('mock_products', [])
      const idx = stored.findIndex(p => p.id === productId)
      if (idx !== -1) {
        stored[idx].stock = newStock
        setMockStorage('mock_products', stored)
        return stored[idx]
      }
      throw new Error('Product not found')
    }
  },

  // Orders
  async fetchOrders() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    } else {
      const stored = getMockStorage('mock_orders', null)
      if (!stored) {
        const defaultOrders = [
          {
            id: 'o_1',
            orderNumber: 384729,
            customer_name: 'Alex Johnson',
            email: 'alex@example.com',
            shipping_address: '123 Studio Way, London, EC1A 1BB, UK',
            total_amount: 140.0,
            status: 'processing',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            order_items: [
              { id: 'oi_1', product_name: 'Classic Cap [Black]', price: 45.0, qty: 2 },
              { id: 'oi_2', product_name: 'Beanie [Black]', price: 38.0, qty: 1 }
            ]
          },
          {
            id: 'o_2',
            orderNumber: 948271,
            customer_name: 'Sarah Connor',
            email: 'sarah@example.com',
            shipping_address: '456 Cyberdyne Blvd, Los Angeles, 90210, USA',
            total_amount: 55.0,
            status: 'delivered',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            order_items: [
              { id: 'oi_3', product_name: 'Essential Tee [White]', price: 55.0, qty: 1 }
            ]
          }
        ]
        setMockStorage('mock_orders', defaultOrders)
        return defaultOrders
      }
      return stored
    }
  },

  async createOrder(order, items) {
    if (isSupabaseConfigured) {
      // 1. Insert order
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single()
      if (orderError) throw orderError

      // 2. Insert items
      const formattedItems = items.map(item => ({
        order_id: insertedOrder.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        qty: item.qty
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(formattedItems)

      if (itemsError) throw itemsError

      // 3. Deduct stock levels in database
      for (const item of items) {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single()
        
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.qty)
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.id)
        }
      }

      return { ...insertedOrder, order_items: formattedItems }
    } else {
      const stored = getMockStorage('mock_orders', [])
      const newOrder = {
        ...order,
        id: 'o_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        order_items: items.map((item, idx) => ({
          id: `oi_${idx}_` + Math.random().toString(36).substr(2, 5),
          product_name: item.name,
          price: item.price,
          qty: item.qty
        }))
      }
      stored.unshift(newOrder)
      setMockStorage('mock_orders', stored)

      // Deduct stock in mock products
      const products = getMockStorage('mock_products', [])
      items.forEach(item => {
        const idx = products.findIndex(p => p.id === item.id)
        if (idx !== -1) {
          products[idx].stock = Math.max(0, products[idx].stock - item.qty)
        }
      })
      setMockStorage('mock_products', products)

      return newOrder
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const stored = getMockStorage('mock_orders', [])
      const idx = stored.findIndex(o => o.id === orderId)
      if (idx !== -1) {
        stored[idx].status = newStatus
        setMockStorage('mock_orders', stored)
        return stored[idx]
      }
      throw new Error('Order not found')
    }
  },

  // Storage Upload Helpers
  async uploadFile(bucket, path, file) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: true })
      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      return publicUrlData.publicUrl
    } else {
      // Mock File Upload: returns local object URL
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(file)
      })
    }
  }
}
