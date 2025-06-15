
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, Doctor } from '@/services/localStorageService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    contact: '',
    email: '',
    address: ''
  });
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    const allDoctors = localStorageService.getDoctors();
    setDoctors(allDoctors);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor && editingDoctor.id) {
        localStorageService.updateDoctor(editingDoctor.id, formData);
        toast({
          title: t('success'),
          description: t('doctorUpdated')
        });
      } else {
        localStorageService.createDoctor(formData);
        toast({
          title: t('success'),
          description: t('doctorAdded')
        });
      }
      setDialogOpen(false);
      setEditingDoctor(null);
      setFormData({ name: '', specialty: '', contact: '', email: '', address: '' });
      fetchDoctors();
    } catch {
      toast({
        title: t('error'),
        description: t('doctorFailedSave'),
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      contact: doctor.contact,
      email: doctor.email || '',
      address: doctor.address || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (doctorId: string) => {
    if (!confirm(t('confirmDeleteDoctor'))) return;
    localStorageService.deleteDoctor(doctorId);
    toast({
      title: t('success'),
      description: t('doctorDeleted')
    });
    fetchDoctors();
  };

  const openAddDialog = () => {
    setEditingDoctor(null);
    setFormData({ name: '', specialty: '', contact: '', email: '', address: '' });
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t("doctors")}</h1>
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
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('addDoctor')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDoctor ? t("edit") + ' ' + t("doctors") : t("addDoctor")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">{t('specialty')}</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">{t('contact')}</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingDoctor ? t("edit") : t("add")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="py-4 px-0 overflow-x-auto">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 text-left">{t("name")}</th>
                <th className="px-4 py-2 text-left">{t("specialty")}</th>
                <th className="px-4 py-2 text-left">{t("contact")}</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2">{t("edit")}/{t("delete")}</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-6">{t('noDoctorsFound')}</td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b hover:bg-gray-50 group transition"
                  >
                    <td className="px-4 py-2 font-medium">{doctor.name}</td>
                    <td className="px-4 py-2">{doctor.specialty}</td>
                    <td className="px-4 py-2">{doctor.contact}</td>
                    <td className="px-4 py-2">{doctor.email}</td>
                    <td className="px-4 py-2">{doctor.address}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(doctor.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Doctors;
