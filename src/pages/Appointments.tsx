"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon, Plus, Edit, Trash, Printer, Search, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table"
import { localStorageService, type Appointment, type Patient, type Doctor } from "@/services/localStorageService"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
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
import { printData } from "@/utils/printUtils"
import { Badge } from "@/components/ui/badge"
import { exportToExcel, type ExcelColumn } from "@/utils/excelUtils"

type NewAppointmentForm = {
  patientId: string
  doctorId: string
  date: Date | undefined
  time: string
  reason: string
  status: "Scheduled" | "Completed" | "Cancelled"
}

const defaultFormData: NewAppointmentForm = {
  patientId: "",
  doctorId: "",
  date: undefined,
  time: "",
  reason: "",
  status: "Scheduled",
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState<NewAppointmentForm>(defaultFormData)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    try {
      setAppointments(localStorageService.getAppointments())
      setPatients(localStorageService.getPatients())
      setDoctors(localStorageService.getDoctors())
    } catch (error) {
      toast({
        title: t("error"),
        description: t("fetchDataFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date) {
      toast({ title: t("error"), description: t("dateRequired"), variant: "destructive" })
      return
    }

    try {
      const appointmentInfo = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        reason: formData.reason,
        status: formData.status,
      }

      if (editingAppointment) {
        localStorageService.updateAppointment(editingAppointment.id, appointmentInfo)
        toast({ title: t("success"), description: t("appointmentUpdatedSuccess") })
      } else {
        localStorageService.createAppointment(appointmentInfo)
        toast({ title: t("success"), description: t("appointmentAddedSuccess") })
      }

      setDialogOpen(false)
      setEditingAppointment(null)
      setFormData(defaultFormData)
      fetchData()
    } catch (error) {
      toast({ title: t("error"), description: t("appointmentSaveFailed"), variant: "destructive" })
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: new Date(appointment.date),
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment)
  }

  const confirmDelete = () => {
    if (!appointmentToDelete) return
    try {
      localStorageService.deleteAppointment(appointmentToDelete.id)
      toast({ title: t("success"), description: t("appointmentDeletedSuccess") })
      fetchData()
    } catch (error) {
      toast({ title: t("error"), description: t("appointmentDeleteFailed"), variant: "destructive" })
    }
    setAppointmentToDelete(null)
  }

  const openAddDialog = () => {
    setEditingAppointment(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  const handlePrint = () => {
    const printableData = filteredAppointments.map((app) => ({
      patient: app.patientName || "N/A",
      doctor: app.doctorName || "N/A",
      date: app.date,
      time: app.time,
      reason: app.reason,
      status: app.status,
    }))
    printData(printableData, t("appointments"), ["patient", "doctor", "date", "time", "reason", "status"])
  }

  const handleExportExcel = () => {
    try {
      const columns: ExcelColumn[] = [
        { key: "patient", header: t("patientName") || "Patient Name", width: 20 },
        { key: "doctor", header: t("doctorName") || "Doctor Name", width: 20 },
        { key: "date", header: t("date") || "Date", width: 12 },
        { key: "time", header: t("time") || "Time", width: 10 },
        { key: "reason", header: t("reasonForVisit") || "Reason for Visit", width: 30 },
        { key: "status", header: t("status") || "Status", width: 12 },
      ]

      const exportData = filteredAppointments.map((appointment) => ({
        patient: appointment.patientName || "N/A",
        doctor: appointment.doctorName || "N/A",
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
      }))

      exportToExcel(exportData, "appointments", columns, "Appointments")

      toast({
        title: t("success"),
        description: "Appointments data exported to Excel successfully!",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to export appointments data to Excel",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("appointments")}
            </h1>
            <p className="text-gray-600 text-lg">Schedule and manage patient appointments</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <CalendarIcon className="animate-spin w-8 h-8 text-blue-400 mr-3" />
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
            {t("appointments")}
          </h1>
          <p className="text-gray-600 text-lg">Schedule and manage patient appointments</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1 bg-pink-50 text-pink-700 border-pink-200">
            {filteredAppointments.length} {t("appointments")}
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
            placeholder={t("search") + " " + t("appointments").toLowerCase() + "..."}
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
              <Button onClick={openAddDialog} className="bg-pink-600 hover:bg-pink-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addAppointment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-pink-700 mb-2">
                  {editingAppointment ? t("editAppointment") : t("addNewAppointment")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">{t("patientName")}</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    required
                  >
                    <SelectTrigger id="patientId" className="rounded-lg">
                      <SelectValue placeholder={t("selectPatient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">{t("doctorName")}</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                    required
                  >
                    <SelectTrigger id="doctorId" className="rounded-lg">
                      <SelectValue placeholder={t("selectDoctor")} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="date">{t("date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal rounded-lg ${!formData.date ? "text-muted-foreground" : ""}`}
                        >
                          {formData.date ? format(formData.date, "yyyy-MM-dd") : <span>{t("pickDate")}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => setFormData({ ...formData, date: date || undefined })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="time">{t("time")}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">{t("reasonForVisit")}</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={2}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    required
                  >
                    <SelectTrigger id="status" className="rounded-lg">
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">{t("scheduled")}</SelectItem>
                      <SelectItem value="Completed">{t("completed")}</SelectItem>
                      <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow"
                  >
                    {editingAppointment ? t("updateAppointment") : t("createAppointment")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {filteredAppointments.length === 0 ? (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl border-dashed border-2 border-gray-200">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-pink-100 p-6">
              <CalendarIcon className="h-16 w-16 text-pink-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No appointments found" : t("noAppointmentsFound")}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {searchTerm ? `No appointments match "${searchTerm}"` : t("getStartedAppointment")}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog} className="bg-pink-600 hover:bg-pink-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("addAppointment")}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              {/* <TableCaption className="text-gray-500">{t("allScheduledAppointments")}</TableCaption> */}
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="font-semibold">{t("patientName")}</TableHead>
                  <TableHead className="font-semibold">{t("doctorName")}</TableHead>
                  <TableHead className="font-semibold">{t("date")}</TableHead>
                  <TableHead className="font-semibold">{t("time")}</TableHead>
                  <TableHead className="font-semibold">{t("reasonForVisit")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="text-right font-semibold">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-pink-50/50 transition-colors">
                    <TableCell className="font-medium">{appointment.patientName || "N/A"}</TableCell>
                    <TableCell>{appointment.doctorName || "N/A"}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {appointment.time}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{appointment.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(appointment)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteAppointment")}</AlertDialogDescription>
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

export default Appointments
