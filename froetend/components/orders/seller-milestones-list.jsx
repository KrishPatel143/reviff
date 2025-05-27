'use client'

import { useState, useRef } from "react"
import { FileText, MessageSquare, CheckCircle, Clock, Edit, Loader2, MoreHorizontal, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { addMilestone, completeMilestone, updateMilestone, uploadSingleFile } from "@/lib/api/order"
import { API_URL } from "@/lib/apiClient"

export function SellerMilestonesList({ milestones: initialMilestones = [], orderId }) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [loading, setLoading] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [addMilestoneDialogOpen, setAddMilestoneDialogOpen] = useState(false)
  const [completionNote, setCompletionNote] = useState("")
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return ""
    // Check if date is already formatted
    if (typeof dateString === 'string' && dateString.includes(" ")) return dateString
    
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Add a new milestone to the order
  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return
    
    try {
      setLoading(true)
      
      // Create dummy file URL if file is selected
      const deliverableUrl = selectedFile ?  await uploadSingleFile(selectedFile): null;
      
      const milestoneData = {
        status: "completed",
        note: completionNote,
        deliverable: selectedFile ? {
          name: selectedFile.name,
          url: deliverableUrl.file.url,
          size: selectedFile.size,
          type: selectedFile.type
        } : null,
        completedAt: new Date().toISOString()
      }
      
      await completeMilestone(orderId, selectedMilestone.id || selectedMilestone._id, milestoneData)
      
      // Update the local state
      const updatedMilestones = milestones.map((milestone) => {
        if ((milestone.id || milestone._id) === (selectedMilestone.id || selectedMilestone._id)) {
          return { 
            ...milestone, 
            status: "completed",
            deliverable: milestoneData.deliverable,
            completionNote: completionNote,
            completedAt: new Date().toISOString()
          }
        }
        return milestone
      })
      
      setMilestones(updatedMilestones)
      setCompletionDialogOpen(false)
      
      toast({
        title: "Milestone completed",
        description: "The milestone has been marked as completed and delivered to the buyer.",
      })
      
      // Clear the form
      setCompletionNote("")
      setSelectedFile(null)
      setSelectedMilestone(null)
    } catch (error) {
      console.error("Failed to complete milestone:", error)
      toast({
        title: "Failed to complete milestone",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewMilestone = async () => {
    if (!newMilestoneTitle || !newMilestoneDueDate) {
      toast({
        title: "Error",
        description: "Please provide a title and due date for the milestone.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setLoading(true)
      
      const milestoneData = {
        title: newMilestoneTitle,
        description: newMilestoneDescription,
        date: newMilestoneDueDate,
        dueDate: newMilestoneDueDate,
        status: "pending"
      }
      
      const response = await addMilestone(orderId, milestoneData)
      
      // Format the response to match local state structure
      const formattedMilestone = {
        id: response._id || Date.now().toString(),
        _id: response._id || Date.now().toString(),
        title: newMilestoneTitle,
        description: newMilestoneDescription,
        date: newMilestoneDueDate,
        dueDate: newMilestoneDueDate,
        status: "pending",
        createdAt: new Date().toISOString()
      }
      
      // Update local milestones state with new milestone
      setMilestones([...milestones, formattedMilestone])
      
      setAddMilestoneDialogOpen(false)
      
      toast({
        title: "Milestone added",
        description: "A new milestone has been added to the project.",
      })
      
      // Reset form
      setNewMilestoneTitle("")
      setNewMilestoneDescription("")
      setNewMilestoneDueDate("")
    } catch (error) {
      console.error("Failed to add milestone:", error)
      toast({
        title: "Failed to add milestone",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartMilestone = async (milestoneId) => {
    try {
      setLoading(true)
      
      const milestoneData = {
        status: "in-progress",
        startedAt: new Date().toISOString()
      }
      
      await updateMilestone(orderId, milestoneId, milestoneData)
      
      // Update the local state
      const updatedMilestones = milestones.map((milestone) => {
        if ((milestone.id || milestone._id) === milestoneId) {
          return { ...milestone, status: "in-progress", startedAt: new Date().toISOString() }
        }
        return milestone
      })
      
      setMilestones(updatedMilestones)
      
      toast({
        title: "Milestone started",
        description: "The milestone has been marked as in progress.",
      })
    } catch (error) {
      console.error("Failed to start milestone:", error)
      toast({
        title: "Failed to update milestone",
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Milestones</CardTitle>
          <CardDescription>Manage and track the progress of your project milestones</CardDescription>
        </div>
        <Dialog open={addMilestoneDialogOpen} onOpenChange={setAddMilestoneDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
              <DialogDescription>Create a new milestone for this project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="milestone-title" className="text-sm font-medium">
                  Milestone Title
                </label>
                <Input 
                  id="milestone-title" 
                  placeholder="e.g., Mobile Responsiveness Testing" 
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="milestone-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="milestone-description"
                  placeholder="Describe what this milestone involves..."
                  className="min-h-[80px]"
                  value={newMilestoneDescription}
                  onChange={(e) => setNewMilestoneDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="milestone-date" className="text-sm font-medium">
                  Due Date
                </label>
                <Input 
                  id="milestone-date" 
                  type="date" 
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAddMilestoneDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={handleAddNewMilestone}
                disabled={loading || !newMilestoneTitle || !newMilestoneDueDate}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Milestone'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones defined for this project. Add milestones to organize your workflow.
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

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {milestone.status === "completed" ? (
                        <>
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
                        </>
                      ) : milestone.status === "in-progress" ? (
                        <>
                          <Dialog open={completionDialogOpen && (selectedMilestone?.id || selectedMilestone?._id) === (milestone.id || milestone._id)} onOpenChange={(open) => {
                            setCompletionDialogOpen(open);
                            if (!open) setSelectedMilestone(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-1" onClick={() => setSelectedMilestone(milestone)}>
                                <CheckCircle className="h-4 w-4" />
                                Mark as Complete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Complete Milestone</DialogTitle>
                                <DialogDescription>
                                  Mark this milestone as completed and deliver to the buyer
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                  <label htmlFor="completion-note" className="text-sm font-medium">
                                    Completion Note
                                  </label>
                                  <Textarea
                                    id="completion-note"
                                    placeholder="Add a note about this milestone completion..."
                                    className="min-h-[100px]"
                                    value={completionNote}
                                    onChange={(e) => setCompletionNote(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Attach Deliverable</label>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                  />
                                  <div 
                                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={triggerFileUpload}
                                  >
                                    {selectedFile ? (
                                      <>
                                        <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                                        <p className="text-sm font-medium mb-1">{selectedFile.name}</p>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="mt-1"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedFile(null)
                                          }}
                                        >
                                          Change file
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm mb-1">Drag and drop files here</p>
                                        <Button size="sm" variant="outline">
                                          Browse Files
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCompletionDialogOpen(false)
                                    setSelectedMilestone(null)
                                    setSelectedFile(null)
                                    setCompletionNote("")
                                  }}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleCompleteMilestone}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    'Complete & Deliver'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleStartMilestone(milestone.id || milestone._id)}
                            disabled={loading}
                          >
                            <Clock className="h-4 w-4" />
                            Start Working
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </>
                      )}
                  
                    </div>
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