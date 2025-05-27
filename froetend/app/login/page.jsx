import LoginForm from "../../components/login-form"
import Link from "next/link"
export default function Login() {
  // In a real app, you would check for authentication here
  // If authenticated, redirect to dashboard
  // For demo purposes, we'll just show the login form

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Employee Portal</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
  