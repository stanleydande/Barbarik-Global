import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { dbService } from '../lib/dbService'
import { Loader2, X } from 'lucide-react'

interface SignUpCardProps {
  onClose: () => void
  onSwitchToLogin: () => void
  onSignUpSuccess: (user: any) => void
}

export default function SignUpCard({ onClose, onSwitchToLogin, onSignUpSuccess }: SignUpCardProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const response = await dbService.signUp(email.trim(), password.trim(), fullName.trim())
      
      if (response && response.session) {
        const loggedInUser = await dbService.signIn(email.trim(), password.trim())
        onSignUpSuccess(loggedInUser)
        onClose()
      } else {
        setSuccessMsg('Account created successfully! Please check your email to verify your registration before signing in.')
        setFullName('')
        setEmail('')
        setPassword('')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create an account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-card-shell shadow-xl bg-black/50 z-50 fixed inset-0 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <Card className="login-card w-full max-w-[460px] relative border border-black/10 shadow-2xl rounded-[24px] p-6 bg-white animate-scaleIn">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close signup screen"
          type="button"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <CardHeader className="p-0 mb-6">
          <p className="login-card-eyebrow text-[11px] font-bold tracking-[1.5px] uppercase text-black">Join us today</p>
          <CardTitle className="text-2xl font-bold tracking-[0.5px] mt-1.5 mb-2 text-black">Create your account</CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">Fill in the details below to get started.</CardDescription>
        </CardHeader>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-200 mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 text-xs p-3.5 rounded-xl border border-green-200 mb-4">
            {successMsg}
          </div>
        )}

        <CardContent className="p-0">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-name" className="text-xs font-semibold text-black">Full Name</Label>
              <Input 
                id="signup-name" 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" 
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-email" className="text-xs font-semibold text-black">Email</Label>
              <Input 
                id="signup-email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" 
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-password" className="text-xs font-semibold text-black">Password</Label>
              <Input 
                id="signup-password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" 
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-zinc-800 rounded-full py-3 mt-2 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="p-0 mt-6 flex gap-1.5 text-sm text-gray-500">
          <p>Already have an account?</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-black font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer text-sm"
          >
            Sign in
          </button>
        </CardFooter>
      </Card>
    </section>
  )
}
