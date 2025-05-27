"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Eye, Trash2, Edit, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react"
// import { getSellerServices, deleteService } from "@/lib/api/services"
import { toast } from "sonner"
import { getSellerServices,deleteService } from "@/lib/api/services"
import { API_URL } from "@/lib/apiClient"

export default function SellerServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingServiceId, setDeletingServiceId] = useState(null)

  // Fetch seller services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await getSellerServices()
        setServices(response.services || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching seller services:", err)
        setError("Failed to load services. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Filter services based on status and search query
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === "all") return matchesSearch
    if (filter === "active") return service.isActive && matchesSearch
    if (filter === "inactive") return !service.isActive && matchesSearch
    if (filter === "featured") return service.featuredStatus?.isFeatured && matchesSearch
    
    return matchesSearch
  })

  // Get service counts for badges
  const activeServices = services.filter(service => service.isActive)
  const inactiveServices = services.filter(service => !service.isActive)
  const featuredServices = services.filter(service => service.featuredStatus?.isFeatured)

  // Handle service deletion
  const handleDeleteService = async (serviceId) => {
    try {
      setDeletingServiceId(serviceId)
      await deleteService(serviceId)
      
      // Remove service from local state
      setServices(services.filter(service => service._id !== serviceId))
      
      toast({
        title: "Success!",
        description: "Service deleted successfully",
        variant: "success"
      })
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive"
      })
    } finally {
      setDeletingServiceId(null)
    }
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">My Services</h1>
                <p className="text-muted-foreground">Manage and track your service listings</p>
              </div>
              <Link href="/seller/add-service">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Service
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Services</h3>
                  <Badge variant="outline">{services.length}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Active Services</h3>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{activeServices.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Featured Services</h3>
                  <Badge className="bg-amber-500">{featuredServices.length}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{featuredServices.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Sales</h3>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {services.reduce((total, service) => total + (service.totalSales || 0), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all" onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="featured">Featured Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search services..." 
                  className="w-full md:w-[300px] pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Show loading or error state */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All Services
                    <Badge variant="secondary" className="ml-1">{services.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    Active
                    <Badge variant="secondary" className="ml-1">{activeServices.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="flex items-center gap-2">
                    Inactive
                    <Badge variant="secondary" className="ml-1">{inactiveServices.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="flex items-center gap-2">
                    Featured
                    <Badge variant="secondary" className="ml-1">{featuredServices.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Services Grid */}
                <TabsContent value="all" className="pt-6">
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? "No services found matching your search" : "No services found"}
                      </p>
                      {!searchQuery && (
                        <Link href="/seller/add-service">
                          <Button>Create Your First Service</Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredServices.map((service) => (
                        <Card key={service._id} className="overflow-hidden">
                          <CardHeader className="p-0">
                            <div className="relative h-40">
                              <Image
                                src={service.images && service.images[0].url
                                  ? API_URL +  service.images[0].url
                                  : `/placeholder.svg?height=160&width=400&text=${service.title.substring(0, 20)}`}
                                alt={service.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <Badge className={service.isActive ? "bg-green-500" : "bg-gray-500"}>
                                  {service.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {service.featuredStatus?.isFeatured && (
                                  <Badge className="bg-amber-500">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2 line-clamp-2" title={service.title}>
                              {service.title}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Category:</span>
                                <span className="font-medium">{service.category}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Starting Price:</span>
                                <span className="font-medium">£{service.pricing?.startingAt || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Total Sales:</span>
                                <span className="font-medium">{service.totalSales || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Created:</span>
                                <span className="font-medium">{formatDate(service.createdAt)}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between p-4 pt-0">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <Link href={`/services/${service._id}`}>
                                  <Eye className="h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <Link href={`/seller/services/edit/${service._id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </Button>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="gap-1"
                                  disabled={deletingServiceId === service._id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your service
                                    "{service.title}" and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteService(service._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deletingServiceId === service._id ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* You can add separate TabsContent for active, inactive, and featured if needed */}
                <TabsContent value="active" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeServices.map((service) => (
                      <Card key={service._id} className="overflow-hidden">
                        {/* Same card structure as above */}
                        <CardHeader className="p-0">
                          <div className="relative h-40">
                            <Image
                              src={service.images && service.images.length > 0 && service.images[0].url
                                ?API_URL +  service.images[0].url
                                : `/placeholder.svg?height=160&width=400&text=${service.title.substring(0, 20)}`}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-500">Active</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2" title={service.title}>
                            {service.title}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Category:</span>
                              <span className="font-medium">{service.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Starting Price:</span>
                              <span className="font-medium">£{service.pricing?.startingAt || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Sales:</span>
                              <span className="font-medium">{service.totalSales || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                              <Link href={`/services/${service._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                              <Link href={`/seller/services/edit/${service._id}`}>
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="gap-1">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your service
                                  "{service.title}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteService(service._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Similar structure for inactive and featured tabs */}
              </Tabs>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
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