// components/orders/order-summary.jsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Flag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { requestCancellation } from "@/lib/api/order"

export function OrderSummary({ order }) {
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return ""
    // Check if date is already formatted
    if (typeof dateString === 'string' && dateString.includes(" ")) return dateString
    
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const handleCancellationRequest = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      await requestCancellation(order.id, {
        reason: cancellationReason
      })
      
      toast({
        title: "Cancellation requested",
        description: "Your cancellation request has been submitted and is pending review.",
      })
      
      setCancellationDialogOpen(false)
      setCancellationReason("")
    } catch (error) {
      console.error("Failed to request cancellation:", error)
      toast({
        title: "Failed to request cancellation",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full md:w-[300px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
      {console.log(order)
       }
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">#{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">£{order.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Date:</span>
            <span className="font-medium">  {new Date(order.createdAt).toISOString().split('T')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Date:</span>
            <span className="font-medium">  {new Date(order.dueDate).toISOString().split('T')[0]}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{order.progress || 0}%</span>
          </div>
          <Progress value={order.progress || 0} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2">
        <Button className="w-full gap-2">
          <MessageSquare className="h-4 w-4" />
          Contact Seller
        </Button>
        <Dialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Flag className="h-4 w-4" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>Describe the issue you're experiencing with this order.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="issue-type" className="text-sm font-medium">
                  Issue Type
                </label>
                <select
                  id="issue-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="quality">Quality Issues</option>
                  <option value="communication">Communication Problems</option>
                  <option value="delivery">Late Delivery</option>
                  <option value="requirements">Requirements Not Met</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="issue-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="issue-description"
                  placeholder="Please provide details about the issue..."
                  className="min-h-[100px]"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setCancellationDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={handleCancellationRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}