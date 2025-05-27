"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Star, Filter, Grid, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/api/services"
import { API_URL } from "@/lib/apiClient"
export default function ServicesPage() {
    const [services, setServices] = useState([])
    const [pagination, setPagination] = useState({
        totalServices: 0,
        totalPages: 1,
        currentPage: 1
    })
    const [filters, setFilters] = useState({
        category: "all",
        minPrice: "",
        maxPrice: "",
        sellerLevel: [],
        deliveryTime: [],
        language: [],
        sortBy: "newest"
    })

    const fetchServices = async () => {
      try { 
          // Build query string from filters
          const queryParams = new URLSearchParams()
          queryParams.append('page', pagination.currentPage)
          queryParams.append('limit', 10)
          
          if (filters.category && filters.category !== "all") {
              queryParams.append('category', filters.category)
          }
          
          if (filters.minPrice) {
              queryParams.append('minPrice', filters.minPrice)
          }
          
          if (filters.maxPrice) {
              queryParams.append('maxPrice', filters.maxPrice)
          }
          
          if (filters.sellerLevel.length > 0) {
              filters.sellerLevel.forEach(level => {
                  queryParams.append('sellerLevel', level)
              })
          }
          
          if (filters.deliveryTime.length > 0) {
              filters.deliveryTime.forEach(time => {
                  queryParams.append('deliveryTime', time)
              })
          }
          
          if (filters.language.length > 0) {
              filters.language.forEach(lang => {
                  queryParams.append('language', lang)
              })
          }
          
          queryParams.append('sortBy', filters.sortBy)

          // Fetch data from API with localhost:4000
          const data = await getServices(queryParams.toString())
          
          setServices(data.services)
          setPagination({
              totalServices: data.totalServices,
              totalPages: data.totalPages,
              currentPage: data.currentPage
          })
      } catch (error) {
          console.error("Error fetching services:", error)
      }
  }

    useEffect(() => {
        fetchServices()
    }, [pagination.currentPage, filters.sortBy])

    const handleSortChange = (value) => {
        setFilters(prev => ({ ...prev, sortBy: value }))
    }

    const handleCategoryChange = (value) => {
        setFilters(prev => ({ ...prev, category: value }))
    }

    const handlePriceChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }))
    }

    const handleFilterSubmit = (e) => {
        e.preventDefault()
        fetchServices()
    }

    const handleCheckboxChange = (type, value, checked) => {
        setFilters(prev => {
            if (checked) {
                return { ...prev, [type]: [...prev[type], value] }
            } else {
                return { ...prev, [type]: prev[type].filter(item => item !== value) }
            }
        })
    }

    const clearAllFilters = () => {
        setFilters({
            category: "all",
            minPrice: "",
            maxPrice: "",
            sellerLevel: [],
            deliveryTime: [],
            language: [],
            sortBy: "newest"
        })
        // Reset to page 1 when clearing filters
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        // Immediately fetch with cleared filters
        fetchServices()
    }

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }))
        }
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (filters.category && filters.category !== "all") count++
        if (filters.minPrice || filters.maxPrice) count++
        count += filters.sellerLevel.length
        count += filters.deliveryTime.length
        count += filters.language.length
        return count
    }

    return (
      <div className="flex min-h-screen flex-col">
        {/* Header - Reused from home page */}
      
  
        <main className="flex-1">
          <div className="container px-4 py-8 md:px-6">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">All Services</h1>
                <p className="text-muted-foreground">Browse through our collection of professional services</p>
              </div>
  
              <Tabs defaultValue="list">
                {/* Filters and View Toggle */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      <Badge className="ml-1 bg-primary text-primary-foreground">{getActiveFilterCount()}</Badge>
                    </Button>
                    <Select value={filters.sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Graphics & Design">Graphics & Design</SelectItem>
                        <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                        <SelectItem value="Writing & Translation">Writing & Translation</SelectItem>
                        <SelectItem value="Video & Animation">Video & Animation</SelectItem>
                        <SelectItem value="Programming & Tech">Programming & Tech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      List
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      Grid
                    </TabsTrigger>
                  </TabsList>
                </div>
  
                {/* Main Content Area with Sidebar and Results */}
                <div className="flex flex-col lg:flex-row gap-6 mt-6">
                  {/* Sidebar Filters */}
                  <div className="w-full lg:w-64 shrink-0 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filters</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-primary"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </Button>
                    </div>
  
                    <form onSubmit={handleFilterSubmit}>
                      {/* Price Range */}
                      <div className="border-b pb-4 mb-4">
                        <h4 className="font-medium mb-2">Price Range</h4>
                        <div className="flex gap-2 items-center">
                          <Input 
                            type="number" 
                            placeholder="Min" 
                            className="h-8" 
                            value={filters.minPrice}
                            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                          />
                          <span>-</span>
                          <Input 
                            type="number" 
                            placeholder="Max" 
                            className="h-8" 
                            value={filters.maxPrice}
                            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                          />
                        </div>
                      </div>
    
                      {/* Delivery Time */}
                      <div className="border-b pb-4 mb-4">
                        <h4 className="font-medium mb-2">Delivery Time</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="delivery-1" 
                              checked={filters.deliveryTime.includes('1')}
                              onCheckedChange={(checked) => handleCheckboxChange('deliveryTime', '1', checked)}
                            />
                            <label htmlFor="delivery-1" className="text-sm">
                              Up to 1 day
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="delivery-3" 
                              checked={filters.deliveryTime.includes('3')}
                              onCheckedChange={(checked) => handleCheckboxChange('deliveryTime', '3', checked)}
                            />
                            <label htmlFor="delivery-3" className="text-sm">
                              Up to 3 days
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="delivery-7" 
                              checked={filters.deliveryTime.includes('7')}
                              onCheckedChange={(checked) => handleCheckboxChange('deliveryTime', '7', checked)}
                            />
                            <label htmlFor="delivery-7" className="text-sm">
                              Up to 7 days
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="delivery-any" 
                              checked={filters.deliveryTime.length === 0}
                              onCheckedChange={(checked) => {
                                if (checked) setFilters(prev => ({ ...prev, deliveryTime: [] }))
                              }}
                            />
                            <label htmlFor="delivery-any" className="text-sm">
                              Any
                            </label>
                          </div>
                        </div>
                      </div>
    
                      {/* Seller Level */}
                      <div className="border-b pb-4 mb-4">
                        <h4 className="font-medium mb-2">Seller Level</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="level-1" 
                              checked={filters.sellerLevel.includes('Level 1')}
                              onCheckedChange={(checked) => handleCheckboxChange('sellerLevel', 'Level 1', checked)}
                            />
                            <label htmlFor="level-1" className="text-sm">
                              Level 1
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="level-2" 
                              checked={filters.sellerLevel.includes('Level 2')}
                              onCheckedChange={(checked) => handleCheckboxChange('sellerLevel', 'Level 2', checked)}
                            />
                            <label htmlFor="level-2" className="text-sm">
                              Level 2
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="level-3" 
                              checked={filters.sellerLevel.includes('Top Rated')}
                              onCheckedChange={(checked) => handleCheckboxChange('sellerLevel', 'Top Rated', checked)}
                            />
                            <label htmlFor="level-3" className="text-sm">
                              Top Rated
                            </label>
                          </div>
                        </div>
                      </div>
    
                      {/* Languages */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Languages</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="lang-en" 
                              checked={filters.language.includes('English')}
                              onCheckedChange={(checked) => handleCheckboxChange('language', 'English', checked)}
                            />
                            <label htmlFor="lang-en" className="text-sm">
                              English
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="lang-es" 
                              checked={filters.language.includes('Spanish')}
                              onCheckedChange={(checked) => handleCheckboxChange('language', 'Spanish', checked)}
                            />
                            <label htmlFor="lang-es" className="text-sm">
                              Spanish
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="lang-fr" 
                              checked={filters.language.includes('French')}
                              onCheckedChange={(checked) => handleCheckboxChange('language', 'French', checked)}
                            />
                            <label htmlFor="lang-fr" className="text-sm">
                              French
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="lang-de" 
                              checked={filters.language.includes('German')}
                              onCheckedChange={(checked) => handleCheckboxChange('language', 'German', checked)}
                            />
                            <label htmlFor="lang-de" className="text-sm">
                              German
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full">Apply Filters</Button>
                    </form>
                  </div>
  
                  {/* Results Area */}
                  <div className="flex-1">
                    <TabsContent value="list" className="mt-0">
                      <div className="space-y-4">
                        {services.length > 0 ? (
                          services.map((service) => (
                            <Link
                              href={`/services/${service._id}`}
                              key={service._id}
                              className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 hover:shadow-md transition-all"
                            >
                              <div className="w-full md:w-48 h-32 shrink-0">
                                <Image
                                  src={service.images && service.images.length > 0 && service.images[0].url
                                    ? API_URL +  service.images[0].url
                                    : `/placeholder.svg?height=128&width=192&text=Service`}
                                  alt={service.title}
                                  width={192}
                                  height={128}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="h-6 w-6 rounded-full overflow-hidden">
                                    <Image
                                      src="/placeholder.svg?height=24&width=24"
                                      alt={service.sellerName || "Seller"}
                                      width={24}
                                      height={24}
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-sm">{service.sellerName || "Seller Name"}</span>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs font-medium">{service.averageRating || 0}</span>
                                    <span className="text-xs text-muted-foreground">({service.totalReviews || 0})</span>
                                  </div>
                                </div>
                                <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                                  {service.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {service.description}
                                </p>
                                <div className="flex items-center gap-2 mt-auto">
                                  <Badge variant="outline">{service.category}</Badge>
                                  {service.tags && service.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline">{tag}</Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Starting at</span>
                                    <span className="font-bold">£{service.pricing?.startingAt || 0}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-primary">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No services found matching your criteria</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="grid" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.length > 0 ? (
                          services.map((service) => (
                            <Link
                              href={`/services/${service._id}`}
                              key={service._id}
                              className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-all"
                            >
                              <div className="aspect-video w-full overflow-hidden">
                                <Image
                                  src={service.images && service.images.length > 0 && service.images[0].url
                                    ?  API_URL +  service.images[0].url
                                    : `/placeholder.svg?height=200&width=300&text=Service`}
                                  alt={service.title}
                                  width={300}
                                  height={200}
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                              </div>
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-8 w-8 rounded-full overflow-hidden">
                                    
                                    
                                    <Image
                                      src="/placeholder.svg?height=32&width=32"
                                      alt={service.sellerName || "Seller"}
                                      width={32}
                                      height={32}
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{service.sellerName || "Seller Name"}</span>
                                </div>
                                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                  {service.title}
                                </h3>
                                <div className="flex items-center gap-1 text-amber-500 mb-2">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm font-medium">{service.averageRating || 0}</span>
                                  <span className="text-xs text-muted-foreground">({service.totalReviews || 0})</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">Starting at</span>
                                  <span className="font-bold">£{service.pricing?.startingAt || 0}</span>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-10 col-span-3">
                            <p className="text-muted-foreground">No services found matching your criteria</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
  
                    {/* Pagination */}
                    {pagination.totalPages > 0 && (
                      <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={pagination.currentPage === 1}
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                          >
                            Previous
                          </Button>
                          
                          {[...Array(pagination.totalPages)].map((_, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className={pagination.currentPage === i + 1 ? "bg-primary text-primary-foreground" : ""}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </Button>
                          ))}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Tabs>
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

