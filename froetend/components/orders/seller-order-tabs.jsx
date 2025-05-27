'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SellerMessageList } from "./seller-message-list"
import { SellerFileList } from "./seller-file-list"
import { SellerMilestonesList } from "./seller-milestones-list"

export function SellerOrderTabs({ order }) {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return ""
    // Check if date is already formatted
    if (typeof dateString === 'string' && dateString.includes(" ")) return dateString
    
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Get color for status
  const getStatusClassColor = (status) => {
    const statusColors = {
      "completed": "bg-green-500",
      "in-progress": "bg-blue-500",
      "pending": "bg-gray-300"
    }
    
    return statusColors[status] || "bg-gray-300"
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="milestones">Milestones</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Project Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {order.requirements ? (
                  <div className="space-y-2">
                    {typeof order.requirements === 'string' ? (
                      <p className="text-muted-foreground">{order.requirements}</p>
                    ) : Array.isArray(order.requirements) ? (
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {order.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific requirements provided.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.milestones && order.milestones
                    .filter((m) => m.status !== "completed")
                    .slice(0, 3)
                    .map((milestone, index) => (
                      <div key={milestone.id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {milestone.status === "in-progress" ? (
                            <Clock className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              milestone.status === "in-progress" ? "font-medium" : "text-muted-foreground"
                            }
                          >
                            {milestone.title}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDate(milestone.date || milestone.dueDate)}</span>
                      </div>
                    ))}
                  
                  {(!order.milestones || order.milestones.filter(m => m.status !== "completed").length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming milestones
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.files && order.files.slice(0, 3).map((file, index) => (
                    <div key={file.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(!order.files || order.files.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No files uploaded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{order.buyer?.name || "Anonymous"}</span>
                  </div>
                  {order.buyer?.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{order.buyer.email}</span>
                    </div>
                  )}
                  {order.buyer?.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{order.buyer.location}</span>
                    </div>
                  )}
                  {order.buyer?.joinedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-medium">{formatDate(order.buyer.joinedAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Messages Tab */}
      <TabsContent value="messages" className="pt-6">
        <SellerMessageList messages={order.messages} buyer={order.buyer} orderId={order._id || order.id} />
      </TabsContent>

      {/* Files Tab */}
      <TabsContent value="files" className="pt-6">
        <SellerFileList files={order.files} orderId={order._id || order.id} />
      </TabsContent>

      {/* Milestones Tab */}
      <TabsContent value="milestones" className="pt-6">
        <SellerMilestonesList milestones={order.milestones} orderId={order._id || order.id} />
      </TabsContent>
    </Tabs>
  )
}