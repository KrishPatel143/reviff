"use client"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User, Upload, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AddService } from "@/lib/api/services"
import { API_URL } from "@/lib/apiClient"
import { uploadSingleFile } from "@/lib/api/order"

// Default service template structure
const defaultServiceData = {
  title: "",
  description: "",
  sellerId: "", // Will be populated from user context
  sellerName: "", // Will be populated from user context
  sellerLevel: "", // Will be populated from user context
  category: "",
  subcategory: "",
  tags: [],
  pricing: {
    startingAt: 50,
    packages: [
      {
        name: "Basic",
        description: "",
        deliveryTime: 3,
        price: 50,
        includedFeatures: ["Source files", "1 revision"]
      },
      {
        name: "Standard", 
        description: "",
        deliveryTime: 5,
        price: 100,
        includedFeatures: ["Source files", "3 revisions", "Priority support"]
      },
      {
        name: "Premium",
        description: "",
        deliveryTime: 7,
        price: 200,
        includedFeatures: ["Source files", "Unlimited revisions", "Priority support", "Extra features"]
      }
    ]
  },
  requirements: "",
  images: [],
  languages: ["English"],
  isActive: true,
  totalSales: 0,
  featuredStatus: {
    isFeatured: false
  }
}

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

export default function AddServicePage() {
  const [serviceData, setServiceData] = useState(defaultServiceData)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [subcategories, setSubcategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [currentPackage, setCurrentPackage] = useState("basic")
  const [imageFiles, setImageFiles] = useState([])
  const [requirements, setRequirements] = useState([
    "What is your business/project about?",
    "Do you have any specific design preferences?",
    "Do you have any existing brand assets (logo, colors, etc.)?"
  ])
  const [faqs, setFaqs] = useState([
    {
      question: "Do you provide source files?",
      answer: "Yes, all packages include source files upon completion of the project."
    },
    {
      question: "How many revisions do you offer?",
      answer: "The number of revisions depends on the package you choose. Basic includes 1 revision, Standard includes 3 revisions, and Premium includes unlimited revisions."
    }
  ])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setServiceData({
      ...serviceData,
      [name]: value
    })
  }

  // Handle nested input changes
  const handleNestedInputChange = (e, field, subfield, index = null) => {
    const { name, value } = e.target
    
    if (index !== null) {
      // Handle array items (like packages)
      const updatedItems = [...serviceData[field][subfield]]
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value
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

  // Handle package feature changes
  const handleFeatureChange = (index, featureIndex, value) => {
    const updatedPackages = [...serviceData.pricing.packages]
    const features = [...updatedPackages[index].includedFeatures]
    features[featureIndex] = value
    
    updatedPackages[index] = {
      ...updatedPackages[index],
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
    if (tagInput.trim() && serviceData.tags.length < 5) {
      setServiceData({
        ...serviceData,
        tags: [...serviceData.tags, tagInput.trim()]
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
  const handleImageUpload = async (e, isMain = false) => {
    const file = e.target.files[0]
    if (!file) return

    // In a real app, you would upload to a server/S3 here
    // For this example, we'll just create a local URL
    const fileUploadResponse = await uploadSingleFile(file)
    const imageUrl = fileUploadResponse.file.url;
    
    // Add to image files for later upload
    setImageFiles([...imageFiles, { file, isMain }])
    
    // Add to service data
    setServiceData({
      ...serviceData,
      images: [
        ...serviceData.images,
        {
          url: imageUrl, // This would be replaced with the actual URL after upload
          isMain: isMain
        }
      ]
    })
  }

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the final data
      const finalData = {
        ...serviceData,
        requirements: requirements.join("\n"), // Convert requirements array to string
      }
      
      // In a real app, you would first upload all images
      // For each file in imageFiles, make an upload request
      // Then update the image URLs in finalData.images
      
      // Call the API to add the service
      const response = await AddService(finalData)
      
      toast({
        title: "Success!",
        description: "Your service has been created successfully",
        variant: "success"
      })
      
      // Redirect to the service page
      // router.push(`/services/${response.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save as draft
  const saveAsDraft = () => {
    // Similar to handleSubmit but with isActive: false
    const draftData = {
      ...serviceData,
      requirements: requirements.join("\n"),
      isActive: false
    }
    
    // Save to local storage for now
    localStorage.setItem("serviceDraft", JSON.stringify(draftData))
    
    toast({
      title: "Draft Saved",
      description: "Your service draft has been saved",
      variant: "success"
    })
  }

  // Get starting price for preview
  const getStartingPrice = () => {
    if (serviceData.pricing && serviceData.pricing.packages && serviceData.pricing.packages.length > 0) {
      // Find lowest price
      return Math.min(...serviceData.pricing.packages.map(pkg => pkg.price))
    }
    return 50 // Default
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Create a New Service</h1>
              <p className="text-muted-foreground">Showcase your skills and start selling your services</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Provide the essential details about your service</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Service Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={serviceData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., I will design a professional website for your business"
                        className="max-w-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your title should be clear, specific, and attention-grabbing (max 80 characters)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
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
                        Subcategory
                      </label>
                      <Select 
                        value={serviceData.subcategory} 
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
                        Service Description
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={serviceData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your service in detail..."
                        className="min-h-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Provide a comprehensive description of what you offer, your process, and what makes your service
                        unique (min 120 characters)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags (Select up to 5)</label>
                      <div className="flex flex-wrap gap-2">
                        {serviceData.tags.map((tag, index) => (
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
                            disabled={serviceData.tags.length >= 5}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {5 - serviceData.tags.length} tags remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Images</CardTitle>
                    <CardDescription>Upload images that showcase your work (up to 5 images)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Main Image Upload */}
                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center aspect-video">
                        {serviceData.images.find(img => img.isMain) ? (
                          <div className="relative w-full h-full">{
                            
                            console.log(API_URL + serviceData.images.find(img => img.isMain).url)}
                            <img 
                              src={`${API_URL}${serviceData.images.find(img => img.isMain).url}`}
                              alt="Main service image" 
                              className="w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute top-2 right-2">
                              <Button 
                                type="button"
                                variant="destructive" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setServiceData({
                                    ...serviceData,
                                    images: serviceData.images.filter(img => !img.isMain)
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Main Image</p>
                            <p className="text-xs text-muted-foreground text-center mt-1">Drag & drop or click to upload</p>
                            <div className="mt-2">
                              <input
                                type="file"
                                id="main-image"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true)}
                              />
                              <label htmlFor="main-image">
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span>Upload</span>
                                </Button>
                              </label>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Additional Image Uploads */}
                      {[1, 2, 3, 4].map((index) => {
                        const additionalImage = serviceData.images.filter(img => !img.isMain)[index - 1];
                        return (
                          <div
                            key={index}
                            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center aspect-video"
                          >
                            {additionalImage ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={API_URL + additionalImage.url} 
                                  alt={`Additional service image ${index}`} 
                                  className="w-full h-full object-cover rounded-md"
                                />
                                <div className="absolute top-2 right-2">
                                  <Button 
                                    type="button"
                                    variant="destructive" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      const imageIndex = serviceData.images.findIndex(
                                        img => !img.isMain && img.url === additionalImage.url
                                      );
                                      if (imageIndex !== -1) {
                                        const updatedImages = [...serviceData.images];
                                        updatedImages.splice(imageIndex, 1);
                                        setServiceData({
                                          ...serviceData,
                                          images: updatedImages
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">Additional Image {index}</p>
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id={`additional-image-${index}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, false)}
                                  />
                                  <label htmlFor={`additional-image-${index}`}>
                                    <Button type="button" variant="outline" size="sm" asChild>
                                      <span>Upload</span>
                                    </Button>
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Images should be high quality and clearly showcase your work. Recommended size: 1200x800px.
                    </p>
                  </CardContent>
                </Card>

                {/* Pricing Packages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Packages</CardTitle>
                    <CardDescription>Define your service tiers and pricing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={currentPackage} onValueChange={setCurrentPackage} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="standard">Standard</TabsTrigger>
                        <TabsTrigger value="premium">Premium</TabsTrigger>
                      </TabsList>
                      
                      {/* Basic Package */}
                      <TabsContent value="basic" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label htmlFor="basic-name" className="text-sm font-medium">
                            Package Title
                          </label>
                          <Input 
                            id="basic-name" 
                            name="name"
                            value={serviceData.pricing.packages[0].name}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 0)}
                            className="max-w-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="basic-description" className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            id="basic-description"
                            name="description"
                            value={serviceData.pricing.packages[0].description}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 0)}
                            placeholder="Describe what's included in this package..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="basic-price" className="text-sm font-medium">
                              Price (£)
                            </label>
                            <Input 
                              id="basic-price" 
                              name="price"
                              type="number" 
                              value={serviceData.pricing.packages[0].price}
                              onChange={(e) => handleNestedInputChange(
                                { target: { name: "price", value: parseInt(e.target.value) || 0 } }, 
                                "pricing", 
                                "packages", 
                                0
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="basic-delivery" className="text-sm font-medium">
                              Delivery Time (days)
                            </label>
                            <Select 
                              value={serviceData.pricing.packages[0].deliveryTime.toString()}
                              onValueChange={(value) => handleNestedInputChange(
                                { target: { name: "deliveryTime", value: parseInt(value) } }, 
                                "pricing", 
                                "packages", 
                                0
                              )}
                            >
                              <SelectTrigger id="basic-delivery">
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
                            {serviceData.pricing.packages[0].includedFeatures.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id={`basic-feature-${featureIndex}`} defaultChecked />
                                  <Input
                                    id={`basic-feature-text-${featureIndex}`}
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(0, featureIndex, e.target.value)}
                                    className="border-none p-0 h-auto text-sm focus-visible:ring-0"
                                  />
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeFeature(0, featureIndex)}
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
                            onClick={() => addFeature(0)}
                          >
                            <Plus className="h-4 w-4" />
                            Add Feature
                          </Button>
                        </div>
                      </TabsContent>
                      
                      {/* Standard Package */}
                      <TabsContent value="standard" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label htmlFor="standard-name" className="text-sm font-medium">
                            Package Title
                          </label>
                          <Input 
                            id="standard-name" 
                            name="name"
                            value={serviceData.pricing.packages[1].name}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 1)}
                            className="max-w-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="standard-description" className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            id="standard-description"
                            name="description"
                            value={serviceData.pricing.packages[1].description}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 1)}
                            placeholder="Describe what's included in this package..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="standard-price" className="text-sm font-medium">
                              Price (£)
                            </label>
                            <Input 
                              id="standard-price" 
                              name="price"
                              type="number" 
                              value={serviceData.pricing.packages[1].price}
                              onChange={(e) => handleNestedInputChange(
                                { target: { name: "price", value: parseInt(e.target.value) || 0 } }, 
                                "pricing", 
                                "packages", 
                                1
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="standard-delivery" className="text-sm font-medium">
                              Delivery Time (days)
                            </label>
                            <Select 
                              value={serviceData.pricing.packages[1].deliveryTime.toString()}
                              onValueChange={(value) => handleNestedInputChange(
                                { target: { name: "deliveryTime", value: parseInt(value) } }, 
                                "pricing", 
                                "packages", 
                                1
                              )}
                            >
                              <SelectTrigger id="standard-delivery">
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
                            {serviceData.pricing.packages[1].includedFeatures.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id={`standard-feature-${featureIndex}`} defaultChecked />
                                  <Input
                                    id={`standard-feature-text-${featureIndex}`}
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(1, featureIndex, e.target.value)}
                                    className="border-none p-0 h-auto text-sm focus-visible:ring-0"
                                  />
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeFeature(1, featureIndex)}
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
                            onClick={() => addFeature(1)}
                          >
                            <Plus className="h-4 w-4" />
                            Add Feature
                          </Button>
                        </div>
                      </TabsContent>
                      
                      {/* Premium Package */}
                      <TabsContent value="premium" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label htmlFor="premium-name" className="text-sm font-medium">
                            Package Title
                          </label>
                          <Input 
                            id="premium-name" 
                            name="name"
                            value={serviceData.pricing.packages[2].name}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 2)}
                            className="max-w-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="premium-description" className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            id="premium-description"
                            name="description"
                            value={serviceData.pricing.packages[2].description}
                            onChange={(e) => handleNestedInputChange(e, "pricing", "packages", 2)}
                            placeholder="Describe what's included in this package..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="premium-price" className="text-sm font-medium">
                              Price (£)
                            </label>
                            <Input 
                              id="premium-price" 
                              name="price"
                              type="number" 
                              value={serviceData.pricing.packages[2].price}
                              onChange={(e) => handleNestedInputChange(
                                { target: { name: "price", value: parseInt(e.target.value) || 0 } }, 
                                "pricing", 
                                "packages", 
                                2
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="premium-delivery" className="text-sm font-medium">
                              Delivery Time (days)
                            </label>
                            <Select 
                              value={serviceData.pricing.packages[2].deliveryTime.toString()}
                              onValueChange={(value) => handleNestedInputChange(
                                { target: { name: "deliveryTime", value: parseInt(value) } }, 
                                "pricing", 
                                "packages", 
                                2
                              )}
                            >
                              <SelectTrigger id="premium-delivery">
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
                            {serviceData.pricing.packages[2].includedFeatures.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id={`premium-feature-${featureIndex}`} defaultChecked />
                                  <Input
                                    id={`premium-feature-text-${featureIndex}`}
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(2, featureIndex, e.target.value)}
                                    className="border-none p-0 h-auto text-sm focus-visible:ring-0"
                                  />
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeFeature(2, featureIndex)}
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
                            onClick={() => addFeature(2)}
                          >
                            <Plus className="h-4 w-4" />
                            Add Feature
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Buyer Requirements</CardTitle>
                    <CardDescription>Specify what information you need from buyers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id={`requirement-${index}`} defaultChecked />
                            <Input
                              id={`requirement-text-${index}`}
                              value={requirement}
                              onChange={(e) => handleRequirementChange(index, e.target.value)}
                              className="border-none p-0 h-auto text-sm focus-visible:ring-0"
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
                    <CardDescription>Add frequently asked questions to help potential buyers</CardDescription>
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
                              placeholder="Question"
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
                            placeholder="Answer"
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
                      {serviceData.images.find(img => img.isMain) ? (
                        <img 
                          src={`${API_URL}${serviceData.images.find(img => img.isMain).url}`}
                          alt="Main service preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold line-clamp-2">
                      {serviceData.title || "I will create an amazing service for you"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <span className="text-sm">John Doe</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Starting at</span>
                      <span className="font-bold">£{getStartingPrice()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Publishing..." : "Publish Service"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={saveAsDraft}
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tips for Success</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Create an attention-grabbing title</h4>
                      <p className="text-xs text-muted-foreground">
                        Your title should clearly communicate what you offer and include relevant keywords.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Use high-quality images</h4>
                      <p className="text-xs text-muted-foreground">
                        Upload clear, professional images that showcase your work and attract potential buyers.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Set competitive pricing</h4>
                      <p className="text-xs text-muted-foreground">
                        Research similar services to ensure your pricing is competitive while reflecting your expertise.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Be specific about deliverables</h4>
                      <p className="text-xs text-muted-foreground">
                        Clearly outline what buyers will receive in each package to avoid misunderstandings.
                      </p>
                    </div>
                  </CardContent>
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