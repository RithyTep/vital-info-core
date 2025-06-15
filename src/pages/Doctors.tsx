
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  _id?: string;
  name: string;
  specialty: string;
  contact: string;
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Doctor>({
    name: '',
    specialty: '',
    contact: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch doctors',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDoctor) {
        const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors/${editingDoctor._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Doctor updated successfully',
          });
        }
      } else {
        const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Doctor added successfully',
          });
        }
      }

      setDialogOpen(false);
      setEditingDoctor(null);
      setFormData({ name: '', specialty: '', contact: '' });
      await fetchDoctors();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save doctor',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData(doctor);
    setDialogOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors/${doctorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Doctor deleted successfully',
        });
        await fetchDoctors();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive'
      });
    }
  };

  const openAddDialog = () => {
    setEditingDoctor(null);
    setFormData({ name: '', specialty: '', contact: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {doctors.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first doctor.</p>
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{doctor.name}</span>
                  <div className="flex space-x-2">
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
                      onClick={() => handleDelete(doctor._id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Specialty:</strong> {doctor.specialty}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Contact:</strong> {doctor.contact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
