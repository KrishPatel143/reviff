"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" 
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { loginUser } from "@/lib/api/auth"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ 
        ...prev, 
        [name]: "" 
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset loading and errors
    setErrors({ email: "", password: "" })
    setIsLoading(true)

    try {
      // Validate form data using Zod schema
      loginSchema.parse(formData)

      // Attempt to log in
      const response = await loginUser(formData.email, formData.password)
      
      if (response.token) {
        // Show success toast
        toast.success("Login Successful", {
          description: "Redirecting to dashboard...",
        })
        
        // Redirect to home/dashboard
        router.push('/')
      } else {
        // Handle unsuccessful login
        toast.error("Login Failed", {
          description: response.message || "Please check your credentials.",
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const newErrors = { email: "", password: "" }
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        // Handle network or unexpected errors
        toast.error("Login Error", {
          description: "An error occurred. Please try again.",
        })
        console.error(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.email ? "true" : "false"}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.password ? "true" : "false"}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  )
}