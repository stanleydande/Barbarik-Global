import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { dbService } from '../lib/dbService'
import { Loader2, Upload, Plus, X, Image as ImageIcon } from 'lucide-react'

export default function AddProductModal({ onClose, onProductAdded }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Hats')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('10')
  const [minStock, setMinStock] = useState('5')
  
  // Array of 3 image URLs
  const [images, setImages] = useState(['', '', ''])
  const [uploading, setUploading] = useState([false, false, false])
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]

  async function handleFileChange(index, e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Mark index as uploading
    setUploading(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })
    setError('')

    try {
      const path = `products/${Date.now()}_view_${index + 1}_${file.name.replace(/\s+/g, '_')}`
      const publicUrl = await dbService.uploadFile('products', path, file)
      
      setImages(prev => {
        const next = [...prev]
        next[index] = publicUrl
        return next
      })
    } catch (err) {
      console.error(err)
      setError(`Failed to upload image view ${index + 1}.`)
    } finally {
      setUploading(prev => {
        const next = [...prev]
        next[index] = false
        return next
      })
    }
  }

  function handleUrlChange(index, value) {
    setImages(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleClearImage(index) {
    setImages(prev => {
      const next = [...prev]
      next[index] = ''
      return next
    })
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Product name is required.')
    if (!price || parseFloat(price) <= 0) return setError('Please enter a valid price.')
    if (!description.trim()) return setError('Product description is required.')
    if (stock === '' || parseInt(stock) < 0) return setError('Please enter a valid stock level.')
    if (minStock === '' || parseInt(minStock) < 0) return setError('Please enter a valid minimum stock level.')

    // Ensure we have at least 1 image
    const validImages = images.filter(img => img.trim() !== '')
    if (validImages.length === 0) {
      return setError('Please provide at least 1 product image view.')
    }

    setSaving(true)
    try {
      // Pad out images so we always save an array of 3 (using index 0 for missing ones)
      const finalImages = [
        images[0] || validImages[0],
        images[1] || images[0] || validImages[0],
        images[2] || images[0] || validImages[0],
      ]

      const newProduct = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        images: finalImages,
        stock: parseInt(stock),
        min_stock: parseInt(minStock)
      }

      const created = await dbService.createProduct(newProduct)
      onProductAdded(created)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border border-black/10 shadow-2xl rounded-[24px] bg-white p-6 animate-scaleIn my-8">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Add New Product</h2>
            <p className="text-xs text-zinc-500">Create a new item in your inventory catalogue</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-name" className="text-xs font-bold text-black">Product Name</Label>
                <Input 
                  id="prod-name" 
                  type="text" 
                  placeholder="Classic Box Tee" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-xl border-zinc-200"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-category" className="text-xs font-bold text-black">Category</Label>
                <select
                  id="prod-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Hats">Hats</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Magazines">Magazines</option>
                  <option value="Collabs">Collabs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-price" className="text-xs font-bold text-black">Price (£)</Label>
                <Input 
                  id="prod-price" 
                  type="number" 
                  step="0.01"
                  placeholder="45.00" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="rounded-xl border-zinc-200"
                  required
                />
              </div>

              {/* Initial Stock */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-stock" className="text-xs font-bold text-black">Available Stock</Label>
                <Input 
                  id="prod-stock" 
                  type="number" 
                  placeholder="10" 
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="rounded-xl border-zinc-200"
                  required
                />
              </div>

              {/* Low Stock Warning Threshold */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-min-stock" className="text-xs font-bold text-black">Min Stock Level (Alert)</Label>
                <Input 
                  id="prod-min-stock" 
                  type="number" 
                  placeholder="5" 
                  value={minStock}
                  onChange={e => setMinStock(e.target.value)}
                  className="rounded-xl border-zinc-200"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prod-desc" className="text-xs font-bold text-black">Product Description</Label>
              <Textarea 
                id="prod-desc" 
                placeholder="Write a premium product details description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="rounded-xl border-zinc-200 min-h-[80px]"
                required
              />
            </div>

            {/* 3 Images Upload views */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-black">Product Image Views (Exactly 3 views recommended)</Label>
              
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 relative">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">View {idx + 1}</span>
                    
                    {images[idx] ? (
                      <div className="relative w-full h-24 rounded-xl border border-zinc-200 overflow-hidden bg-white group">
                        <img src={images[idx]} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleClearImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-black text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-24 rounded-xl border border-dashed border-zinc-300 hover:border-black flex flex-col items-center justify-center cursor-pointer bg-white transition-all text-zinc-400 hover:text-black"
                        onClick={() => fileInputRefs[idx].current?.click()}
                      >
                        {uploading[idx] ? (
                          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mb-1 text-zinc-400" />
                            <span className="text-[8px] font-bold tracking-wider uppercase">Upload Image</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRefs[idx]} 
                      onChange={(e) => handleFileChange(idx, e)} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    {/* URL paste fallback */}
                    <div className="flex items-center gap-1 mt-1">
                      <ImageIcon className="w-3 h-3 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Or paste URL..."
                        value={images[idx]}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        className="w-full text-[9px] border-none bg-transparent p-0 focus:ring-0 text-zinc-500 placeholder-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="rounded-full px-5 hover:bg-zinc-50 border-zinc-200"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-black text-white hover:bg-zinc-800 rounded-full px-6 font-semibold flex items-center gap-2"
                disabled={saving || uploading.some(u => u)}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
