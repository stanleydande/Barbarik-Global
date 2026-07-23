import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { dbService } from '../lib/dbService'
import {
  Camera, Loader2, MapPin, User, Mail, Shield,
  Check, ArrowLeft, Package, CreditCard, Bell
} from 'lucide-react'

export default function ProfileView({ user, isFirstLogin, onClose, onComplete }) {
  const [fullName, setFullName] = useState(user?.profile?.full_name || user?.user_metadata?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Parse existing address
  const existingAddr = (user?.profile?.shipping_address || '').split(',').map(s => s.trim())
  const [street, setStreet] = useState(existingAddr[0] || '')
  const [city, setCity] = useState(existingAddr[1] || '')
  const [postcode, setPostcode] = useState(existingAddr[2] || '')
  const [country, setCountry] = useState(existingAddr[3] || '')

  const fileInputRef = useRef(null)

  const userInitials = (fullName || user?.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const path = `${user.id}/${Date.now()}_avatar`
      const publicUrl = await dbService.uploadFile('avatars', path, file)
      setAvatarUrl(publicUrl)
      if (!isFirstLogin) {
        await dbService.updateProfile(user.id, { avatar_url: publicUrl })
        setSuccessMsg('Avatar updated!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError('Failed to upload image. Check storage bucket permissions.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (!street.trim() || !city.trim() || !postcode.trim() || !country.trim()) {
      setError('Please fill in all shipping address fields.')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      const address = `${street.trim()}, ${city.trim()}, ${postcode.trim()}, ${country.trim()}`
      const updated = await dbService.updateProfile(user.id, {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        shipping_address: address,
        first_login_completed: true,
        updated_at: new Date().toISOString()
      })
      setSuccessMsg('Profile saved successfully!')
      if (onComplete) {
        setTimeout(() => onComplete(updated), 600)
      }
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-2xl animate-scaleIn">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {isFirstLogin ? 'Do This Later' : 'Back to Store'}
            </button>
          )}
          {isFirstLogin && (
            <div className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Step 1 of 1 — Profile Setup
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Top Banner with Avatar */}
          <div className="relative bg-zinc-950 px-8 pt-8 pb-16">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-zinc-400">
                  {isFirstLogin ? 'Welcome to Studio' : 'My Account'}
                </span>
                <h1 className="text-white text-2xl font-bold mt-1 tracking-tight">
                  {isFirstLogin ? 'Complete Your Profile' : 'Edit Profile'}
                </h1>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed max-w-sm">
                  {isFirstLogin
                    ? 'Add your details now, or complete them before your first order. All details are saved securely to your account.'
                    : 'Update your personal details, avatar, and shipping preferences.'}
                </p>
              </div>

              {/* Account badge */}
              <div className="flex flex-col items-end gap-2 mt-1">
                <Badge className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border-none ${
                  user?.profile?.role === 'admin'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}>
                  {user?.profile?.role === 'admin' ? '⚡ Admin' : 'Customer'}
                </Badge>
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar — overlaps banner */}
          <div className="px-8 relative -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative flex-shrink-0">
                <div
                  className="relative w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-white shadow-xl cursor-pointer group overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <span className="text-white font-bold text-xl">{userInitials}</span>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading
                      ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                      : <Camera className="w-5 h-5 text-white" />
                    }
                  </div>
                </div>

                {/* Small camera button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

              <div className="pb-1">
                <p className="font-bold text-zinc-950 text-base leading-tight">
                  {fullName || 'Your Name'}
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">Click avatar to change photo</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="px-8">
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-200 flex items-start gap-2">
                <span className="mt-0.5">⚠</span> {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 bg-green-50 text-green-700 text-xs p-3.5 rounded-xl border border-green-200 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" /> {successMsg}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="flex flex-col gap-6">

              {/* Personal Details Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="rounded-xl border-zinc-200 bg-white h-10 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                    <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-zinc-200 bg-zinc-100/50">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm text-zinc-500 truncate">{user?.email}</span>
                      <Badge className="ml-auto text-[9px] bg-green-100 text-green-700 border-none px-2 rounded-md">Verified</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Default Shipping Address</h3>
                </div>
                <div className="flex flex-col gap-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Street Address</label>
                    <Input
                      type="text"
                      placeholder="123 Studio Way"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="rounded-xl border-zinc-200 bg-white h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">City</label>
                      <Input
                        type="text"
                        placeholder="London"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="rounded-xl border-zinc-200 bg-white h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Postcode</label>
                      <Input
                        type="text"
                        placeholder="EC1A 1BB"
                        value={postcode}
                        onChange={e => setPostcode(e.target.value)}
                        className="rounded-xl border-zinc-200 bg-white h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Country</label>
                    <Input
                      type="text"
                      placeholder="United Kingdom"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="rounded-xl border-zinc-200 bg-white h-10 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full bg-zinc-950 text-white hover:bg-zinc-800 rounded-2xl h-12 font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                disabled={uploading || saving}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving to Supabase...</>
                ) : (
                  <><Check className="w-4 h-4" /> {isFirstLogin ? 'Save & Enter the Store' : 'Save Changes'}</>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/40 text-[10px] mt-4 uppercase tracking-widest">
          All data is securely stored in Supabase
        </p>
      </div>
    </div>
  )
}
