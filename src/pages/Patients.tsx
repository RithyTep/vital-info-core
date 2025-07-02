import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, Table as TableIcon, Users, Printer } from "lucide-react";
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
import { localStorageService } from "@/services/localStorageService";
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

export interface Patient {
  id: string;
  name: string;
  email: string;
  contact: string;
  gender: string;
  age: number;
  description: string;
  profilePicture: string;
  medicalHistory?: string;
  bloodGroup?: string;
  assignedDoctor?: string;
}

type NewPatientForm = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number | "";
  description: string;
  profilePicture: string;
  bloodGroup: string;
};

const defaultFormData: NewPatientForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: "",
  description: "",
  profilePicture: "",
  bloodGroup: "",
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
        age: formData.age === "" ? 0 : Number(formData.age),
        description: formData.description,
        profilePicture: formData.profilePicture,
        medicalHistory: editingPatient?.medicalHistory || "",
        bloodGroup: formData.bloodGroup,
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
      age: typeof patient.age === 'number' ? patient.age : "",
      description: patient.description || "",
      profilePicture: patient.profilePicture || "",
      bloodGroup: patient.bloodGroup || "",
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
      age: patient.age,
      description: patient.description,
    }));
    printData(
      printableData,
      t('patients'),
      ['name', 'email', 'contact', 'gender', 'age', 'description']
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
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addPatient')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 mb-2">
                  {editingPatient ? t('updatePatient') : t('addNewPatient')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-gray-500 text-sm mb-2">{t('patientInfoPrompt')}</p>
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={formData.profilePicture} alt={formData.name} />
                      <AvatarFallback className="text-lg">{formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}</AvatarFallback>
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
                    <Label htmlFor="name">{t('fullName')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={value => setFormData({ ...formData, bloodGroup: value })}
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
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('gender')}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={value => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger id="gender" className="rounded-lg">
                        <SelectValue placeholder={t('selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('male')}</SelectItem>
                        <SelectItem value="female">{t('female')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setEditingPatient(null);
                    setFormData(defaultFormData);
                  }} className="rounded-lg">
                    {t('cancel')}
                  </Button>
                  <Button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
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
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addPatient')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white/90 rounded-lg shadow border p-4 overflow-x-auto">
          <Table>
            <TableCaption>{t('allRegisteredPatients')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phoneNumber')}</TableHead>
                <TableHead>{t('gender')}</TableHead>
                <TableHead>{t('age')}</TableHead>
                <TableHead>{t('assignedDoctor') || 'Doctor'}</TableHead>
                <TableHead>{t('bloodGroup') || 'Blood Group'}</TableHead>
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
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.assignedDoctor || '-'}</TableCell>
                  <TableCell>{patient.bloodGroup || '-'}</TableCell>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/patient/${patient.id}`}
                    >
                       {t('view')}
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
