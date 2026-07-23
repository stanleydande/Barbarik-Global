import React, { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dbService } from '../lib/dbService'
import { Camera, Loader2, MapPin, User } from 'lucide-react'

export default function ProfileCompletion({ user, onComplete }) {
  const [fullName, setFullName] = useState(user?.profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Address subfields
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('')

  const fileInputRef = useRef(null)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const path = `${user.id}/${Date.now()}_avatar.png`
      const publicUrl = await dbService.uploadFile('avatars', path, file)
      setAvatarUrl(publicUrl)
    } catch (err) {
      console.error(err)
      setError('Failed to upload avatar image.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!street.trim() || !city.trim() || !postcode.trim() || !country.trim()) {
      setError('Please fill in all shipping address fields.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const addressString = `${street.trim()}, ${city.trim()}, ${postcode.trim()}, ${country.trim()}`
      const updatedProfile = await dbService.updateProfile(user.id, {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        shipping_address: addressString,
        first_login_completed: true
      })
      onComplete(updatedProfile)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <Card className="w-full max-w-lg border border-black/10 shadow-2xl rounded-[24px] bg-white p-6 animate-scaleIn my-8">
        <CardHeader className="text-center p-0 mb-6">
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500">First Step</p>
          <CardTitle className="text-2xl font-bold tracking-[0.5px] mt-1 mb-2">Complete Your Profile</CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">
            Welcome to STUDIO. To continue, please tell us a bit about yourself so we can set up your profile and delivery preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div 
                className="relative group w-24 h-24 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 hover:border-black flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-400 group-hover:text-black transition-colors duration-150">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-medium tracking-wide">UPLOAD</span>
                  </div>
                )}
                
                {avatarUrl && !uploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
              <span className="text-xs font-semibold text-zinc-500">Profile Picture</span>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="pc-name" className="text-xs font-bold text-black flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input 
                id="pc-name" 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="rounded-xl border-zinc-200 px-3.5 py-3 text-sm focus:border-black bg-zinc-50/50"
                required
              />
            </div>

            {/* Shipping Address */}
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-bold text-black flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Shipping Address
              </Label>
              
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Street Address</span>
                  <Input 
                    type="text" 
                    placeholder="123 Studio Way" 
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="rounded-xl border-zinc-200 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">City</span>
                    <Input 
                      type="text" 
                      placeholder="London" 
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="rounded-xl border-zinc-200 bg-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Postcode</span>
                    <Input 
                      type="text" 
                      placeholder="EC1A 1BB" 
                      value={postcode}
                      onChange={e => setPostcode(e.target.value)}
                      className="rounded-xl border-zinc-200 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Country</span>
                  <Input 
                    type="text" 
                    placeholder="United Kingdom" 
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="rounded-xl border-zinc-200 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-zinc-800 rounded-full py-3.5 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              disabled={uploading || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving profile...
                </>
              ) : (
                'Save and Enter Store'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
