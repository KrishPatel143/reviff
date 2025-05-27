// components/orders/order-tabs.jsx
'use client'

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Clock, Download } from "lucide-react"
import { getStatusColor, getFileIcon } from "@/lib/data/mock-order"
import { Button } from "@/components/ui/button"
import { MessageList } from "./message-list"
import { FileList } from "./file-list"
import { MilestonesList } from "./milestones-list"
import Image from "next/image"

export function OrderTabs({ order }) {
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
        <OverviewTab order={order} />
      </TabsContent>

      {/* Messages Tab */}
      <TabsContent value="messages" className="pt-6">
        <MessageList messages={order.messages} seller={order.seller} orderId={order._id} />
      </TabsContent>

      {/* Files Tab */}
      <TabsContent value="files" className="pt-6">
        <FileList files={order.files} orderId={order._id} />
      </TabsContent>

      {/* Milestones Tab */}
      <TabsContent value="milestones" className="pt-6">
        <MilestonesList milestones={order.milestones} orderId={order._id} />
      </TabsContent>
    </Tabs>
  )
}

// Overview Tab Content
function OverviewTab({ order }) {
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
    if (typeof getStatusColor === 'function') {
      return getStatusColor(status)
    }
    
    // Fallback if getStatusColor is not available
    const statusColors = {
      "completed": "bg-green-500",
      "in-progress": "bg-blue-500",
      "pending": "bg-gray-300"
    }
    
    return statusColors[status] || "bg-gray-300"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.milestones && order.milestones
                .filter((m) => m.status !== "pending")
                .slice(0, 3)
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${getStatusClassColor(milestone.status)}`} />
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {milestone.status === "completed" ? "Completed on " : "In progress since "}
                        {formatDate(milestone.date || milestone.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              
              {(!order.milestones || order.milestones.filter(m => m.status !== "pending").length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent updates available
                </div>
              )}
            </div>
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
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between">
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
              {order.files && order.files.slice(0, 3).map((file) => {
                // Get file icon function is optional
                const FileIcon = typeof getFileIcon === 'function' 
                  ? getFileIcon(file.type || file.fileType, (props) => <span {...props} />, Image)
                  : <FileText className="h-4 w-4" />;
                
                return (
                  <div key={file.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {FileIcon}
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
                );
              })}
              
              {(!order.files || order.files.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No files uploaded yet
                </div>
              )}
            </div>
          </CardContent>
          {order.files && order.files.length > 0 && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="#files">View All Files</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}