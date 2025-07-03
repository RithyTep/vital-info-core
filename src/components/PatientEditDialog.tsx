"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User, Phone, Mail, FileText, Stethoscope, AlertCircle, Check, Heart, UserCheck, Shield } from "lucide-react"
import { localStorageService, type Patient } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"

interface PatientEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onSave: (updated: Patient) => void
}

const PatientEditDialog: React.FC<PatientEditDialogProps> = ({ open, onOpenChange, patient, onSave }) => {
  const { t } = useLanguage()
  const [form, setForm] = useState<Partial<Patient>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "medical" | "contact">("basic")
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty?: string }[]>([])

  useEffect(() => {
    setDoctors(localStorageService.getDoctors())
    if (patient) {
      setForm({
        ...patient,
        gender: patient.gender?.toLowerCase(),
        bloodGroup: patient.bloodGroup,
        assignedDoctor: patient.assignedDoctor,
      })
      setHasChanges(false)
    } else {
      setForm({})
    }
    setErrors({})
  }, [patient])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      let updatedPatient: Patient | null = null
      if (patient && patient.id) {
        updatedPatient = localStorageService.updatePatient(patient.id, form) as Patient
      } else {
        updatedPatient = localStorageService.createPatient(form as Omit<Patient, "id" | "createdAt">)
      }
      if (updatedPatient) {
        onSave(updatedPatient)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to save patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
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
                value={form.name || ""}
                onChange={handleChange}
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 ${errors.name ? "border-red-500" : ""}`}
                placeholder={t("enterFullName") || "Enter patient's full name"}
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
                value={form.age || ""}
                onChange={handleChange}
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 ${errors.age ? "border-red-500" : ""}`}
                placeholder={t("age") || "Age"}
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t("gender") || "Gender"}</label>
              <Select value={form.gender ?? undefined} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={t("selectGender") || "Select gender"} />
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
                value={form.bloodGroup ?? undefined}
                onValueChange={(value) => handleSelectChange("bloodGroup", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={t("selectBloodType") || "Select blood type"} />
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
              value={form.description || ""}
              onChange={handleChange}
              placeholder={t("descriptionPlaceholder") || "Brief description or notes about the patient"}
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
                value={form.assignedDoctor ?? undefined}
                onValueChange={(value) => handleSelectChange("assignedDoctor", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400">
                  <SelectValue placeholder={t("selectADoctor") || "Select a doctor"} />
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
                value={form.allergies || ""}
                onChange={handleChange}
                placeholder={
                  t("allergiesPlaceholder") || "List any known allergies (medications, food, environmental, etc.)"
                }
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
                value={form.medicalHistory || ""}
                onChange={handleChange}
                placeholder={
                  t("medicalHistoryPlaceholder") || "Previous medical conditions, surgeries, chronic illnesses, etc."
                }
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
                  value={form.email || ""}
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
                  value={form.contact || ""}
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
                value={form.emergencyContact || ""}
                onChange={handleChange}
                placeholder={t("emergencyContactPlaceholder") || "Emergency contact name and phone number"}
                className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0">
        <DialogHeader className="pb-6 border-b border-blue-200/50">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {patient ? t("editPatientInformation") || "Edit Patient Information" : "Add New Patient"}
            </span>
            {hasChanges && (
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl mb-6 border border-blue-200/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
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

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-1">
            {activeTab === "basic" && renderBasicInfo()}
            {activeTab === "medical" && renderMedicalInfo()}
            {activeTab === "contact" && renderContactInfo()}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-6 border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">Please fix the errors above before saving.</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 justify-end pt-6 border-t border-blue-200/50 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(errors).length > 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg min-w-32"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("saving")}...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {t("saveChanges") || "Save Changes"}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PatientEditDialog
