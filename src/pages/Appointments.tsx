
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Edit, Trash, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { localStorageService, Appointment, Patient, Doctor } from "@/services/localStorageService";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
  const [formData, setFormData] = useState<NewAppointmentForm>(defaultFormData);
  const { toast } = useToast();

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
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast({ title: "Error", description: "Please select a date.", variant: "destructive" });
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
        toast({ title: "Success", description: "Appointment updated successfully" });
      } else {
        localStorageService.createAppointment(appointmentInfo);
        toast({ title: "Success", description: "Appointment added successfully" });
      }

      setDialogOpen(false);
      setEditingAppointment(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save appointment", variant: "destructive" });
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

  const handleDelete = (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    try {
      localStorageService.deleteAppointment(appointmentId);
      toast({ title: "Success", description: "Appointment deleted successfully" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete appointment", variant: "destructive" });
    }
  };

  const openAddDialog = () => {
    setEditingAppointment(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <TableIcon className="animate-spin w-8 h-8 text-blue-400 mr-3" />
          <span className="text-lg text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-800">Appointments</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Edit Appointment" : "Add New Appointment"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select value={formData.patientId} onValueChange={value => setFormData({ ...formData, patientId: value })} required>
                  <SelectTrigger id="patientId"><SelectValue placeholder="Select a patient" /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor</Label>
                <Select value={formData.doctorId} onValueChange={value => setFormData({ ...formData, doctorId: value })} required>
                  <SelectTrigger id="doctorId"><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                  <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialty})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className={`w-full justify-start text-left font-normal ${!formData.date ? "text-muted-foreground" : ""}`}>
                        {formData.date ? format(formData.date, "yyyy-MM-dd") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.date} onSelect={date => setFormData({ ...formData, date: date || undefined })} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for visit</Label>
                <Textarea id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={2} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value as any })} required>
                  <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingAppointment ? "Update Appointment" : "Create Appointment"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">Get started by scheduling your first appointment.</p>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white/90 rounded-lg shadow border p-4">
          <Table>
            <TableCaption>All Scheduled Appointments</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <Button variant="outline" size="sm" onClick={() => handleDelete(appointment.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Appointments;
