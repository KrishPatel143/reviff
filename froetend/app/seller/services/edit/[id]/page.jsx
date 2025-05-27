"use client"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Upload, Plus, Trash2, ArrowLeft, Save, Eye, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getServiceById ,updateService} from "@/lib/api/services"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/apiClient"
import { uploadSingleFile } from "@/lib/api/order"
// import { getServiceById, updateService } from "@/lib/api/services"

// Categories and subcategories mapping
const categoryOptions = {
  "Graphics & Design": [
    "Logo Design", 
    "Brand Identity", 
    "Web Design", 
    "Packaging Design",
    "Social Media Design"
  ],
  "Digital Marketing": [
    "Social Media Marketing",
    "SEO",
    "Content Marketing",
    "Email Marketing",
    "PPC"
  ],
  "Writing & Translation": [
    "Content Writing",
    "Copywriting",
    "Translation",
    "Proofreading",
    "Technical Writing"
  ],
  "Video & Animation": [
    "Video Editing",
    "Animation",
    "Motion Graphics",
    "Explainer Videos",
    "Video Production"
  ],
  "Programming & Tech": [
    "Web Development",
    "Mobile Development",
    "WordPress",
    "Game Development",
    "E-commerce Development"
  ]
}

export default function EditServicePage({ params }) {
  const unwrappedParams = use(params)
  const serviceId = unwrappedParams.id
  const router = useRouter();
  const [serviceData, setServiceData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [subcategories, setSubcategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [currentPackage, setCurrentPackage] = useState("basic")
  const [imageFiles, setImageFiles] = useState([])
  const [requirements, setRequirements] = useState([])
  const [faqs, setFaqs] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch service data on component mount
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true)
        const data = await getServiceById(serviceId)
        
        // Set the main service data
        setServiceData(data)
        setOriginalData(JSON.parse(JSON.stringify(data))) // Deep copy for comparison
        
        // Set category and subcategories
        setSelectedCategory(data.category)
        setSubcategories(categoryOptions[data.category] || [])
        
        // Set requirements array
        if (data.requirements) {
          setRequirements(typeof data.requirements === 'string' 
            ? data.requirements.split('\n').filter(req => req.trim()) 
            : data.requirements || []
          )
        } else {
          setRequirements([
            "What is your business/project about?",
            "Do you have any specific design preferences?",
            "Do you have any existing brand assets (logo, colors, etc.)?"
          ])
        }
        
        // Set FAQs - use default if none exist
        setFaqs(data.faqs && data.faqs.length > 0 ? data.faqs : [
          {
            question: "Do you provide source files?",
            answer: "Yes, all packages include source files upon completion of the project."
          },
          {
            question: "How many revisions do you offer?",
            answer: "The number of revisions depends on the package you choose. Basic includes 1 revision, Standard includes 3 revisions, and Premium includes unlimited revisions."
          }
        ])
        
        setError(null)
      } catch (err) {
        console.error("Error fetching service:", err)
        setError("Failed to load service data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchServiceData()
    }
  }, [serviceId])

  // Track changes for unsaved changes warning
  useEffect(() => {
    if (originalData && serviceData) {
      const hasChanges = JSON.stringify(serviceData) !== JSON.stringify(originalData) ||
                        JSON.stringify(requirements) !== JSON.stringify(originalData.requirements) ||
                        JSON.stringify(faqs) !== JSON.stringify(originalData.faqs)
      setHasUnsavedChanges(hasChanges)
    }
  }, [serviceData, originalData, requirements, faqs])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setServiceData({
      ...serviceData,
      [name]: value
    })
  }

  // Handle nested input changes for pricing packages
  const handleNestedInputChange = (e, field, subfield, index = null) => {
    const { name, value } = e.target
    
    if (index !== null) {
      // Handle array items (like packages)
      const updatedItems = [...serviceData[field][subfield]]
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: name === "price" || name === "deliveryTime" ? parseInt(value) || 0 : value
      }
      
      setServiceData({
        ...serviceData,
        [field]: {
          ...serviceData[field],
          [subfield]: updatedItems
        }
      })
    } else {
      // Handle simple nested fields
      setServiceData({
        ...serviceData,
        [field]: {
          ...serviceData[field],
          [subfield]: value
        }
      })
    }
  }

  // Handle category selection
  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setSubcategories(categoryOptions[value] || [])
    setServiceData({
      ...serviceData,
      category: value,
      subcategory: ""
    })
  }

  // Handle subcategory selection
  const handleSubcategoryChange = (value) => {
    setServiceData({
      ...serviceData,
      subcategory: value
    })
  }

  // Handle service status toggle
  const handleStatusToggle = (checked) => {
    setServiceData({
      ...serviceData,
      isActive: checked
    })
  }

  // Handle package feature changes
  const handleFeatureChange = (packageIndex, featureIndex, value) => {
    const updatedPackages = [...serviceData.pricing.packages]
    const features = [...updatedPackages[packageIndex].includedFeatures]
    features[featureIndex] = value
    
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      includedFeatures: features
    }
    
    setServiceData({
      ...serviceData,
      pricing: {
        ...serviceData.pricing,
        packages: updatedPackages
      }
    })
  }

  // Add a new feature to a package
  const addFeature = (packageIndex) => {
    const updatedPackages = [...serviceData.pricing.packages]
    updatedPackages[packageIndex].includedFeatures.push("New feature")
    
    setServiceData({
      ...serviceData,
      pricing: {
        ...serviceData.pricing,
        packages: updatedPackages
      }
    })
  }

  // Remove a feature from a package
  const removeFeature = (packageIndex, featureIndex) => {
    const updatedPackages = [...serviceData.pricing.packages]
    updatedPackages[packageIndex].includedFeatures = 
      updatedPackages[packageIndex].includedFeatures.filter((_, i) => i !== featureIndex)
    
    setServiceData({
      ...serviceData,
      pricing: {
        ...serviceData.pricing,
        packages: updatedPackages
      }
    })
  }

  // Handle tag input
  const handleTagAdd = () => {
    if (tagInput.trim() && serviceData.tags && serviceData.tags.length < 5) {
      setServiceData({
        ...serviceData,
        tags: [...(serviceData.tags || []), tagInput.trim()]
      })
      setTagInput("")
    }
  }

  // Remove a tag
  const removeTag = (index) => {
    setServiceData({
      ...serviceData,
      tags: serviceData.tags.filter((_, i) => i !== index)
    })
  }

  // Handle requirement changes
  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...requirements]
    updatedRequirements[index] = value
    setRequirements(updatedRequirements)
  }

  // Add a new requirement
  const addRequirement = () => {
    setRequirements([...requirements, "New requirement"])
  }

  // Remove a requirement
  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  // Handle FAQ changes
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs]
    updatedFaqs[index] = {
      ...updatedFaqs[index],
      [field]: value
    }
    setFaqs(updatedFaqs)
  }

  // Add a new FAQ
  const addFaq = () => {
    setFaqs([...faqs, { question: "New question", answer: "New answer" }])
  }

  // Remove an FAQ
  const removeFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  // Handle image upload
  const handleImageUpload = async(e, isMain = false) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      })
      return
    }
    const fileUploadResponse = await uploadSingleFile(file)
    // In a real app, you would upload to a server/S3 here
    const imageUrl =  fileUploadResponse.file.url;
    
    // Add to image files for later upload
    setImageFiles([...imageFiles, { file, isMain }])
    
    // Add to service data
    setServiceData({
      ...serviceData,
      images: [
        ...(serviceData.images || []),
        {
          url: imageUrl,
          isMain: isMain || (serviceData.images && serviceData.images.length === 0) // First image becomes main if no main exists
        }
      ]
    })
  }

  // Remove an image
  const removeImage = (index) => {
    const updatedImages = [...(serviceData.images || [])]
    updatedImages.splice(index, 1)
    setServiceData({
      ...serviceData,
      images: updatedImages
    })
  }

  // Set image as main
  const setAsMainImage = (index) => {
    const updatedImages = serviceData.images.map((img, i) => ({
      ...img,
      isMain: i === index
    }))
    setServiceData({
      ...serviceData,
      images: updatedImages
    })
  }

  // Validate form data
  const validateForm = () => {
    if (!serviceData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Service title is required",
        variant: "destructive"
      })
      return false
    }

    if (!serviceData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      })
      return false
    }

    if (!serviceData.subcategory) {
      toast({
        title: "Validation Error",
        description: "Subcategory is required",
        variant: "destructive"
      })
      return false
    }

    if (!serviceData.description?.trim() || serviceData.description.length < 120) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 120 characters",
        variant: "destructive"
      })
      return false
    }

    // Validate packages
    if (!serviceData.pricing?.packages || serviceData.pricing.packages.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one pricing package is required",
        variant: "destructive"
      })
      return false
    }

    for (let i = 0; i < serviceData.pricing.packages.length; i++) {
      const pkg = serviceData.pricing.packages[i]
      if (!pkg.name?.trim() || !pkg.description?.trim() || !pkg.price || !pkg.deliveryTime) {
        toast({
          title: "Validation Error",
          description: `Package ${pkg.name || i + 1} is incomplete`,
          variant: "destructive"
        })
        return false
      }
    }

    return true
  }

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the final data
      const finalData = {
        ...serviceData,
        requirements: requirements.join("\n"),
        faqs: faqs
      }
      
      // Update starting price based on lowest package price
      if (finalData.pricing && finalData.pricing.packages && finalData.pricing.packages.length > 0) {
        finalData.pricing.startingAt = Math.min(...finalData.pricing.packages.map(pkg => pkg.price))
      }
      
      // Call the API to update the service
      await updateService(serviceId, finalData)

      
      // Update original data to prevent unsaved changes warning
      setOriginalData(JSON.parse(JSON.stringify(finalData)))
      setHasUnsavedChanges(false)
      
      toast({
        title: "Success!",
        description: "Your service has been updated successfully",
        variant: "default"
      })
      
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save as draft
  const saveAsDraft = async () => {
    try {
      const draftData = {
        ...serviceData,
        requirements: requirements.join("\n"),
        faqs: faqs,
      }
      const response = await updateService(serviceId, draftData)
      
      router.push(`/services/${serviceId}`)
      
      toast({
        title: "Draft Saved",
        description: "Your service changes have been saved as draft",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      })
    }
  }

  // Get starting price for preview
  const getStartingPrice = () => {
    if (serviceData?.pricing && serviceData.pricing.packages && serviceData.pricing.packages.length > 0) {
      return Math.min(...serviceData.pricing.packages.map(pkg => pkg.price || 0))
    }
    return 50
  }

  // Render package tab content
  const renderPackageContent = (packageIndex, packageName) => {
    const pkg = serviceData.pricing?.packages?.[packageIndex]
    if (!pkg) return null

    return (
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <label htmlFor={`${packageName}-name`} className="text-sm font-medium">
            Package Title
          </label>
          <Input 
            id={`${packageName}-name`} 
            name="name"
            value={pkg.name || ""}
            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", packageIndex)}
            className="max-w-xl" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${packageName}-description`} className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id={`${packageName}-description`}
            name="description"
            value={pkg.description || ""}
            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", packageIndex)}
            placeholder="Describe what's included in this package..."
            className="min-h-[100px]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor={`${packageName}-price`} className="text-sm font-medium">
              Price (£)
            </label>
            <Input 
              id={`${packageName}-price`} 
              name="price"
              type="number" 
              value={pkg.price || ""}
              onChange={(e) => handleNestedInputChange(e, "pricing", "packages", packageIndex)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${packageName}-delivery`} className="text-sm font-medium">
              Delivery Time (days)
            </label>
            <Select 
              value={pkg.deliveryTime?.toString() || ""}
              onValueChange={(value) => handleNestedInputChange(
                { target: { name: "deliveryTime", value: parseInt(value) } }, 
                "pricing", 
                "packages", 
                packageIndex
              )}
            >
              <SelectTrigger id={`${packageName}-delivery`}>
                <SelectValue placeholder="Select delivery time" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 7, 10, 14, 21, 30].map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? "day" : "days"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Features Included</label>
          <div className="space-y-2">
            {pkg.includedFeatures?.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox id={`${packageName}-feature-${featureIndex}`} defaultChecked />
                  <Input
                    id={`${packageName}-feature-text-${featureIndex}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(packageIndex, featureIndex, e.target.value)}
                    className="border-none p-0 h-auto text-sm focus-visible:ring-0"
                  />
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => removeFeature(packageIndex, featureIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="gap-1 mt-2"
            onClick={() => addFeature(packageIndex)}
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading service data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-500 mb-2">{error}</p>
          <p className="text-muted-foreground">Please try again or contact support if the problem persists.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/seller/services">
            <Button variant="outline">Back to Services</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Service not found
  if (!serviceData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center mb-6">
          <p className="text-lg mb-2">Service not found</p>
          <p className="text-muted-foreground">The service you're looking for doesn't exist or you don't have permission to edit it.</p>
        </div>
        <Link href="/seller/services">
          <Button variant="outline">Back to Services</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/seller/services">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Services
                    </Button>
                  </Link>
                  <Link href={`/services/${serviceId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Preview Service
                    </Button>
                  </Link>
                </div>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You have unsaved changes</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Edit Service</h1>
                <p className="text-muted-foreground">Update your service details and settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Service Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Status</CardTitle>
                    <CardDescription>Control the visibility of your service</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="service-status" className="text-sm font-medium">
                          Service Active
                        </label>
                        <p className="text-xs text-muted-foreground">
                          When enabled, your service will be visible to buyers
                        </p>
                      </div>
                      <Switch
                        id="service-status"
                        checked={serviceData.isActive || false}
                        onCheckedChange={handleStatusToggle}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the essential details about your service</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Service Title *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={serviceData.title || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., I will design a professional website for your business"
                        className="max-w-xl"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Your title should be clear, specific, and attention-grabbing (max 80 characters)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </label>
                      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category" className="max-w-xl">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(categoryOptions).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subcategory" className="text-sm font-medium">
                        Subcategory *
                      </label>
                      <Select 
                        value={serviceData.subcategory || ""} 
                        onValueChange={handleSubcategoryChange}
                        disabled={subcategories.length === 0}
                      >
                        <SelectTrigger id="subcategory" className="max-w-xl">
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Service Description *
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={serviceData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Describe your service in detail..."
                        className="min-h-[200px]"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Provide a comprehensive description of what you offer (minimum 120 characters)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags (Up to 5)</label>
                      <div className="flex flex-wrap gap-2">
                        {serviceData.tags?.map((tag, index) => (
                          <div key={index} className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <span className="text-sm">{tag}</span>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => removeTag(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {(!serviceData.tags || serviceData.tags.length < 5) && (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add a tag"
                              className="w-32"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleTagAdd();
                                }
                              }}
                            />
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              onClick={handleTagAdd}
                              disabled={!tagInput.trim() || (serviceData.tags && serviceData.tags.length >= 5)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {5 - (serviceData.tags?.length || 0)} tags remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Images</CardTitle>
                    <CardDescription>Update images that showcase your work (up to 5 images)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Display existing images */}
                      {serviceData.images?.map((image, index) => (
                        <div key={index} className="relative border-2 border-dashed rounded-lg p-2">
                          <div className="relative w-full h-32">
                            <img 
                              src={API_URL + image.url} 
                              alt={`Service image ${index + 1}`} 
                              className="w-full h-full object-cover rounded-md cursor-pointer"
                              onClick={() => setAsMainImage(index)}
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {image.isMain && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Main</span>
                              )}
                              <Button 
                                type="button"
                                variant="destructive" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {!image.isMain && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 text-xs"
                              onClick={() => setAsMainImage(index)}
                            >
                              Set as Main
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add new image slots if less than 5 */}
                      {(!serviceData.images || serviceData.images.length < 5) && (
                        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center aspect-video">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Add Image</p>
                          <div className="mt-2">
                            <input
                              type="file"
                              id="add-image"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false)}
                            />
                            <label htmlFor="add-image">
                              <Button type="button" variant="outline" size="sm" asChild>
                                <span>Upload</span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Images should be high quality and clearly showcase your work. Click on an image to set it as main. Maximum file size: 5MB.
                    </p>
                  </CardContent>
                </Card>

                {/* Pricing Packages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Packages</CardTitle>
                    <CardDescription>Update your service tiers and pricing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={currentPackage} onValueChange={setCurrentPackage} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="standard">Standard</TabsTrigger>
                        <TabsTrigger value="premium">Premium</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic">
                        {renderPackageContent(0, "basic")}
                      </TabsContent>
                      
                      <TabsContent value="standard">
                        {renderPackageContent(1, "standard")}
                      </TabsContent>
                      
                      <TabsContent value="premium">
                        {renderPackageContent(2, "premium")}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Buyer Requirements</CardTitle>
                    <CardDescription>Update what information you need from buyers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <Checkbox id={`requirement-${index}`} defaultChecked />
                            <Input
                              id={`requirement-text-${index}`}
                              value={requirement}
                              onChange={(e) => handleRequirementChange(index, e.target.value)}
                              className="border-none p-0 h-auto text-sm focus-visible:ring-0"
                              placeholder="Enter requirement"
                            />
                          </div>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => removeRequirement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={addRequirement}
                    >
                      <Plus className="h-4 w-4" />
                      Add Requirement
                    </Button>
                  </CardContent>
                </Card>

                {/* FAQs */}
                <Card>
                  <CardHeader>
                    <CardTitle>FAQs</CardTitle>
                    <CardDescription>Update frequently asked questions to help potential buyers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                              className="font-medium border-none p-0 focus-visible:ring-0"
                              placeholder="Enter question"
                            />
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => removeFaq(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                            className="min-h-[80px] border-none focus-visible:ring-0"
                            placeholder="Enter answer"
                          />
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={addFaq}
                    >
                      <Plus className="h-4 w-4" />
                      Add FAQ
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Service Preview</CardTitle>
                    <CardDescription>How your service will appear to buyers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      {serviceData.images && serviceData.images.length > 0 ? (
                        <img 
                          src={API_URL + serviceData.images.find(img => img.isMain)?.url || API_URL + serviceData.images[0].url} 
                          alt="Main service preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold line-clamp-2">
                      {serviceData.title || "Service title"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <span className="text-sm">{serviceData.sellerName || "Your Name"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Starting at</span>
                      <span className="font-bold">£{getStartingPrice()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${serviceData.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">
                        {serviceData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}  onClick={saveAsDraft}
                      >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Updating..." : "Update Service"}
                    </Button>

                    <Link href={`/services/${serviceId}`} className="w-full">
                      <Button variant="ghost" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        Preview Live
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
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