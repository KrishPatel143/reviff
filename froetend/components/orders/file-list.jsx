// components/orders/file-list.jsx
'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { FileText, Download, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { uploadFile,uploadSingleFile } from "@/lib/api/order"
import { getFileIcon } from "@/lib/data/mock-order"
import { API_URL } from "@/lib/apiClient"

export function FileList({ files: initialFiles = [], orderId }) {
  const [files, setFiles] = useState(initialFiles)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileDescription, setFileDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  // Max file size (10MB)
  const maxFileSize = 10 * 1024 * 1024

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    if (typeof timestamp === 'string' && timestamp.includes(" ")) return timestamp
    
    const date = new Date(timestamp)
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
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
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Validate file
  const validateFile = (file) => {
    if (!file) return "No file selected"
    
    if (file.size > maxFileSize) {
      return "File size exceeds 10MB limit"
    }
    
    if (!supportedTypes.includes(file.type)) {
      return "File type not supported. Please use PDF, JPG, PNG, DOC, or DOCX files."
    }
    
    return null
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast.error("Invalid file", {
          description: error
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles?.[0]) {
      const file = droppedFiles[0]
      const error = validateFile(file)
      if (error) {
        toast.error("Invalid file", {
          description: error
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    
    const validationError = validateFile(selectedFile)
    if (validationError) {
      toast.error("Invalid file", {
        description: validationError
      })
      return
    }
    
    try {
      setUploading(true)
      
      // Upload file to server
      const fileUploadResponse = await uploadSingleFile(selectedFile)
      
      if (!fileUploadResponse.success) {
        throw new Error(fileUploadResponse.message || 'File upload failed')
      }

      // Create form data to associate file with order
      const formData = {
        name: fileUploadResponse.file.filename,
        originalName: fileUploadResponse.file.originalName,
        url: fileUploadResponse.file.url,
        size: fileUploadResponse.file.size,
        type: fileUploadResponse.file.mimetype,
        description: fileDescription.trim()
      }
   
      const response = await uploadFile(orderId, formData)
      
      // Format the response to match local state structure
      const formattedFile = {
        id: response._id || Date.now().toString(),
        name: fileUploadResponse.file.originalName || selectedFile.name,
        type: fileUploadResponse.file.mimetype || selectedFile.type,
        size: fileUploadResponse.file.size || selectedFile.size,
        createdAt: new Date().toISOString(),
        url: fileUploadResponse.file.url,
        description: fileDescription.trim()
      }
      
      // Update local files state with new file
      setFiles(prevFiles => [...prevFiles, formattedFile])
      
      // Close dialog and reset form
      setUploadDialogOpen(false)
      resetForm()
      
      toast.success("File uploaded", {
        description: "Your file has been uploaded successfully."
      })
      
    } catch (error) {
      console.error("Failed to upload file:", error)
      toast.error("Failed to upload file", {
        description: error.message || "Please try again later."
      })
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setFileDescription("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDialogClose = () => {
    if (!uploading) {
      setUploadDialogOpen(false)
      resetForm()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Files</CardTitle>
          <CardDescription>All files shared between you and the seller</CardDescription>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Upload a file to share with the seller</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={handleBrowseFiles}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
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
                      <X className="h-4 w-4 mr-1" />
                      Remove file
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                    </p>
                    <p className="text-xs text-muted-foreground">or</p>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBrowseFiles()
                      }}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Max file size: 10MB<br />
                      Supported formats: PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="file-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="file-description"
                  placeholder="Add a description for this file..."
                  className="min-h-[80px] resize-none"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  disabled={uploading}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {fileDescription.length}/500
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleDialogClose}
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
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files have been shared yet.</p>
              <p className="text-xs">Upload a file to get started.</p>
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/25 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file.type || file.fileType, FileText, Image)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.createdAt || file.date)}</span>
                    </div>
                    {file.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            if (file.url) {
                              window.open(API_URL + file.url, '_blank', 'noopener,noreferrer')
                            } else {
                              toast.error("File not available", {
                                description: "The file URL is not accessible."
                              })
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}