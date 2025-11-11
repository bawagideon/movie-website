"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Film } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatAuthError } from "@/lib/errors"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const formattedError = formatAuthError(error)
        setError(formattedError.message)
      } else {
        router.push("/")
        router.refresh()
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
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-gray-400">Sign in to your movie account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
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
              placeholder="Enter your password"
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
          aria-label={loading ? "Signing in, please wait..." : "Sign in to your account"}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link 
            href="/auth/signup" 
            className="text-red-400 hover:text-red-300 font-medium"
            aria-label="Go to sign up page"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
