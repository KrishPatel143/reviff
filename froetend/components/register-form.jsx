"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" 
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { registerUser } from "@/lib/api/auth"

const registerSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
})

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isSeller: false
  })
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
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
    
    // Reset errors
    setErrors({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      
    })
    setIsLoading(true)

    try {
      // Validate form data using Zod schema
      registerSchema.parse(formData)

      // Attempt to register user
      const response = await registerUser(formData)
      
      if (response.user) {
        // Show success toast
        toast.success("Registration Successful", {
          description: "Please log in with your new account.",
        })
        
        // Redirect to login page
        router.push('/login')
      } else {
        // Handle unsuccessful registration
        toast.error("Registration Failed", {
          description: response.message || "Please check your information.",
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const newErrors = { username: "", email: "", password: "", firstName: "", lastName: "" }
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        // Handle network or unexpected errors
        toast.error("Registration Error", {
          description: "An error occurred. Please try again.",
        })
        console.error(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={errors.firstName ? "true" : "false"}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p 
              className="text-sm text-red-500" 
              role="alert"
            >
              {errors.firstName}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={errors.lastName ? "true" : "false"}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p 
              className="text-sm text-red-500" 
              role="alert"
            >
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.username ? "true" : "false"}
          className={errors.username ? "border-red-500" : ""}
        />
        {errors.username && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.username}
          </p>
        )}
      </div>

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
        className="w-full mt-6" 
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}