'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageSquare, AlarmClock, Loader2, Settings } from "lucide-react"
import { toast } from "sonner"

export function SellerOrderSummary({ order }) {
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [progressValue, setProgressValue] = useState(order.progress || 0)
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false)
  const [extensionReason, setExtensionReason] = useState("")
  const [extensionDays, setExtensionDays] = useState(0)
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

  const handleProgressUpdate = async () => {
    try {
      setIsSubmitting(true)
      
      // Here you would call your API to update progress
      // await updateOrderProgress(order._id, progressValue);
      
      toast({
        title: "Progress updated",
        description: `Project progress updated to ${progressValue}%`,
      })
      
      setProgressDialogOpen(false)
    } catch (error) {
      console.error("Failed to update progress:", error)
      toast({
        title: "Failed to update progress",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtensionRequest = async () => {
    if (!extensionReason.trim() || extensionDays <= 0) {
      toast({
        title: "Error",
        description: "Please provide a valid reason and number of days.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Here you would call your API to request extension
      // await requestDeliveryExtension(order._id, extensionDays, extensionReason);
      
      toast({
        title: "Extension requested",
        description: `Extension request for ${extensionDays} days has been submitted.`,
      })
      
      setExtensionDialogOpen(false)
      setExtensionReason("")
      setExtensionDays(0)
    } catch (error) {
      console.error("Failed to request extension:", error)
      toast({
        title: "Failed to request extension",
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
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">#{order._id || order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment:</span>
            <span className="font-medium">£{order.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee:</span>
            <span className="font-medium">£{(order.price * 0.15).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Earnings:</span>
            <span className="font-medium">£{(order.price * 0.85).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Date:</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Date:</span>
            <span className="font-medium">{formatDate(order.dueDate)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{order.progress || progressValue || 0}%</span>
          </div>
          <Progress value={order.progress || progressValue || 0} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2">
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" variant="outline">
              <Settings className="h-4 w-4" />
              Update Progress
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project Progress</DialogTitle>
              <DialogDescription>Set the current progress for this order.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <label htmlFor="progress-value" className="text-sm font-medium">
                  Progress Percentage
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="progress-value"
                    type="number" 
                    min="0" 
                    max="100" 
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                  />
                  <span>%</span>
                </div>
                <Progress 
                  value={progressValue} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setProgressDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleProgressUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Progress'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={extensionDialogOpen} onOpenChange={setExtensionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <AlarmClock className="h-4 w-4" />
              Request Extension
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Delivery Extension</DialogTitle>
              <DialogDescription>Request additional time to complete this order.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="extension-days" className="text-sm font-medium">
                  Additional Days Needed
                </label>
                <Input 
                  id="extension-days"
                  type="number" 
                  min="1" 
                  max="30" 
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="extension-reason" className="text-sm font-medium">
                  Reason for Extension
                </label>
                <Textarea
                  id="extension-reason"
                  placeholder="Please provide a reason for requesting an extension..."
                  className="min-h-[100px]"
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setExtensionDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExtensionRequest}
                disabled={isSubmitting || !extensionReason.trim() || extensionDays <= 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Extension'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button className="w-full gap-2">
          <MessageSquare className="h-4 w-4" />
          Message Buyer
        </Button>
      </CardFooter>
    </Card>
  )
}