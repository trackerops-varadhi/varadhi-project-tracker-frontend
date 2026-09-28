'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  function validate() {
    const newErrors = {}
    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, formData.password)
      setIsSuccess(true)
    } catch (err) {
      setErrors({
        general:
          err?.response?.data?.message ||
          'Failed to reset your password. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ─── No token in the URL ──────────────────────────────────────────────────
  //
  // There is no verify-token endpoint for resets (unlike invites), so a bad
  // token only surfaces on submit. A MISSING one we can catch up front.
  if (!token) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          No reset token provided. Please use the link from your email.
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/forgot-password"
            className="text-violet-600 font-medium hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </div>
    )
  }

  // ─── Done ─────────────────────────────────────────────────────────────────
  //
  // No auto-login: the backend revokes every session on reset, so there is no
  // session to land in. Sending them to the login form is the honest next step.
  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Password updated
        </h2>
        <p className="text-sm text-muted-foreground">
          You&apos;ve been signed out everywhere. Sign in with your new password.
        </p>
        <Button
          onClick={() => router.push('/auth/login')}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          Go to Sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {errors.general}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-muted-foreground"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700"
        disabled={isLoading}
      >
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</>
          : 'Reset Password'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-violet-600 font-medium hover:underline">
          Back to Sign in
        </Link>
      </p>

    </form>
  )
}
