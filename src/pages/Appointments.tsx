import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Edit, Trash, Table as TableIcon, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { localStorageService, Appointment, Patient, Doctor } from "@/services/localStorageService";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { printData } from "@/utils/printUtils";

type NewAppointmentForm = {
  patientId: string;
  doctorId: string;
  date: Date | undefined;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
};

const defaultFormData: NewAppointmentForm = {
  patientId: "",
  doctorId: "",
  date: undefined,
  time: "",
  reason: "",
  status: 'Scheduled',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<NewAppointmentForm>(defaultFormData);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    try {
      setAppointments(localStorageService.getAppointments());
      setPatients(localStorageService.getPatients());
      setDoctors(localStorageService.getDoctors());
    } catch (error) {
      toast({
        title: t("error"),
        description: t("fetchDataFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast({ title: t("error"), description: t("dateRequired"), variant: "destructive" });
      return;
    }

    try {
      const appointmentInfo = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        reason: formData.reason,
        status: formData.status,
      };

      if (editingAppointment) {
        localStorageService.updateAppointment(editingAppointment.id, appointmentInfo);
        toast({ title: t("success"), description: t("appointmentUpdatedSuccess") });
      } else {
        localStorageService.createAppointment(appointmentInfo);
        toast({ title: t("success"), description: t("appointmentAddedSuccess") });
      }

      setDialogOpen(false);
      setEditingAppointment(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      toast({ title: t("error"), description: t("appointmentSaveFailed"), variant: "destructive" });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: new Date(appointment.date),
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
  };

  const confirmDelete = () => {
    if (!appointmentToDelete) return;
    try {
      localStorageService.deleteAppointment(appointmentToDelete.id);
      toast({ title: t("success"), description: t("appointmentDeletedSuccess") });
      fetchData();
    } catch (error) {
      toast({ title: t("error"), description: t("appointmentDeleteFailed"), variant: "destructive" });
    }
    setAppointmentToDelete(null);
  };

  const openAddDialog = () => {
    setEditingAppointment(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handlePrint = () => {
    const printableData = appointments.map(app => ({
      patient: app.patientName || 'N/A',
      doctor: app.doctorName || 'N/A',
      date: app.date,
      time: app.time,
      reason: app.reason,
      status: app.status,
    }));
    printData(
      printableData,
      t("appointments"),
      ['patient', 'doctor', 'date', 'time', 'reason', 'status']
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t("appointments")}</h1>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              {t('print') || 'Print'}
            </Button>
            <Select value={language} onValueChange={val => setLanguage(val as 'en' | 'km')}>
              <SelectTrigger className="w-32">
                <SelectValue>
                  {language === 'en' ? 'English' : 'ខ្មែរ'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="km">ខ្មែរ</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addAppointment")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>{editingAppointment ? t("editAppointment") : t("addNewAppointment")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">{t("patientName")}</Label>
                    <Select value={formData.patientId} onValueChange={value => setFormData({ ...formData, patientId: value })} required>
                      <SelectTrigger id="patientId"><SelectValue placeholder={t("selectPatient")} /></SelectTrigger>
                      <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">{t("doctorName")}</Label>
                    <Select value={formData.doctorId} onValueChange={value => setFormData({ ...formData, doctorId: value })} required>
                      <SelectTrigger id="doctorId"><SelectValue placeholder={t("selectDoctor")} /></SelectTrigger>
                      <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialty})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="date">{t("dateOfBirth")}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" className={`w-full justify-start text-left font-normal ${!formData.date ? "text-muted-foreground" : ""}`}>
                            {formData.date ? format(formData.date, "yyyy-MM-dd") : <span>{t("pickDate")}</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={formData.date} onSelect={date => setFormData({ ...formData, date: date || undefined })} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="time">{t("time")}</Label>
                      <Input id="time" type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">{t("reasonForVisit")}</Label>
                    <Textarea id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={2} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("status")}</Label>
                    <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value as any })} required>
                      <SelectTrigger id="status"><SelectValue placeholder={t("selectStatus")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">{t("scheduled")}</SelectItem>
                        <SelectItem value="Completed">{t("completed")}</SelectItem>
                        <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingAppointment ? t("updateAppointment") : t("createAppointment")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <TableIcon className="animate-spin w-8 h-8 text-blue-400 mr-3" />
          <span className="text-lg text-gray-500">{t("loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t("appointments")}</h1>
        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            {t('print') || 'Print'}
          </Button>
          <Select value={language} onValueChange={val => setLanguage(val as 'en' | 'km')}>
            <SelectTrigger className="w-32">
              <SelectValue>
                {language === 'en' ? 'English' : 'ខ្មែរ'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="km">ខ្មែរ</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t("addAppointment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{editingAppointment ? t("editAppointment") : t("addNewAppointment")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">{t("patientName")}</Label>
                  <Select value={formData.patientId} onValueChange={value => setFormData({ ...formData, patientId: value })} required>
                    <SelectTrigger id="patientId"><SelectValue placeholder={t("selectPatient")} /></SelectTrigger>
                    <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">{t("doctorName")}</Label>
                  <Select value={formData.doctorId} onValueChange={value => setFormData({ ...formData, doctorId: value })} required>
                    <SelectTrigger id="doctorId"><SelectValue placeholder={t("selectDoctor")} /></SelectTrigger>
                    <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialty})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="date">{t("dateOfBirth")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className={`w-full justify-start text-left font-normal ${!formData.date ? "text-muted-foreground" : ""}`}>
                          {formData.date ? format(formData.date, "yyyy-MM-dd") : <span>{t("pickDate")}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={formData.date} onSelect={date => setFormData({ ...formData, date: date || undefined })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="time">{t("time")}</Label>
                    <Input id="time" type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">{t("reasonForVisit")}</Label>
                  <Textarea id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={2} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value as any })} required>
                    <SelectTrigger id="status"><SelectValue placeholder={t("selectStatus")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">{t("scheduled")}</SelectItem>
                      <SelectItem value="Completed">{t("completed")}</SelectItem>
                      <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingAppointment ? t("updateAppointment") : t("createAppointment")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noAppointmentsFound")}</h3>
            <p className="text-gray-600 mb-4">{t("getStartedAppointment")}</p>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("addAppointment")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white/90 rounded-lg shadow border p-4">
          <Table>
            <TableCaption>{t("allScheduledAppointments")}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t("patientName")}</TableHead>
                <TableHead>{t("doctorName")}</TableHead>
                <TableHead>{t("dateOfBirth")}</TableHead>
                <TableHead>{t("time")}</TableHead>
                <TableHead>{t("reasonForVisit")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patientName || 'N/A'}</TableCell>
                  <TableCell>{appointment.doctorName || 'N/A'}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(appointment)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteAppointment")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
