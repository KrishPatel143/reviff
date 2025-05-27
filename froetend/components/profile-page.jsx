"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Edit, MapPin, Globe, Award, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { checkUser } from "@/lib/api/auth"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await checkUser()
        
        if (response.user) {
          setUser(response.user)
        } else {
          setError("Failed to load profile")
          toast.error("Profile Error", {
            description: "Could not load your profile information"
          })
        }
      } catch (err) {
        console.error("Profile fetch error:", err)
        setError("Failed to load profile")
        toast.error("Profile Error", {
          description: "Could not load your profile information"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Profile Not Found</h2>
            <p className="text-muted-foreground">
              We couldn't load your profile information.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { sellerProfile } = user

  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your profile information
            </p>
          </div>
          <Button asChild>
            <Link href="/seller/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{user.name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{user.email || "Not provided"}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <div className="flex items-center mt-1">
                <Badge variant={user.isSeller ? "default" : "secondary"}>
                  {user.isSeller ? "Seller" : "Buyer"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Profile Section */}
        {user.isSeller && sellerProfile ? (
          <>
            {/* Professional Description */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {sellerProfile.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sellerProfile.skills && sellerProfile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sellerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No skills added</p>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sellerProfile.languages && sellerProfile.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sellerProfile.languages.map((language, index) => (
                        <Badge key={index} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No languages added</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sellerProfile.location ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Country:</span>
                      <span>{sellerProfile.location.country || "Not specified"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">City:</span>
                      <span>{sellerProfile.location.city || "Not specified"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Location not provided</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : user.isSeller ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Complete Your Seller Profile</h3>
                <p className="text-muted-foreground">
                  You're registered as a seller but haven't completed your profile yet.
                </p>
                <Button asChild>
                  <Link href="/become-seller">
                    Complete Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Become a Seller</h3>
                <p className="text-muted-foreground">
                  Start offering your services by creating a seller profile.
                </p>
                <Button asChild>
                  <Link href="/become-seller">
                    Become a Seller
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}