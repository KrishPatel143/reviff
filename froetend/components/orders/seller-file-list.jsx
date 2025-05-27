'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { FileText, Download, Upload, Loader2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner";

import { uploadFile } from "@/lib/api/order"

export function SellerFileList({ files: initialFiles = [], orderId }) {
  const [files, setFiles] = useState(initialFiles)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileDescription, setFileDescription] = useState("")
  const [fileType, setFileType] = useState("deliverable")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    // Check if date is already formatted
    if (typeof timestamp === 'string' && timestamp.includes(" ")) return timestamp
    
    const date = new Date(timestamp)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Format bytes to readable size
  const formatSize = (bytes) => {
    if (!bytes) return ""
    if (typeof bytes === 'string' && !isNaN(bytes)) bytes = parseInt(bytes)
    if (typeof bytes === 'string' && bytes.includes(" ")) return bytes
    if (isNaN(bytes)) return "Unknown size"
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
  }

  // Function to get file icon based on file type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <Image
            src="/placeholder.svg?height=20&width=20"
            alt="Image"
            width={20}
            height={20}
            className="h-5 w-5 rounded"
          />
        )
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    
    try {
      setUploading(true)
      
      // Create form data to handle file upload
      const formData = {
        name: selectedFile.name,
        url: "selectedFile",
        size: selectedFile.size,
        description: fileDescription,
        type: fileType
      }
    
      const response = await uploadFile(orderId, formData)
      
      // Format the response to match local state structure
      const formattedFile = {
        id: response._id || Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        fileType: fileType,
        size: selectedFile.size,
        createdAt: new Date().toISOString(),
        url: response.url || URL.createObjectURL(selectedFile),
        description: fileDescription
      }
      
      // Update local files state with new file
      setFiles([...files, formattedFile])
      
      setUploadDialogOpen(false)
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      })
      
      // Reset form
      setSelectedFile(null)
      setFileDescription("")
      setFileType("deliverable")
    } catch (error) {
      console.error("Failed to upload file:", error)
      toast({
        title: "Failed to upload file",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      // Here you would typically call an API to delete the file
      // await deleteFile(orderId, fileId);
      
      // Update the local state
      setFiles(files.filter(file => file.id !== fileId))
      
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast({
        title: "Failed to delete file",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Files</CardTitle>
          <CardDescription>All files shared between you and the buyer</CardDescription>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Upload a file to share with the buyer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleBrowseFiles}
              >
                {selectedFile ? (
                  <>
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(selectedFile.size)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
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
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                    <p className="text-xs text-muted-foreground mb-2">or</p>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBrowseFiles()
                      }}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max file size: 10MB. Supported formats: PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="file-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="file-description"
                  placeholder="Add a description for this file..."
                  className="min-h-[80px]"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="file-type" className="text-sm font-medium">
                  File Type
                </label>
                <Select defaultValue="deliverable" onValueChange={setFileType}>
                  <SelectTrigger id="file-type">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deliverable">Deliverable</SelectItem>
                    <SelectItem value="draft">Draft / Work in Progress</SelectItem>
                    <SelectItem value="reference">Reference Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No files have been shared yet.
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type || file.fileType)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.createdAt || file.date)}</span>
                      {file.fileType && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{file.fileType}</span>
                        </>
                      )}
                    </div>
                    {file.description && (
                      <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mark as Deliverable</DropdownMenuItem>
                      <DropdownMenuItem>Replace File</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}