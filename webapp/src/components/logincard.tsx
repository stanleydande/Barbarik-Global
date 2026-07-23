import React, { useState } from 'react'
import { dbService } from '../lib/dbService'
import { Loader2, X } from 'lucide-react'

interface LoginCardProps {
  onClose: () => void
  onSwitchToSignUp: () => void
  onLoginSuccess: (user: any) => void
}

export default function LoginCard({ onClose, onSwitchToSignUp, onLoginSuccess }: LoginCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const user = await dbService.signIn(email.trim(), password.trim())
      onLoginSuccess(user)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-card-shell shadow-xl bg-black/50 z-50 fixed inset-0 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="login-card w-full max-w-[460px] bg-white rounded-[24px] p-6 shadow-2xl relative animate-scaleIn border border-black/10">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close login screen"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="login-card-header mb-6">
          <p className="login-card-eyebrow text-[11px] font-bold tracking-[1.5px] uppercase text-zinc-400">Welcome back</p>
          <h2 className="text-2xl font-bold tracking-[0.5px] mt-1 text-black">Sign in to your account</h2>
          <p className="text-xs text-zinc-500 mt-1">Use your email and password to continue.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-200 mb-4">
            {error}
          </div>
        )}

        <form className="login-card-form flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="field flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-black">Email</span>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl border border-zinc-200/80 px-3.5 py-2.5 text-sm focus:border-black bg-zinc-50/50 outline-none"
              required
            />
          </label>

          <label className="field flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-black">Password</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl border border-zinc-200/80 px-3.5 py-2.5 text-sm focus:border-black bg-zinc-50/50 outline-none"
              required
            />
          </label>

          <button 
            type="submit" 
            className="login-button w-full bg-black text-white hover:bg-zinc-800 rounded-full py-3 mt-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2 border-none cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="login-card-footer mt-6 flex gap-1.5 text-xs text-gray-500 justify-center">
          <p>Don&apos;t have an account?</p>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-black font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer text-xs"
          >
            Create one
          </button>
        </div>
      </div>
    </section>
  )
}
