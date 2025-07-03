"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Phone,
  Mail,
  FileText,
  Stethoscope,
  AlertCircle,
  Check,
  Heart,
  UserCheck,
  Shield,
  ArrowLeft,
} from "lucide-react"
import { localStorageService, type Patient } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"

const PatientEdit = () => {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<Partial<Patient>>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "medical" | "contact">("basic")
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty?: string }[]>([])
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    setDoctors(localStorageService.getDoctors())
    if (id) {
      const found = localStorageService.getPatients().find((p) => p.id === id)
      if (found) {
        setFormData({
          ...found,
          gender: found.gender?.toLowerCase(),
          bloodGroup: found.bloodGroup,
          assignedDoctor: found.assignedDoctor,
        })
      }
    }
    setLoading(false)
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      localStorageService.updatePatient(id, formData)
      navigate(`/patient/${id}`)
    } catch (error) {
      console.error("Failed to save patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: "basic", label: t("basicInfo") || "Basic Info", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "medical", label: t("medical") || "Medical", icon: Stethoscope, color: "from-green-500 to-emerald-500" },
    {
      id: "contact",
      label: t("contactAndInsurance") || "Contact & Insurance",
      icon: Phone,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t("fullName") || "Full Name"} *</label>
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter patient's full name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t("age") || "Age"}</label>
              <Input
                name="age"
                type="number"
                min="0"
                max="150"
                value={formData.age || ""}
                onChange={handleChange}
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 ${errors.age ? "border-red-500" : ""}`}
                placeholder="Age"
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t("gender") || "Gender"}</label>
              <Select
                value={formData.gender ?? undefined}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("male") || "Male"}</SelectItem>
                  <SelectItem value="female">{t("female") || "Female"}</SelectItem>
                  <SelectItem value="other">{t("other") || "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t("bloodType") || "Blood Type"}</label>
              <Select
                value={formData.bloodGroup ?? undefined}
                onValueChange={(value) => handleSelectChange("bloodGroup", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        {type}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <FileText className="inline w-4 h-4 mr-1" />
              {t("description") || "Description"}
            </label>
            <Textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Brief description or notes about the patient"
              className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 min-h-20"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Medical Information</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <UserCheck className="inline w-4 h-4 mr-1" />
                {t("assignedDoctor") || "Assigned Doctor"}
              </label>
              <Select
                value={formData.assignedDoctor ?? undefined}
                onValueChange={(value) => handleSelectChange("assignedDoctor", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{doc.name}</span>
                        {doc.specialty && (
                          <Badge variant="secondary" className="ml-2">
                            {doc.specialty}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <AlertCircle className="inline w-4 h-4 mr-1" />
                {t("allergies") || "Allergies"}
              </label>
              <Textarea
                name="allergies"
                value={formData.allergies || ""}
                onChange={handleChange}
                placeholder="List any known allergies (medications, food, environmental, etc.)"
                className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400/20 min-h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FileText className="inline w-4 h-4 mr-1" />
                {t("medicalHistory") || "Medical History"}
              </label>
              <Textarea
                name="medicalHistory"
                value={formData.medicalHistory || ""}
                onChange={handleChange}
                placeholder="Previous medical conditions, surgeries, chronic illnesses, etc."
                className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400/20 min-h-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContactInfo = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Mail className="inline w-4 h-4 mr-1" />
                  {t("email") || "Email"}
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className={`bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="patient@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Phone className="inline w-4 h-4 mr-1" />
                  {t("phoneNumber") || "Phone Number"}
                </label>
                <Input
                  name="contact"
                  value={formData.contact || ""}
                  onChange={handleChange}
                  className={`bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 ${errors.contact ? "border-red-500" : ""}`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Shield className="inline w-4 h-4 mr-1" />
                {t("emergencyContact") || "Emergency Contact"}
              </label>
              <Input
                name="emergencyContact"
                value={formData.emergencyContact || ""}
                onChange={handleChange}
                placeholder="Emergency contact name and phone number"
                className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-lg">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          {t("loading") || "Loading..."}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("editPatient") || "Edit Patient"}
              </h1>
              <p className="text-gray-600 mt-1">Update patient information and medical records</p>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700 border-orange-300">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-blue-200/50">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as "basic" | "medical" | "contact")}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "basic" && renderBasicInfo()}
            {activeTab === "medical" && renderMedicalInfo()}
            {activeTab === "contact" && renderContactInfo()}
          </div>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">Please fix the errors above before saving.</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-blue-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg min-w-32"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {t("save") || "Save Changes"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientEdit
