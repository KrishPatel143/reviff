// app/orders/[id]/page.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { OrderHeader } from "@/components/orders/order-header"
import { OrderSummary } from "@/components/orders/order-summary"
import { OrderTabs } from "@/components/orders/order-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getOrderById } from '@/lib/api/order'

export default function OrderDetailsPage({ params }) {
    const unwrappedParams = React.use(params)
    const serviceId = unwrappedParams?.id || "507f1f77bcf86cd799439011" 
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  
  useEffect(() => {
    async function fetchOrderData() {
      try {
        setLoading(true)
        const data = await getOrderById(serviceId)
        setOrder(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError('Failed to load order details. Please try again.')
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [serviceId])

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
        {/* Order Header with breadcrumbs and order info */}
        <OrderHeader order={order} />

        {/* Order Header and Summary */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            {/* Order description and seller info are in order-header */}
          </div>
          <div className="w-full md:w-auto flex flex-col gap-2">
            <OrderSummary order={order} />
          </div>
        </div>

        {/* Order Details Tabs */}
        <OrderTabs order={order} />
      </div>
    </div>
  )
}