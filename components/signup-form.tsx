"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Film } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatAuthError } from "@/lib/errors"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (error) {
        const formattedError = formatAuthError(error)
        setError(formattedError.message)
      } else {
        setSuccess("Check your email to confirm your account!")
      }
    } catch (err) {
      const formattedError = formatAuthError(err)
      setError(formattedError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="bg-red-600 p-3 rounded-full">
            <Film className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-gray-400">Join to start building your movie wishlist</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Sign up form">
        {error && (
          <div 
            className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg" 
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error}
          </div>
        )}

        {success && (
          <div 
            className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Creating account, please wait..." : "Create a new account"}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center text-gray-400">
          Already have an account?{" "}
          <Link 
            href="/auth/login" 
            className="text-red-400 hover:text-red-300 font-medium"
            aria-label="Go to sign in page"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
