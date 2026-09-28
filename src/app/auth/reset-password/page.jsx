import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = {
  title: 'Reset Password',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 text-white font-bold text-xl mb-4">
            V
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {/* Suspense is required: ResetPasswordForm uses useSearchParams() */}
          <Suspense
            fallback={
              <div className="py-8 text-center text-sm text-slate-400">
                Loading…
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Internal tool — Varadhi Club © 2026
        </p>

      </div>
    </div>
  )
}
