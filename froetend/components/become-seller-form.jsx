"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" 
import { Loader2, Plus, X } from "lucide-react"

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
import { updateSellerProfile } from "@/lib/api/auth"


// Countries list for dropdown
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", 
  "Germany", "France", "India", "Japan", "China", "Brazil"
];

// Zod schema for validation
const sellerProfileSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  languages: z.array(z.string()).min(1, { message: "Add at least one language" }),
  skills: z.array(z.string()).min(1, { message: "Add at least one skill" }),
  location: z.object({
    country: z.string().min(1, { message: "Country is required" }),
    city: z.string().min(1, { message: "City is required" })
  })
});

export default function BecomeSellerForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    languages: [],
    skills: [],
    location: {
      country: "",
      city: ""
    }
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
    }
  });

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
      }
    });
    
    setIsLoading(true);

    try {
      // Validate form data using Zod schema
      sellerProfileSchema.parse(formData);

      // Prepare full seller data
      const sellerData = {
        isSeller: true,
        sellerProfile: formData
      };

      // Call API to update profile
      const response = await updateSellerProfile(sellerData);
      
      if (response.user) {
        // Show success toast
        toast.success("Seller Profile Created", {
          description: "You are now registered as a seller!",
        });
        
        // Redirect to seller dashboard
        router.push('/');
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
          }
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
        toast.error("Submission Error", {
          description: "An error occurred. Please try again.",
        });
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          "Become a Seller"
        )}
      </Button>
    </form>
  )
}