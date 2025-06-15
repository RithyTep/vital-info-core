
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  _id?: string;
  name: string;
  age: number;
  contact: string;
  medicalHistory: string;
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Patient>({
    name: '',
    age: 0,
    contact: '',
    medicalHistory: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch patients',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPatient) {
        const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients/${editingPatient._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Patient updated successfully',
          });
        }
      } else {
        const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Patient added successfully',
          });
        }
      }

      setDialogOpen(false);
      setEditingPatient(null);
      setFormData({ name: '', age: 0, contact: '', medicalHistory: '' });
      await fetchPatients();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save patient',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setDialogOpen(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Patient deleted successfully',
        });
        await fetchPatients();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete patient',
        variant: 'destructive'
      });
    }
  };

  const openAddDialog = () => {
    setEditingPatient(null);
    setFormData({ name: '', age: 0, contact: '', medicalHistory: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
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
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPatient ? 'Update Patient' : 'Add Patient'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first patient.</p>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card key={patient._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{patient.name}</span>
                  <div className="flex space-x-2">
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
                      onClick={() => handleDelete(patient._id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Age:</strong> {patient.age} years
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Contact:</strong> {patient.contact}
                </p>
                {patient.medicalHistory && (
                  <p className="text-sm text-gray-600">
                    <strong>Medical History:</strong> {patient.medicalHistory}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
