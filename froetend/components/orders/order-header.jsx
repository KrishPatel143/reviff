import Image from "next/image"
import Link from "next/link"
import { Clock, Calendar, Star, ChevronLeft, MoreHorizontal, Download, Flag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function OrderHeader({ order }) {
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

  return (
    <>
      {/* Breadcrumbs and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/orders">
              <ChevronLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>Order #{order.id}</span>
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
              <Flag className="h-4 w-4" />
              Report Issue
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Request Cancellation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Order Details */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{order.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {order.deliveryDate}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Ordered: {order.orderDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={order.seller?.avatar || "/placeholder.svg"}
                alt={order.seller?.name || "Seller"}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{order.seller?.name || "Seller"}</h3>
                <Badge variant="outline" className="text-xs">
                  {order.seller?.level || "Seller"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">{order.seller?.rating || "N/A"}</span>
                <span className="text-xs text-muted-foreground">({order.seller?.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}