"use client"

import React, { useEffect, useState } from "react"
import Cookies from "js-cookie";
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Store, User } from "lucide-react"
import Link from "next/link"
import { checkUser } from "@/lib/api/auth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if current page is login, register, or other auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip auth check on auth pages
      if (isAuthPage) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if token exists in cookies
        const token = Cookies.get('token');
        
        if (token) {
          try {
            const userProfile = await checkUser();
            if (userProfile.user) {
              // Check if user is a seller
              setIsSeller(userProfile.user.isSeller || userProfile.role === 'seller');
              setIsAuthenticated(true);
              setIsLoading(false);
            } else {
              // Invalid user profile, redirect to login
              Cookies.remove('token');
              router.push('/login');
            }
          } catch (error) {
            // Token is invalid, remove it and redirect to login
            console.error('Failed to fetch profile', error);
            Cookies.remove('token');
            router.push('/login');
          }
        } else {
          // No token found, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error', error);
        // On any error, clear token and redirect to login
        Cookies.remove('token');
        router.push('/login');
      }
    };
    
    checkAuthStatus();
  }, [router, pathname, isAuthPage]);

  // Simple header for auth pages (login, register, etc.)
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-bold text-xl">Riveff</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }
  
  // Loading state for protected pages
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold">R</span>
            </div>
            <span className="font-bold text-xl">Riveff</span>
          </div>
          <div className="animate-pulse bg-gray-200 h-4 w-40 rounded"></div>
        </div>
      </header>
    );
  }

  // Only authenticated users should see this full header
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold">R</span>
            </div>
            <span className="font-bold text-xl">Riveff</span>
          </Link>
          <Link href="/services" className="text-sm font-medium transition-colors hover:text-primary">
            services
          </Link>
          <Link href="/orders" className="text-sm font-medium transition-colors hover:text-primary">
            Orders
          </Link>
          <nav className="hidden md:flex gap-6">
            {isSeller && (
              // Seller navigation links
              <>
                <Link href="/seller/services" className="text-sm font-medium transition-colors hover:text-primary">
                  My Services
                </Link>
                <Link href="/seller/orders" className="text-sm font-medium transition-colors hover:text-primary">
                  Manage Orders
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="w-[200px] lg:w-[300px] pl-8"
            />
          </div>
          
          {isSeller ? (
            // Seller action buttons
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Link href="/seller/add-service" className="flex items-center gap-1">
                  <Store className="w-4 h-4 mr-1" />
                  Create Service
                </Link>
              </Button>
              <Button variant="ghost" size="sm">
                <Link href="/seller/profile">
                  <User className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            // Buyer action button
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href="/becomeSeller">Become a Seller</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}