'use client'
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import React from "react" // Added React import for React.use()
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Search, User, Clock, CheckCircle, Upload, Star, HelpCircle, Plus, Trash2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"  
import { addOrder } from "@/lib/api/order"
import { useRouter } from "next/navigation"


export default function OrderPage({ params }) {
  // Properly unwrap the params promise using React.use()
  const unwrappedParams = React.use(params)
  const serviceId = unwrappedParams?.id || "507f1f77bcf86cd799439011" // Fallback to example ID if id is undefined
  
  const router = useRouter()
  const [packageSelected, setPackageSelected] = useState("Standard")
  const [requirements, setRequirements] = useState("")
  const [initialMessage, setInitialMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [additionalServices, setAdditionalServices] = useState([
    { id: "extra-1", name: "Express Delivery (24 hours)", price: 50, selected: false },
    { id: "extra-2", name: "Additional Revision", price: 30, selected: false },
    { id: "extra-3", name: "Content Creation", price: 75, selected: false }
  ])
  
  // Set a default due date 14 days from now
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString())
  
  // Initialize with default milestones
  const [milestones, setMilestones] = useState([
    {
      title: "Initial Concepts",
      description: "First draft of deliverables",
      status: "pending",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    },
    {
      title: "Revisions",
      description: "Revisions based on feedback",
      status: "pending",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days from now
    },
    {
      title: "Final Delivery",
      description: "Final delivery with all files",
      status: "pending",
      date: defaultDueDate.toISOString()
    }
  ])

  // Update milestones when due date changes
  const handleDueDateChange = (e) => {
    const newDueDate = new Date(e.target.value)
    setDueDate(newDueDate.toISOString())
    
    // Update the final milestone date
    const updatedMilestones = [...milestones]
    updatedMilestones[updatedMilestones.length - 1].date = newDueDate.toISOString()
    setMilestones(updatedMilestones)
  }

  // Toggle additional services
  const toggleAdditionalService = (id) => {
    setAdditionalServices(
      additionalServices.map(service => 
        service.id === id 
          ? { ...service, selected: !service.selected } 
          : service
      )
    )
  }

  // Add new milestone
  const addMilestone = () => {
    const newMilestone = {
      title: "New Milestone",
      description: "Description for this milestone",
      status: "pending",
      date: new Date().toISOString()
    }
    setMilestones([...milestones, newMilestone])
  }

  // Remove milestone
  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  // Update milestone
  const updateMilestone = (index, field, value) => {
    const updatedMilestones = [...milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    }
    setMilestones(updatedMilestones)
  }

  // Calculate order totals
  const getBasePrice = () => {
    switch (packageSelected) {
      case "Basic": return 99
      case "Standard": return 199
      case "Premium": return 299
      default: return 199
    }
  }
  
  const getAdditionalServicesTotal = () => {
    return additionalServices
      .filter(service => service.selected)
      .reduce((total, service) => total + service.price, 0)
  }
  
  const getSubtotal = () => {
    return getBasePrice() + getAdditionalServicesTotal()
  }
  
  const getServiceFee = () => {
    return Math.round(getSubtotal() * 0.1) // 10% service fee
  }
  
  const getTotal = () => {
    return getSubtotal() + getServiceFee()
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the order data
      const orderData = {
        serviceId: serviceId, // Use the unwrapped serviceId
        packageSelected,
        requirements,
        initialMessage,
        dueDate,
        milestones,
        additionalServices: additionalServices
          .filter(service => service.selected)
          .map(({ name, price }) => ({ name, price }))
      }
      
      // Submit the order
      const response = await addOrder(orderData)
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted to the seller.",
        variant: "success"
      })
      
      // Redirect to order confirmation page
      router.push(`/orders/${response.id }`)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the expected delivery date as a formatted string
  const getFormattedDeliveryDate = () => {
    const date = new Date(dueDate)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Reused from home page */}


      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link href="/services" className="text-muted-foreground hover:text-foreground">
                Services
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link href={`/services/${serviceId}`} className="text-muted-foreground hover:text-foreground">
                Service {serviceId}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span>Order</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Place Your Order</h1>
              <p className="text-muted-foreground">Complete your order details to hire this freelancer</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Service Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden">
                          <Image
                            src={`/placeholder.svg?height=112&width=160&text=Service ${serviceId}`}
                            alt={`Service ${serviceId}`}
                            width={160}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">
                            I will create a professional website design for your business
                          </h3>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full overflow-hidden">
                                <Image
                                  src="/placeholder.svg?height=24&width=24"
                                  alt="Seller"
                                  width={24}
                                  height={24}
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm">John Doe</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs font-medium">4.9</span>
                              <span className="text-xs text-muted-foreground">(120)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{packageSelected} Package</Badge>
                            <span className="text-sm text-muted-foreground">
                              Delivery by {getFormattedDeliveryDate()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Requirements</CardTitle>
                      <CardDescription>
                        Provide details about your project to help the seller deliver exactly what you need
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="requirements" className="text-sm font-medium">
                            Project Requirements
                          </label>
                          <Textarea
                            id="requirements"
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Describe your project requirements in detail. Include as much information as possible to help the seller understand your needs."
                            className="min-h-[150px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="initial-message" className="text-sm font-medium">
                            Initial Message to Seller
                          </label>
                          <Textarea
                            id="initial-message"
                            value={initialMessage}
                            onChange={(e) => setInitialMessage(e.target.value)}
                            placeholder="Add a personal message to the seller to start your conversation."
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Package Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Package Details</CardTitle>
                      <CardDescription>Select your preferred package</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs 
                        value={packageSelected} 
                        onValueChange={setPackageSelected} 
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="Basic">Basic</TabsTrigger>
                          <TabsTrigger value="Standard">Standard</TabsTrigger>
                          <TabsTrigger value="Premium">Premium</TabsTrigger>
                        </TabsList>
                        <TabsContent value="Basic" className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Basic Package</h4>
                              <span className="font-bold text-xl">£99</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Perfect for small businesses looking for a simple website.
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>3 day delivery</span>
                            </div>
                            <div className="space-y-2">
                              {["3 page website", "Responsive design", "Contact form", "1 revision"].map(
                                (feature, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="Standard" className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Standard Package</h4>
                              <span className="font-bold text-xl">£199</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Great for growing businesses with more content needs.
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>5 day delivery</span>
                            </div>
                            <div className="space-y-2">
                              {[
                                "5 page website",
                                "Responsive design",
                                "Contact form",
                                "Social media integration",
                                "3 revisions",
                                "SEO optimization",
                              ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="Premium" className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Premium Package</h4>
                              <span className="font-bold text-xl">£299</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Complete solution for established businesses.</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>7 day delivery</span>
                            </div>
                            <div className="space-y-2">
                              {[
                                "10 page website",
                                "Responsive design",
                                "Contact form",
                                "Social media integration",
                                "Unlimited revisions",
                                "SEO optimization",
                                "Google Analytics setup",
                                "E-commerce functionality",
                                "Content upload",
                              ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Milestones */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Milestones</CardTitle>
                      <CardDescription>Define key milestones for your project</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="due-date" className="text-sm font-medium">
                          Final Delivery Date
                        </label>
                        <Input
                          id="due-date"
                          type="date"
                          value={new Date(dueDate).toISOString().split('T')[0]}
                          onChange={handleDueDateChange}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          This date will be used as the final milestone date
                        </p>
                      </div>

                      <div className="space-y-4">
                        {milestones.map((milestone, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Input
                                value={milestone.title}
                                onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                className="font-medium border-none p-0 focus-visible:ring-0"
                                placeholder="Milestone Title"
                              />
                              {milestones.length > 1 && (
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeMilestone(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              className="min-h-[60px] text-sm"
                              placeholder="Milestone description"
                            />
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block">Date</label>
                                <Input
                                  type="date"
                                  value={new Date(milestone.date).toISOString().split('T')[0]}
                                  onChange={(e) => {
                                    const newDate = new Date(e.target.value)
                                    updateMilestone(index, 'date', newDate.toISOString())
                                  }}
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block">Status</label>
                                <select
                                  value={milestone.status}
                                  onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        onClick={addMilestone}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Milestone
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Additional Services */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Services</CardTitle>
                      <CardDescription>Enhance your order with these extra services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {additionalServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                id={service.id} 
                                checked={service.selected}
                                onCheckedChange={() => toggleAdditionalService(service.id)}
                              />
                              <div>
                                <label htmlFor={service.id} className="font-medium">
                                  {service.name}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {service.id === "extra-1" && "Get your project delivered within 24 hours"}
                                  {service.id === "extra-2" && "Get 2 extra revisions beyond package limit"}
                                  {service.id === "extra-3" && "Professional content writing for your website"}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium">+£{service.price}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{packageSelected} Package</span>
                          <span>£{getBasePrice().toFixed(2)}</span>
                        </div>
                        
                        {/* Additional services summary */}
                        {additionalServices.filter(s => s.selected).map(service => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{service.name}</span>
                            <span>£{service.price.toFixed(2)}</span>
                          </div>
                        ))}
                        
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Subtotal</span>
                          <span>£{getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Service Fee</span>
                          <span>£{getServiceFee().toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>£{getTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Delivery by {getFormattedDeliveryDate()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Place Order"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          By placing this order, you agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6 space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="payment">
                        <AccordionTrigger className="text-sm font-medium">Payment Methods</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <p>We accept the following payment methods:</p>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                              <li>Credit/Debit Cards</li>
                              <li>PayPal</li>
                              <li>Bank Transfer</li>
                            </ul>
                            <p className="text-muted-foreground">
                              Your payment is secure and protected by our buyer protection policy.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="faq">
                        <AccordionTrigger className="text-sm font-medium">Frequently Asked Questions</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium">When will my order start?</p>
                              <p className="text-muted-foreground">
                                Your order will start as soon as your payment is confirmed and you provide all the
                                required information.
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">What if I'm not satisfied with the work?</p>
                              <p className="text-muted-foreground">
                                You can request revisions according to your package, or contact customer support if you
                                need further assistance.
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Can I cancel my order?</p>
                              <p className="text-muted-foreground">
                                You can cancel your order before the seller starts working on it for a full refund.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="support">
                        <AccordionTrigger className="text-sm font-medium">Need Help?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <p>If you have any questions or need assistance, our support team is here to help.</p>
                            <Button variant="outline" size="sm" className="gap-1 mt-2">
                              <HelpCircle className="h-4 w-4" />
                              Contact Support
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer - Reused from home page */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Graphics & Design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Digital Marketing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Writing & Translation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Video & Animation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Programming & Tech
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">About</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Partnerships
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Selling on Riveff
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Buying on Riveff
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Affiliates
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center border-t py-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-bold">Riveff</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} Riveff. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}