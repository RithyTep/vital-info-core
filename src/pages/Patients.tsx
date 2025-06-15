import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Edit, Trash, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { localStorageService, Patient } from "@/services/localStorageService";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

type NewPatientForm = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: Date | undefined;
  address: string;
};

const defaultFormData: NewPatientForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dob: undefined,
  address: "",
};

const Patients = () => {
  const [patients, setPatients] = useState<(Patient & { email?: string; phone?: string; gender?: string; dob?: string; address?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<NewPatientForm>(defaultFormData);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddDialog = useCallback(() => {
    setEditingPatient(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      openAddDialog();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, openAddDialog]);

  const fetchPatients = () => {
    try {
      const data = localStorageService.getPatients();
      setPatients(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('fetchPatientsFailed'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const patientInfo = {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
        gender: formData.gender,
        dob: formData.dob ? formData.dob.toISOString().split("T")[0] : "",
        address: formData.address,
        age: formData.dob ? new Date().getFullYear() - formData.dob.getFullYear() : 0,
        medicalHistory: editingPatient?.medicalHistory || "",
      };
      if (editingPatient) {
        localStorageService.updatePatient(editingPatient.id, patientInfo);
        toast({
          title: t('success'),
          description: t('patientUpdatedSuccess'),
        });
      } else {
        localStorageService.createPatient({
          ...patientInfo,
        });
        toast({
          title: t('success'),
          description: t('patientAddedSuccess'),
        });
      }

      setDialogOpen(false);
      setEditingPatient(null);
      setFormData(defaultFormData);
      fetchPatients();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('patientSaveFailed'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || "",
      email: (patient as any).email || "",
      phone: patient.contact || "",
      gender: (patient as any).gender || "",
      dob: (patient as any).dob ? new Date((patient as any).dob) : undefined,
      address: (patient as any).address || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (patientId: string) => {
    if (!confirm(t('confirmDeletePatient'))) {
      return;
    }

    try {
      localStorageService.deletePatient(patientId);
      toast({
        title: t('success'),
        description: t('patientDeletedSuccess'),
      });
      fetchPatients();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('patientDeleteFailed'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('patients')}</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <TableIcon className="animate-spin w-8 h-8 text-blue-400 mr-3" />
          <span className="text-lg text-gray-500">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-800">{t('patients')}</h1>
        <div className="flex items-center gap-3">
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
              <Button
                onClick={openAddDialog}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addPatient')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? t('editPatient') : t('addNewPatient')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-500 text-sm">{t('patientInfoPrompt')}</p>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="gender">{t('gender')}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={value => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder={t('selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t('male')}</SelectItem>
                        <SelectItem value="Female">{t('female')}</SelectItem>
                        <SelectItem value="Other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="dob">{t('dateOfBirth')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!formData.dob ? "text-muted-foreground" : ""}`}
                        >
                          {formData.dob ? format(formData.dob, "yyyy-MM-dd") : <span>{t('pickDate')}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dob}
                          onSelect={date => setFormData({ ...formData, dob: date || undefined })}
                          captionLayout="dropdown"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setEditingPatient(null);
                    setFormData(defaultFormData);
                  }}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingPatient ? t('updatePatient') : t('createPatient')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {patients.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('noPatientsFound')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('getStartedPatient')}
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addPatient')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white/90 rounded-lg shadow border p-4">
          <Table>
            <TableCaption>{t('allRegisteredPatients')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phoneNumber')}</TableHead>
                <TableHead>{t('gender')}</TableHead>
                <TableHead>{t('dateOfBirth')}</TableHead>
                <TableHead>{t('address')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{(patient as any).email}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{(patient as any).gender}</TableCell>
                  <TableCell>{(patient as any).dob}</TableCell>
                  <TableCell>{(patient as any).address}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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

export default Patients;
