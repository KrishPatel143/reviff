'use client'

import { useState } from "react"
import { FileText, MessageSquare, CheckCircle, ThumbsUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { approveMilestone, requestMilestoneRevision } from "@/lib/api/order"
import { API_URL } from "@/lib/apiClient"

export function MilestonesList({ milestones: initialMilestones = [], orderId }) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return ""
    // Check if date is already formatted
    if (typeof dateString === 'string' && dateString.includes(" ")) return dateString
    
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const handleApproveMilestone = async () => {
    if (!selectedMilestone) return
    
    try {
      setLoading(true)
      
      const approvalData = {
        feedback: feedback,
        status: "completed"
      }
      
      // Use the milestone ID instead of index for more robust identification
      const milestoneId = selectedMilestone.id || selectedMilestone._id
      await approveMilestone(orderId, milestoneId, approvalData)
      
      // Update the local state using milestone ID
      const updatedMilestones = milestones.map((milestone) => {
        if ((milestone.id || milestone._id) === milestoneId) {
          return { 
            ...milestone, 
            status: "completed",
            feedback: feedback,
            approvedAt: new Date().toISOString()
          }
        }
        return milestone
      })
      
      setMilestones(updatedMilestones)
      setDialogOpen(false)
      
      toast({
        title: "Milestone approved",
        description: "The milestone has been successfully approved.",
      })
      
      // Clear the form
      setFeedback("")
      setSelectedMilestone(null)
    } catch (error) {
      console.error("Failed to approve milestone:", error)
      toast({
        title: "Failed to approve milestone",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openApprovalDialog = (milestone) => {
    setSelectedMilestone(milestone)
    setDialogOpen(true)
  }

  const handleRequestRevision = async (milestone) => {
    try {
      setLoading(true)
      
      const revisionData = {
        status: "in-progress", // Reset to in-progress for revision
        revisionRequested: true,
        revisionNote: "Revision requested by buyer"
      }
      
      const milestoneId = milestone.id || milestone._id
      await requestMilestoneRevision(orderId, milestoneId, revisionData)
      
      // Update local state
      const updatedMilestones = milestones.map((m) => {
        if ((m.id || m._id) === milestoneId) {
          return { 
            ...m, 
            status: "in-progress",
            revisionRequested: true,
            revisionNote: "Revision requested by buyer"
          }
        }
        return m
      })
      
      setMilestones(updatedMilestones)
      
      toast({
        title: "Revision requested",
        description: "The seller has been notified about the revision request.",
      })
    } catch (error) {
      console.error("Failed to request revision:", error)
      toast({
        title: "Failed to request revision",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Map API status values to display values
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    }
    
    return statusMap[status] || status
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
        <CardDescription>Track the progress of your project through these milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones defined for this project.
            </div>
          ) : (
            milestones.map((milestone, index) => (
              <div key={milestone.id || milestone._id || index} className="relative">
                {index < milestones.length - 1 && (
                  <div className="absolute top-6 left-3 bottom-0 w-0.5 bg-border" />
                )}
                <div className="flex gap-4">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      milestone.status === "completed"
                        ? "bg-green-500 text-white"
                        : milestone.status === "in-progress"
                          ? "bg-blue-500 text-white"
                          : "bg-muted"
                    }`}
                  >
                    {milestone.status === "completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            milestone.status === "completed"
                              ? "default"
                              : milestone.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {getStatusDisplay(milestone.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(milestone.date || milestone.dueDate)}</span>
                      </div>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    )}

                    {/* Show revision notice if revision was requested */}
                    {milestone.revisionRequested && milestone.status === "in-progress" && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-800">
                          ⏱️ Revision requested - Seller is working on updates
                        </p>
                      </div>
                    )}

                    {/* Completed milestone actions */}
                    {milestone.status === "completed" && !milestone.approvedAt && (
                      <div className="mt-2 flex items-center gap-2">
                        {milestone.deliverable && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => window.open(API_URL + milestone.deliverable.url, '_blank')}
                          >
                            <FileText className="h-4 w-4" />
                            View Deliverable
                          </Button>
                        )}
                        
                        <Dialog open={dialogOpen && (selectedMilestone?.id || selectedMilestone?._id) === (milestone.id || milestone._id)} onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedMilestone(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-1" onClick={() => openApprovalDialog(milestone)}>
                              <ThumbsUp className="h-4 w-4" />
                              Approve Milestone
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Milestone</DialogTitle>
                              <DialogDescription>
                                Are you satisfied with the deliverable for this milestone?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="font-medium">{selectedMilestone?.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Approving this milestone will mark it as completed and allow the seller to
                                proceed to the next phase.
                              </p>
                              <Textarea
                                className="mt-4"
                                placeholder="Add feedback or comments (optional)..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setDialogOpen(false)
                                  setSelectedMilestone(null)
                                  setFeedback("")
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleApproveMilestone}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Approve'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleRequestRevision(milestone)}
                          disabled={loading}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Request Revisions
                        </Button>
                      </div>
                    )}

                    {/* Already approved milestone */}
                    {milestone.status === "completed" && milestone.approvedAt && (
                      <div className="mt-2 flex items-center gap-2">
                        {milestone.deliverable && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => window.open(API_URL + milestone.deliverable.url, '_blank')}
                          >
                            <FileText className="h-4 w-4" />
                            View Deliverable
                          </Button>
                        )}

                        <div className="text-sm text-green-600 font-medium">
                          ✓ Approved
                        </div>
                      </div>
                    )}

                    {/* In progress milestone (no actions for buyer) */}
                    {milestone.status === "in-progress" && !milestone.revisionRequested && (
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground">
                          🔄 Seller is working on this milestone
                        </div>
                      </div>
                    )}

                    {/* Pending milestone (no actions for buyer) */}
                    {milestone.status === "pending" && (
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground">
                          ⏳ Waiting for seller to start
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}