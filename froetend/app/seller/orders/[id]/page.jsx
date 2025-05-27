'use client'

import { use, useEffect, useState } from "react"
import { SellerOrderHeader } from "@/components/orders/seller-order-header"
import { SellerOrderSummary } from "@/components/orders/seller-order-summary"
import { SellerOrderTabs } from "@/components/orders/seller-order-tabs"
import { getOrderById } from "@/lib/api/order"
import { Skeleton } from "@/components/ui/skeleton"

export default function SellerOrderDetailsPage({ params }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params)
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await getOrderById(unwrappedParams.id)
        setOrder(response.order || response || {})
        setError(null)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Failed to load order details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [unwrappedParams.id])

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-full max-w-md" />
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="w-full md:w-[300px] h-[250px]" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="flex flex-col gap-6">
        {/* Order Header */}
        <SellerOrderHeader order={order} />

        {/* Order Content and Summary */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            {/* Order Tabs */}
            <SellerOrderTabs order={order} />
          </div>
          <div className="w-full md:w-auto">
            {/* Order Summary */}
            <SellerOrderSummary order={order} />
          </div>
        </div>
      </div>
    </div>
  )
}