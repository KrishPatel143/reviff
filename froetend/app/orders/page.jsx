"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, User, Clock, CheckCircle, FileText, MessageSquare, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBuyerOrders } from "@/lib/api/order"
 // Import the getBuyerOrders function

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await getBuyerOrders()
        setOrders(response.orders || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filter orders based on status (pending or completed)
  const pendingOrders = orders.filter(order => 
    order.status === "Pending" || 
    order.status === "In Progress" || 
    order.status === "Revision"
  )
  
  const completedOrders = orders.filter(order => 
    order.status === "Completed" || 
    order.status === "Delivered"
  )

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calculate days remaining until due date
  const calculateDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to safely render seller information
  const renderSellerInfo = (sellerId) => {
    if (!sellerId) return 'Pending'
    if (typeof sellerId === 'string') return sellerId
    if (typeof sellerId === 'object') {
      // If sellerId is an object, extract the relevant field
      return sellerId._id || sellerId.email || sellerId.name || 'Unknown'
    }
    return 'Pending'
  }

  return (
    <div className="flex min-h-screen flex-col">


      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Manage Orders</h1>
              <p className="text-muted-foreground">Track and manage your orders</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all" onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="recent">Recent Orders</SelectItem>
                    <SelectItem value="oldest">Oldest Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search orders..." 
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
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Orders
                    <Badge variant="secondary" className="ml-1">{pendingOrders.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed Orders
                    <Badge variant="secondary" className="ml-1">{completedOrders.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Pending Orders Tab */}
                <TabsContent value="pending" className="pt-6">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No pending orders found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingOrders.map((order) => (
                        <Card key={order._id} className="overflow-hidden">
                          <CardHeader className="p-0">
                            <div className="relative h-40">
                              <Image
                                src={`/placeholder.svg?height=160&width=400&text=${order.serviceTitle.substring(0, 20)}`}
                                alt={order.serviceTitle}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-amber-500">{order.status}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden">
                                  <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="Seller"
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-sm font-medium">Seller: {renderSellerInfo(order.sellerId)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Order #{order._id.substring(order._id.length - 6)}</span>
                            </div>
                            <h3 className="font-semibold mb-2 truncate" title={order.serviceTitle}>
                              {order.serviceTitle.length > 30 
                                ? `${order.serviceTitle.substring(0, 30)}...` 
                                : order.serviceTitle}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                              <Clock className="h-4 w-4" />
                              <span>
                                {calculateDaysRemaining(order.dueDate) > 0 
                                  ? `Due in ${calculateDaysRemaining(order.dueDate)} days` 
                                  : "Past due"}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Order Date:</span>
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Price:</span>
                                <span className="font-medium">£{order.price}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Package:</span>
                                <span className="font-medium">{order.packageSelected}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between p-4 pt-0">
                            <></>
                            <Button size="sm" className="gap-1" asChild>
                              <Link href={`/orders/${order._id}`}>
                                <FileText className="h-4 w-4" />
                                View Details
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Completed Orders Tab */}
                <TabsContent value="completed" className="pt-6">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No completed orders found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedOrders.map((order) => (
                        <Card key={order._id} className="overflow-hidden">
                          <CardHeader className="p-0">
                            <div className="relative h-40">
                              <Image
                                src={`/placeholder.svg?height=160&width=400&text=${order.serviceTitle.substring(0, 20)}`}
                                alt={order.serviceTitle}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-green-500">{order.status}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden">
                                  <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="Seller"
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-sm font-medium">Seller: {renderSellerInfo(order.sellerId)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Order #{order._id.substring(order._id.length - 6)}</span>
                            </div>
                            <h3 className="font-semibold mb-2 truncate" title={order.serviceTitle}>
                              {order.serviceTitle.length > 30 
                                ? `${order.serviceTitle.substring(0, 30)}...` 
                                : order.serviceTitle}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Completed on {formatDate(order.updatedAt)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Order Date:</span>
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Price:</span>
                                <span className="font-medium">£{order.price}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Package:</span>
                                <span className="font-medium">{order.packageSelected}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between p-4 pt-0">
                            <Button variant="outline" size="sm" className="gap-1">
                              <MessageSquare className="h-4 w-4" />
                              Message
                            </Button>
                            <Button size="sm" className="gap-1" asChild>
                              <Link href={`/orders/${order._id}`}>
                                <FileText className="h-4 w-4" />
                                View Details
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
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