"use client"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {  Star, Clock, CheckCircle, MessageSquare, Heart, Share2, Flag } from "lucide-react"
import { getServiceById } from "@/lib/api/services"
import { API_URL } from "@/lib/apiClient"

export default function ServicePage({ params }) {
  const unwrappedParams = use(params)
  const serviceId = unwrappedParams.id
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const data = await getServiceById(serviceId)
        setService(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceData()
  }, [serviceId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading service details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    )
  }

  // Format date for better display
  const formattedDate = new Date(service.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/services" className="text-muted-foreground hover:text-foreground">
              Services
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>{service.category}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {service.title}
              </h1>

              {/* Seller Info */}
              <div className="flex items-center gap-4 mb-6">
                {console.log(service)}
                
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="Seller"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{service.sellerName}</h3>
                    <Badge variant="outline" className="text-xs">
                      {service.sellerLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{service.averageRating || "New"}</span>
                    <span className="text-xs text-muted-foreground">({service.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Main Image */}
              <div className="mb-8 rounded-lg overflow-hidden">
                <Image
                  src={service.images && service.images.length > 0 
                    ? (API_URL +  service.images.find(img => img.isMain)?.url )|| (API_URL + service.images[0].url )
                    : `/placeholder.svg?height=500&width=800&text=${encodeURIComponent(service.title)}`}
                  alt={service.title}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="about">About Seller</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Service Description</h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>

                    <h4 className="text-lg font-semibold mt-6">What's Included</h4>
                    <ul className="space-y-2">
                      {service.pricing.packages.find(pkg => pkg.name === "Standard")?.includedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="text-lg font-semibold mt-6">Requirements</h4>
                    <p className="text-muted-foreground">
                      {service.requirements}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="about" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">About the Seller</h3>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=64&width=64"
                          alt="Seller"
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.sellerName}</h4>
                        <p className="text-sm text-muted-foreground">{service.subcategory} Specialist</p>
                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{service.averageRating || "New"}</span>
                          <span className="text-xs text-muted-foreground">({service.totalReviews} reviews)</span>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Contact Me
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-muted-foreground">Member since</p>
                        <p className="font-medium">{formattedDate}</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-muted-foreground">Response time</p>
                        <p className="font-medium">Within 24 hours</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-muted-foreground">Total sales</p>
                        <p className="font-medium">{service.totalSales}</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-muted-foreground">Languages</p>
                        <p className="font-medium">{service.languages.join(", ")}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">
                        Professional {service.subcategory} specialist with expertise in creating high-quality solutions for clients worldwide.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{service.totalReviews} Reviews</h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-lg font-medium">{service.averageRating || "No ratings yet"}</span>
                      </div>
                    </div>

                    {service.reviews && service.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {service.reviews.map((review, index) => (
                          <div key={index} className="border-b pb-6">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <Image
                                  src={`/placeholder.svg?height=40&width=40&text=C${index + 1}`}
                                  alt={`Client ${index + 1}`}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">{review.reviewerName || "Client"}</h4>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 mt-1">
                                  {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                                    ))}
                                </div>
                                <p className="mt-2 text-muted-foreground">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No reviews yet. Be the first to review this service!</p>
                      </div>
                    )}

                    {service.reviews && service.reviews.length > 0 && (
                      <Button variant="outline" className="w-full">
                        Load More Reviews
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Pricing */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="border rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Service Packages</h3>

                <Tabs defaultValue={service.pricing.packages[0].name.toLowerCase()} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    {service.pricing.packages.map((pkg, index) => (
                      <TabsTrigger key={index} value={pkg.name.toLowerCase()}>
                        {pkg.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {service.pricing.packages.map((pkg, index) => (
                    <TabsContent key={index} value={pkg.name.toLowerCase()} className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{pkg.name} Package</h4>
                          <span className="font-bold text-xl">£{pkg.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pkg.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{pkg.deliveryTime} day delivery</span>
                        </div>
                        <div className="space-y-2">
                          {pkg.includedFeatures.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                  
                <Link href={`/services/${serviceId}/order`}>

                <Button className="w-full mb-4">Place Order</Button>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Reused from home page */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Graphics & Design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Digital Marketing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Writing & Translation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Video & Animation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Programming & Tech
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">About</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Partnerships
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Selling on Riveff
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Buying on Riveff
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Affiliates
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center border-t py-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-bold">Riveff</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} Riveff. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}