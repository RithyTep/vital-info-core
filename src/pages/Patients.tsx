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
import { CalendarIcon, Plus, Edit, Trash, Table as TableIcon, Users, Printer } from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { printData } from "@/utils/printUtils";

type NewPatientForm = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: Date | undefined;
  address: string;
  profilePicture: string;
};

const defaultFormData: NewPatientForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dob: undefined,
  address: "",
  profilePicture: "",
};

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
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

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
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
        profilePicture: formData.profilePicture,
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
      email: patient.email || "",
      phone: patient.contact || "",
      gender: patient.gender || "",
      dob: patient.dob ? new Date(patient.dob) : undefined,
      address: patient.address || "",
      profilePicture: patient.profilePicture || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const confirmDelete = () => {
    if (!patientToDelete) return;
    try {
      localStorageService.deletePatient(patientToDelete.id);
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
    setPatientToDelete(null);
  };

  const handlePrint = () => {
    const printableData = patients.map(patient => ({
      name: patient.name,
      email: patient.email,
      contact: patient.contact,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
    }));
    printData(
      printableData,
      t('patients'),
      ['name', 'email', 'contact', 'gender', 'dob', 'address']
    );
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
        <h1 className="text-3xl font-bold text-primary">{t('patients')}</h1>
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
              <Button
                onClick={openAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addPatient')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? t('updatePatient') : t('addNewPatient')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-500 text-sm">{t('patientInfoPrompt')}</p>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={formData.profilePicture} alt={formData.name} />
                      <AvatarFallback>{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</AvatarFallback>
                    </Avatar>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
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
                </div>
                <div className="flex gap-2">
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
                </div>
                <div className="flex gap-2">
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
                  <div className="space-y-2 flex-1">
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
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setEditingPatient(null);
                    setFormData(defaultFormData);
                  }}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit">
                    {editingPatient ? t('updatePatient') : t('createPatient')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {patients.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('noPatientsFound')}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {t('getStartedPatient')}
            </p>
            <Button
              onClick={openAddDialog}
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
                <TableHead></TableHead>
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
                <TableRow key={patient.id} className="hover:bg-accent transition-colors">
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={patient.profilePicture} alt={patient.name} />
                      <AvatarFallback>{patient.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.address}</TableCell>
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
                      onClick={() => handleDelete(patient)}
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
       <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeletePatient')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;
