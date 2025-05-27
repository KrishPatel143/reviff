'use client'

import Image from "next/image"
import Link from "next/link"
import { Clock, Calendar, Star, ChevronLeft, MoreHorizontal, Download, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SellerOrderHeader({ order }) {
  // Function to get the badge color based on status
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'bg-yellow-500',
      'In Progress': 'bg-blue-500',
      'Completed': 'bg-green-500',
      'Cancelled': 'bg-red-500',
      'Delivered': 'bg-purple-500'
    }
    
    return statusMap[status] || 'bg-blue-500'
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return ""
    // Check if date is already formatted
    if (typeof dateString === 'string' && dateString.includes(" ")) return dateString
    
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <>
      {/* Breadcrumbs and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/seller/orders">
              <ChevronLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>Order #{order._id || order.id}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Reports
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Order Details */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{order.title || "Untitled Order"}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={getStatusBadgeClass(order.status)}>{order.status || "Pending"}</Badge>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {formatDate(order.dueDate || order.deliveryDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Ordered: {formatDate(order.createdAt || order.orderDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={order.buyer?.avatar || "/placeholder.svg"}
                alt={order.buyer?.name || "Buyer"}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{order.buyer?.name || "Buyer"}</h3>
                <Badge variant="outline" className="text-xs">
                  {order.buyer?.level || "Customer"}
                </Badge>
              </div>
              {order.buyer?.rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{order.buyer?.rating}</span>
                  <span className="text-xs text-muted-foreground">({order.buyer?.reviews || 0} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}