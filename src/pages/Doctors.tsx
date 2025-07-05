"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash, Printer, Search, UserCheck, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { localStorageService, type Doctor } from "@/services/localStorageService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/LanguageContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { printData } from "@/utils/printUtils"
import { Badge } from "@/components/ui/badge"
import { exportToExcel, type ExcelColumn } from "@/utils/excelUtils"
import { AppPagination } from "../components/ui/AppPagination"

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    contact: "",
    email: "",
    address: "",
    profilePicture: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Reset to first page on search
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const handlePrint = () => {
    const printableData = filteredDoctors.map((doc) => ({
      name: doc.name,
      specialty: doc.specialty,
      contact: doc.contact,
      email: doc.email || "",
      address: doc.address || "",
    }))
    printData(printableData, t("doctors"), ["name", "specialty", "contact", "email", "address"])
  }

  const handleExportExcel = () => {
    try {
      const columns: ExcelColumn[] = [
        { key: "name", header: t("name") || "Name", width: 20 },
        { key: "specialty", header: t("specialty") || "Specialty", width: 20 },
        { key: "contact", header: t("contact") || "Contact", width: 15 },
        { key: "email", header: "Email", width: 25 },
        { key: "address", header: "Address", width: 30 },
      ]

      const exportData = filteredDoctors.map((doctor) => ({
        name: doctor.name,
        specialty: doctor.specialty,
        contact: doctor.contact,
        email: doctor.email || "",
        address: doctor.address || "",
      }))

      exportToExcel(exportData, "doctors", columns, "Doctors")

      toast({
        title: t("success"),
        description: "Doctors data exported to Excel successfully!",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to export doctors data to Excel",
        variant: "destructive",
      })
    }
  }

  const fetchDoctors = () => {
    setLoading(true)
    const allDoctors = localStorageService.getDoctors()
    setDoctors(allDoctors)
    setLoading(false)
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
      if (editingDoctor && editingDoctor.id) {
        localStorageService.updateDoctor(editingDoctor.id, formData)
        toast({
          title: t("success"),
          description: t("doctorUpdated"),
        })
      } else {
        localStorageService.createDoctor(formData)
        toast({
          title: t("success"),
          description: t("doctorAdded"),
        })
      }
      setDialogOpen(false)
      setEditingDoctor(null)
      setFormData({ name: "", specialty: "", contact: "", email: "", address: "", profilePicture: "" })
      fetchDoctors()
    } catch {
      toast({
        title: t("error"),
        description: t("doctorFailedSave"),
        variant: "destructive",
      })
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      contact: doctor.contact,
      email: doctor.email || "",
      address: doctor.address || "",
      profilePicture: (doctor as any).profilePicture || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor)
  }

  const confirmDelete = () => {
    if (!doctorToDelete) return
    localStorageService.deleteDoctor(doctorToDelete.id)
    toast({
      title: t("success"),
      description: t("doctorDeleted"),
    })
    fetchDoctors()
    setDoctorToDelete(null)
  }

  const openAddDialog = () => {
    setEditingDoctor(null)
    setFormData({ name: "", specialty: "", contact: "", email: "", address: "", profilePicture: "" })
    setDialogOpen(true)
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("doctors")}
            </h1>
            <p className="text-gray-600 text-lg">Manage your medical staff and specialists</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <UserCheck className="animate-spin w-8 h-8 text-blue-400 mr-3" />
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
            {t("doctors")}
          </h1>
          <p className="text-gray-600 text-lg">Manage your medical staff and specialists</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
            {filteredDoctors.length} {t("doctors")}
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
            placeholder={t("search") + " " + t("doctors").toLowerCase() + "..."}
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
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addDoctor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
                  {editingDoctor ? t("edit") + " " + t("doctors") : t("addDoctor")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={formData.profilePicture || "/placeholder.svg"} alt={formData.name} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "D"}
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
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">{t("specialty")}</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">{t("contact")}</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
                  >
                    {editingDoctor ? t("edit") : t("add")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {filteredDoctors.length === 0 ? (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl border-dashed border-2 border-gray-200">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-6">
              <UserCheck className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No doctors found" : t("noDoctorsFound")}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {searchTerm
                ? `No doctors match "${searchTerm}"`
                : "Get started by adding your first doctor to the system"}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addDoctor")}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b">
                      <th className="px-6 py-4 text-left font-semibold"></th>
                      <th className="px-6 py-4 text-left font-semibold">{t("name")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("specialty")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("contact")}</th>
                      <th className="px-6 py-4 text-left font-semibold">Email</th>
                      <th className="px-6 py-4 text-left font-semibold">Address</th>
                      <th className="px-6 py-4 text-center font-semibold">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDoctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b hover:bg-green-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={(doctor as any).profilePicture || "/placeholder.svg"} alt={doctor.name} />
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {doctor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-6 py-4 font-medium">{doctor.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {doctor.specialty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{doctor.contact}</td>
                        <td className="px-6 py-4">{doctor.email || "-"}</td>
                        <td className="px-6 py-4">{doctor.address || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(doctor)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(doctor)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <AppPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredDoctors.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      <AlertDialog open={!!doctorToDelete} onOpenChange={(open) => !open && setDoctorToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteDoctor")}</AlertDialogDescription>
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

export default Doctors
