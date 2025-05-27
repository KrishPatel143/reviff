'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { FileText, Download, Paperclip, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { addMessage } from "@/lib/api/order"

export function MessageList({ messages: initialMessages = [], seller, orderId }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [file, setFile] = useState("")
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return
    
    try {
      setSending(true)
      
      // Create form data to handle file upload
      const formData = {
        text: newMessage,
        attachment: file,
        // description: "Your message has been sent successfully."
      }
      
      const response = await addMessage(orderId, formData)
      
      // Format the response to match local state structure
      const formattedMessage = {
        id: response._id || Date.now().toString(),
        sender: "buyer",
        text: newMessage,
        createdAt: new Date().toISOString(),
        attachment: file ? {
          name: file.name,
          url: URL.createObjectURL(file)
        } : null
      }
      
      // Update local message state with new message
      setMessages([...messages, formattedMessage])
      
      // Reset form
      setNewMessage("")
      setFile(null)
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    
    // Check if timestamp is already formatted
    if (typeof timestamp === 'string' && timestamp.includes('•')) return timestamp
    
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
        <CardDescription>Communication history between you and the seller</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-[600px] overflow-y-auto p-1">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
                <div
                key={message._id}
                className={`flex ${message.sender === "buyer" ? "justify-end" : "justify-start"}`}
                >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-lg p-4 ${
                    message.sender === "buyer" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.sender === "seller" && (
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={seller?.avatar || "/placeholder.svg"}
                          alt={seller?.name || "Seller"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {message.sender === "buyer" ? "You" : seller?.name || "Seller"}
                      </p>
                      <p
                        className={`text-xs ${message.sender === "buyer" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {formatTime(message.createdAt || message.time)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  {message.attachment && (
                    <div className="mt-2 p-2 bg-background rounded flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{
                        typeof message.attachment === 'string' 
                          ? "Attachment" 
                          : message.attachment.name || "Attachment"
                      }</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto h-7 w-7 p-0"
                        onClick={() => window.open(
                          typeof message.attachment === 'string'
                            ? message.attachment
                            : message.attachment.url,
                          '_blank'
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="icon" className="shrink-0" onClick={triggerFileUpload}>
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {file && (
            <div className="px-2 py-1 bg-muted rounded text-xs flex items-center gap-1">
              {file.name}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => setFile(null)}
              >
                ✕
              </Button>
            </div>
          )}
          
          <Input 
            placeholder="Type your message..." 
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          
          <Button 
            size="sm" 
            className="shrink-0 gap-1"
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && !file)}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}