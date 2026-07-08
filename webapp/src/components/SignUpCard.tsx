import React from 'react'
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

interface SignUpCardProps {
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function SignUpCard({ onClose, onSwitchToLogin }: SignUpCardProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <section className="login-card-shell" onClick={handleOverlayClick}>
      <Card className="login-card w-full max-w-[460px] relative border border-black/10 shadow-2xl rounded-[24px] p-6 bg-white animate-scaleIn">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close signup screen"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <CardHeader className="p-0 mb-6">
          <p className="login-card-eyebrow text-[11px] font-bold tracking-[1.5px] uppercase text-black">Join us today</p>
          <CardTitle className="text-2xl font-bold tracking-[0.5px] mt-1.5 mb-2 text-black">Create your account</CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">Fill in the details below to get started.</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-name" className="text-xs font-semibold text-black">Full Name</Label>
              <Input id="signup-name" type="text" placeholder="John Doe" className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-email" className="text-xs font-semibold text-black">Email</Label>
              <Input id="signup-email" type="email" placeholder="name@example.com" className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-password" className="text-xs font-semibold text-black">Password</Label>
              <Input id="signup-password" type="password" placeholder="••••••••" className="rounded-xl border-black/12 px-3.5 py-3 text-sm focus:border-black bg-zinc-50" />
            </div>

            <Button type="submit" className="w-full bg-black text-white hover:bg-zinc-800 rounded-full py-3 mt-2 font-semibold">
              Sign up
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
