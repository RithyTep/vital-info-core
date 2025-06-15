
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
}

interface Medication {
  _id: string;
  name: string;
  dosage: string;
}

interface Prescription {
  _id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicationId: string;
  medicationName: string;
  instructions: string;
  date: string;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    medicationId: '',
    instructions: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [prescriptionsRes, patientsRes, doctorsRes, medicationsRes] = await Promise.all([
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/prescriptions'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications')
      ]);

      const prescriptionsData = await prescriptionsRes.json();
      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const medicationsData = await medicationsRes.json();

      setPrescriptions(prescriptionsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setMedications(medicationsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p._id === formData.patientId);
    const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
    const selectedMedication = medications.find(m => m._id === formData.medicationId);

    if (!selectedPatient || !selectedDoctor || !selectedMedication) {
      toast({
        title: 'Error',
        description: 'Please select all required fields',
        variant: 'destructive'
      });
      return;
    }

    const prescriptionData = {
      patientId: formData.patientId,
      patientName: selectedPatient.name,
      doctorId: formData.doctorId,
      doctorName: selectedDoctor.name,
      medicationId: formData.medicationId,
      medicationName: selectedMedication.name,
      instructions: formData.instructions,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      if (editingPrescription) {
        const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/prescriptions/${editingPrescription._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prescriptionData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Prescription updated successfully',
          });
        }
      } else {
        const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/prescriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prescriptionData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Prescription added successfully',
          });
        }
      }

      setDialogOpen(false);
      setEditingPrescription(null);
      setFormData({ patientId: '', doctorId: '', medicationId: '', instructions: '' });
      await fetchAllData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save prescription',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      medicationId: prescription.medicationId,
      instructions: prescription.instructions
    });
    setDialogOpen(true);
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Prescription deleted successfully',
        });
        await fetchAllData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prescription',
        variant: 'destructive'
      });
    }
  };

  const openAddDialog = () => {
    setEditingPrescription(null);
    setFormData({ patientId: '', doctorId: '', medicationId: '', instructions: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? 'Edit Prescription' : 'Add New Prescription'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Select value={formData.medicationId} onValueChange={(value) => setFormData({ ...formData, medicationId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((medication) => (
                      <SelectItem key={medication._id} value={medication._id}>
                        {medication.name} ({medication.dosage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take twice daily after meals"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPrescription ? 'Update Prescription' : 'Add Prescription'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first prescription.</p>
              <Button onClick={openAddDialog} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm">Prescription</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prescription)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prescription._id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Patient:</strong> {prescription.patientName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Doctor:</strong> {prescription.doctorName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Medication:</strong> {prescription.medicationName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {prescription.date}
                </p>
                {prescription.instructions && (
                  <p className="text-sm text-gray-600">
                    <strong>Instructions:</strong> {prescription.instructions}
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

export default Prescriptions;
