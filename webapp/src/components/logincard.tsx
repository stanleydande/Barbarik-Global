import React from 'react'

interface LoginCardProps {
  onClose: () => void
  onSwitchToSignUp: () => void
}

export default function LoginCard({ onClose, onSwitchToSignUp }: LoginCardProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <section className="login-card-shell" onClick={handleOverlayClick}>
      <div className="login-card">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close login screen"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="login-card-header">
          <p className="login-card-eyebrow">Welcome back</p>
          <h2>Sign in to your account</h2>
          <p>Use your email and password to continue.</p>
        </div>

        <form className="login-card-form">
          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="name@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" placeholder="••••••••" />
          </label>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <div className="login-card-footer">
          <p>Don&apos;t have an account?</p>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-black font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer text-sm"
          >
            Create one
          </button>
        </div>
      </div>
    </section>
  )
}
