'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      await authApi.forgotPassword(email)
      setIsSuccess(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Check your email
        </h2>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <Link
          href="/auth/login"
          className="block text-sm text-primary font-medium hover:underline mt-2"
        >
          Back to Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@varadhi.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary-hover"
        disabled={isLoading}
      >
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
          : 'Send Reset Link'
        }
      </Button>

      {/* Back to login */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/auth/login"
          className="text-primary font-medium hover:underline"
        >
          Back to Sign in
        </Link>
      </p>

    </form>
  )
}

export function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (isLoading || !token) return
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setPassword('')
      setConfirmation('')
      setIsSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p role="status" className="text-sm text-green-700">Your password has been reset successfully.</p>
        <Link href="/auth/login" className="text-sm font-medium text-primary hover:underline">Sign in with your new password</Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p role="alert" className="text-sm text-red-600">This reset link is missing its token. Please request a new link.</p>
        <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">Request a new reset link</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={6} disabled={isLoading} value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-help" />
        <p id="password-help" className="text-xs text-muted-foreground">Use at least 6 characters.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" required minLength={6} disabled={isLoading} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover">
        {isLoading ? 'Resetting password...' : 'Reset password'}
      </Button>
      <div className="space-y-2 text-center text-sm">
        <Link href="/auth/forgot-password" className="block text-primary hover:underline">Request a new reset link</Link>
        <Link href="/auth/login" className="block text-muted-foreground hover:underline">Back to sign in</Link>
      </div>
    </form>
  )
}

