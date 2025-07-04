"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash, TableIcon, Users, Printer, Search, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table"
import { localStorageService } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { printData } from "@/utils/printUtils"
import { Badge } from "@/components/ui/badge"
import { exportToExcel, type ExcelColumn } from "@/utils/excelUtils"

export interface Patient {
  id: string
  name: string
  email: string
  contact: string
  gender: string
  age: number
  description: string
  profilePicture: string
  medicalHistory?: string
  bloodGroup?: string
  assignedDoctor?: string
}

type NewPatientForm = {
  name: string
  email: string
  phone: string
  gender: string
  age: number | ""
  description: string
  profilePicture: string
  bloodGroup: string
}

const defaultFormData: NewPatientForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: "",
  description: "",
  profilePicture: "",
  bloodGroup: "",
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<NewPatientForm>(defaultFormData)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, language, setLanguage } = useLanguage()

  useEffect(() => {
    fetchPatients()
  }, [])

  const openAddDialog = useCallback(() => {
    setEditingPatient(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }, [])

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      openAddDialog()
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, openAddDialog])

  const fetchPatients = () => {
    try {
      const data = localStorageService.getPatients()
      setPatients(data)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("fetchPatientsFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const patientInfo = {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
        gender: formData.gender,
        age: formData.age === "" ? 0 : Number(formData.age),
        description: formData.description,
        profilePicture: formData.profilePicture,
        medicalHistory: editingPatient?.medicalHistory || "",
        bloodGroup: formData.bloodGroup,
      }
      if (editingPatient) {
        localStorageService.updatePatient(editingPatient.id, patientInfo)
        toast({
          title: t("success"),
          description: t("patientUpdatedSuccess"),
        })
      } else {
        localStorageService.createPatient({
          ...patientInfo,
        })
        toast({
          title: t("success"),
          description: t("patientAddedSuccess"),
        })
      }
      setDialogOpen(false)
      setEditingPatient(null)
      setFormData(defaultFormData)
      fetchPatients()
    } catch (error) {
      toast({
        title: t("error"),
        description: t("patientSaveFailed"),
        variant: "destructive",
      })
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.contact || "",
      gender: patient.gender || "",
      age: typeof patient.age === "number" ? patient.age : "",
      description: patient.description || "",
      profilePicture: patient.profilePicture || "",
      bloodGroup: patient.bloodGroup || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient)
  }

  const confirmDelete = () => {
    if (!patientToDelete) return
    try {
      localStorageService.deletePatient(patientToDelete.id)
      toast({
        title: t("success"),
        description: t("patientDeletedSuccess"),
      })
      fetchPatients()
    } catch (error) {
      toast({
        title: t("error"),
        description: t("patientDeleteFailed"),
        variant: "destructive",
      })
    }
    setPatientToDelete(null)
  }

  const handlePrint = () => {
    const printableData = filteredPatients.map((patient) => ({
      name: patient.name,
      email: patient.email,
      contact: patient.contact,
      gender: patient.gender,
      age: patient.age,
      description: patient.description,
    }))
    printData(printableData, t("patients"), ["name", "email", "contact", "gender", "age", "description"])
  }

  const handleExportExcel = () => {
    try {
      const columns: ExcelColumn[] = [
        { key: "name", header: t("name") || "Name", width: 20 },
        { key: "email", header: t("email") || "Email", width: 25 },
        { key: "contact", header: t("phoneNumber") || "Phone Number", width: 15 },
        { key: "gender", header: t("gender") || "Gender", width: 10 },
        { key: "age", header: t("age") || "Age", width: 8 },
        { key: "bloodGroup", header: t("bloodGroup") || "Blood Group", width: 12 },
        { key: "assignedDoctor", header: t("assignedDoctor") || "Assigned Doctor", width: 20 },
        { key: "description", header: t("description") || "Description", width: 30 },
        { key: "medicalHistory", header: "Medical History", width: 30 },
      ]

      const exportData = filteredPatients.map((patient) => ({
        name: patient.name,
        email: patient.email || "",
        contact: patient.contact,
        gender: patient.gender,
        age: patient.age,
        bloodGroup: patient.bloodGroup || "",
        assignedDoctor: patient.assignedDoctor || "",
        description: patient.description,
        medicalHistory: patient.medicalHistory || "",
      }))

      exportToExcel(exportData, "patients", columns, "Patients")

      toast({
        title: t("success"),
        description: "Patients data exported to Excel successfully!",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to export patients data to Excel",
        variant: "destructive",
      })
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("patients")}
            </h1>
            <p className="text-gray-600 text-lg">Manage your patient records and information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <TableIcon className="animate-spin w-8 h-8 text-blue-400 mr-3" />
          <span className="text-lg text-gray-500">{t("loading")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("patients")}
          </h1>
          <p className="text-gray-600 text-lg">Manage your patient records and information</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {filteredPatients.length} {t("patients")}
          </Badge>
          <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "km")}>
            <SelectTrigger className="w-32">
              <SelectValue>{language === "en" ? "English" : "ខ្មែរ"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="km">ខ្មែរ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("search") + " " + t("patients").toLowerCase() + "..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={handleExportExcel} variant="outline" className="bg-white/80 backdrop-blur-sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" className="bg-white/80 backdrop-blur-sm">
            <Printer className="h-4 w-4 mr-2" />
            {t("print") || "Print"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addPatient")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 mb-2">
                  {editingPatient ? t("updatePatient") : t("addNewPatient")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-gray-500 text-sm mb-2">{t("patientInfoPrompt")}</p>
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={formData.profilePicture || "/placeholder.svg"} alt={formData.name} />
                      <AvatarFallback className="text-lg">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="flex-1 rounded-lg"
                    />
                  </div>
                </div>
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("fullName")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{t('age')}</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">{t('bloodGroup')}</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                    >
                      <SelectTrigger id="bloodGroup" className="rounded-lg">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phoneNumber")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t("gender")}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger id="gender" className="rounded-lg">
                        <SelectValue placeholder={t("selectGender")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("male")}</SelectItem>
                        <SelectItem value="female">{t("female")}</SelectItem>
                        <SelectItem value="other">{t("other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      setEditingPatient(null)
                      setFormData(defaultFormData)
                    }}
                    className="rounded-lg"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                  >
                    {editingPatient ? t("updatePatient") : t("createPatient")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {filteredPatients.length === 0 ? (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl border-dashed border-2 border-gray-200">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-6">
              <Users className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No patients found" : t("noPatientsFound")}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {searchTerm ? `No patients match "${searchTerm}"` : t("getStartedPatient")}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addPatient")}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="font-semibold"></TableHead>
                  <TableHead className="font-semibold">{t("name")}</TableHead>
                  <TableHead className="font-semibold">{t("email")}</TableHead>
                  <TableHead className="font-semibold">{t("phoneNumber")}</TableHead>
                  <TableHead className="font-semibold">{t("gender")}</TableHead>
                  <TableHead className="font-semibold">{t("age")}</TableHead>
                  <TableHead className="font-semibold">{t("assignedDoctor") || "Doctor"}</TableHead>
                  <TableHead className="font-semibold">{t("bloodGroup") || "Blood Group"}</TableHead>
                  <TableHead className="text-right font-semibold">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-blue-50/50 transition-colors">
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={patient.profilePicture || "/placeholder.svg"} alt={patient.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {patient.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.contact}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.assignedDoctor || "-"}</TableCell>
                    <TableCell>
                      {patient.bloodGroup ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {patient.bloodGroup}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(patient)}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `/patient/${patient.id}`)}
                        className="hover:bg-green-50 hover:border-green-200"
                      >
                        {t("view")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeletePatient")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Patients
