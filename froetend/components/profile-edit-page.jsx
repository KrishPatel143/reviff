"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" 
import { Loader2, Plus, X, ArrowLeft, Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { checkUser, updateSellerProfile } from "@/lib/api/auth"
import Link from "next/link"
import Image from "next/image"
import { uploadSingleFile } from "@/lib/api/order"
import { API_URL } from "@/lib/apiClient"

// Countries list for dropdown
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", 
  "Germany", "France", "India", "Japan", "China", "Brazil"
];

// Zod schema for validation - Updated to include profilePicture
const sellerProfileSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  languages: z.array(z.string()).min(1, { message: "Add at least one language" }),
  skills: z.array(z.string()).min(1, { message: "Add at least one skill" }),
  location: z.object({
    country: z.string().min(1, { message: "Country is required" }),
    city: z.string().min(1, { message: "City is required" })
  }),
  profilePicture: z.string().optional() // Profile photo URL
});

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    languages: [],
    skills: [],
    location: {
      country: "",
      city: ""
    },
    profilePicture: "" // Add profile photo URL
  });
  
  // For managing new entries
  const [newLanguage, setNewLanguage] = useState("");
  const [newSkill, setNewSkill] = useState("");
  
  // For validation errors
  const [errors, setErrors] = useState({
    description: "",
    languages: "",
    skills: "",
    location: {
      country: "",
      city: ""
    },
    profilePicture: ""
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsInitialLoading(true);
        const response = await checkUser();
        
        if (response.user && response.user.sellerProfile) {
          const { sellerProfile } = response.user;
          setFormData({
            description: sellerProfile.description || "",
            languages: sellerProfile.languages || [],
            skills: sellerProfile.skills || [],
            location: {
              country: sellerProfile.location?.country || "",
              city: sellerProfile.location?.city || ""
            },
            profilePicture: response.user.profilePicture || "" // Load existing profile photo
          });
        } else if (response.user && !response.user.isSeller) {
          // User is not a seller, redirect to become seller page
          toast.error("Access Denied", {
            description: "You need to be a seller to edit this profile.",
          });
          router.push('/become-seller');
          return;
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Load Error", {
          description: "Could not load your profile data.",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Handle file upload for profile photo
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid File Type", {
        description: "Please upload a JPEG, PNG, or WebP image.",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File Too Large", {
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    try {
      setIsUploadingPhoto(true);
      
      // Upload the file
      const fileUploadResponse = await uploadSingleFile(file);
      const imageUrl = fileUploadResponse.file.url;
      
      // Update form data with new profile URL
      setFormData((prev) => ({
        ...prev,
        profilePicture: imageUrl
      }));
      console.log(sellerData);
      
      // Clear any existing error
      if (errors.profilePicture) {
        setErrors((prev) => ({ ...prev, profilePicture: "" }));
      }
      
      toast.success("Photo Uploaded", {
        description: "Your profile photo has been uploaded successfully!",
      });
      
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Upload Failed", {
        description: "Could not upload your photo. Please try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove profile photo
  const removePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: ""
    }));
  };

  // Handle text/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // Clear specific error
      if (errors[parent] && errors[parent][child]) {
        setErrors((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: ""
          }
        }));
      }
    } else {
      // Handle regular fields
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear specific error
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Handle country select
  const handleCountryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        country: value
      }
    }));
    
    // Clear error
    if (errors.location && errors.location.country) {
      setErrors((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          country: ""
        }
      }));
    }
  };

  // Add language to array
  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
      
      // Clear error
      if (errors.languages) {
        setErrors((prev) => ({ ...prev, languages: "" }));
      }
    }
  };

  // Remove language from array
  const removeLanguage = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  // Add skill to array
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
      
      // Clear error
      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: "" }));
      }
    }
  };

  // Remove skill from array
  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      description: "",
      languages: "",
      skills: "",
      location: {
        country: "",
        city: ""
      },
      profilePicture: ""
    });
    
    setIsLoading(true);

    try {
      // Validate form data using Zod schema
      sellerProfileSchema.parse(formData);

      // Prepare full seller data
      const sellerData = {
        isSeller: true,
        sellerProfile: formData,
        profilePicture : formData.profilePicture
      };
      console.log(formData);
      console.log(sellerData);
      
      // Call API to update profile
      const response = await updateSellerProfile(sellerData);
      
      if (response.user) {
        // Show success toast
        toast.success("Profile Updated", {
          description: "Your seller profile has been updated successfully!",
        });
        
        // Redirect to profile page
        router.push('/seller/profile');
      } else {
        // Handle unsuccessful update
        toast.error("Update Failed", {
          description: response.message || "Please check your information.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const newErrors = {
          description: "",
          languages: "",
          skills: "",
          location: {
            country: "",
            city: ""
          },
          profilePicture: ""
        };
        
        error.errors.forEach((err) => {
          const path = err.path;
          
          // Handle nested path
          if (path.length === 2) {
            newErrors[path[0]][path[1]] = err.message;
          } else if (path.length === 1) {
            newErrors[path[0]] = err.message;
          }
        });
        
        setErrors(newErrors);
      } else {
        // Handle network or unexpected errors
        toast.error("Update Error", {
          description: "An error occurred while updating your profile. Please try again.",
        });
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while initial data loads
  if (isInitialLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Link 
          href="/seller/profile" 
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </div>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your seller profile information.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Photo Upload Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Profile Photo</h3>
                    
                    <div className="flex items-center space-x-6">
                      {/* Profile Photo Display */}
                      <div className="relative">
                        {formData.profilePicture ? (
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                            <Image
                              src={ API_URL + formData.profilePicture}
                              alt="Profile photo"
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                            {/* Remove photo button */}
                            <button
                              type="button"
                              onClick={removePhoto}
                              disabled={isLoading || isUploadingPhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Controls */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isUploadingPhoto}
                            className="flex items-center space-x-2"
                          >
                            {isUploadingPhoto ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                <span>{formData.profilePicture ? 'Change Photo' : 'Upload Photo'}</span>
                              </>
                            )}
                          </Button>
                          
                          {formData.profilePicture && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={removePhoto}
                              disabled={isLoading || isUploadingPhoto}
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Upload a professional photo. Supports JPEG, PNG, WebP (max 5MB)
                        </p>
                        
                        {errors.profilePicture && (
                          <p className="text-sm text-red-500" role="alert">
                            {errors.profilePicture}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Profile Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Professional Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your services, expertise, and experience"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a language you speak"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={addLanguage}
                    disabled={isLoading || !newLanguage.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display added languages */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map((language, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 rounded-md px-2 py-1"
                    >
                      <span className="text-sm">{language}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => removeLanguage(language)}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {errors.languages && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.languages}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a skill you offer"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={addSkill}
                    disabled={isLoading || !newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display added skills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 rounded-md px-2 py-1"
                    >
                      <span className="text-sm">{skill}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => removeSkill(skill)}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {errors.skills && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.skills}
                  </p>
                )}
              </div>

              {/* Location */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Location</h3>
                    
                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        disabled={isLoading}
                        value={formData.location.country}
                        onValueChange={handleCountryChange}
                      >
                        <SelectTrigger 
                          id="country"
                          className={errors.location?.country ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.location?.country && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.location.country}
                        </p>
                      )}
                    </div>
                    
                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="location.city"
                        placeholder="Enter your city"
                        value={formData.location.city}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={errors.location?.city ? "border-red-500" : ""}
                      />
                      {errors.location?.city && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.location.city}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || isUploadingPhoto}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/seller/profile')}
                  disabled={isLoading || isUploadingPhoto}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}