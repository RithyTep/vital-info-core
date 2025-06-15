
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, Table as TableIcon } from "lucide-react";
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

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Omit<Patient, "id" | "createdAt">>({
    name: "",
    age: 0,
    contact: "",
    medicalHistory: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line
  }, []);

  const fetchPatients = () => {
    try {
      const data = localStorageService.getPatients();
      setPatients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        localStorageService.updatePatient(editingPatient.id, formData);
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
      } else {
        localStorageService.createPatient(formData);
        toast({
          title: "Success",
          description: "Patient added successfully",
        });
      }

      setDialogOpen(false);
      setEditingPatient(null);
      setFormData({ name: "", age: 0, contact: "", medicalHistory: "" });
      fetchPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save patient",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      contact: patient.contact,
      medicalHistory: patient.medicalHistory,
    });
    setDialogOpen(true);
  };

  const handleDelete = (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      localStorageService.deletePatient(patientId);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      fetchPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingPatient(null);
    setFormData({ name: "", age: 0, contact: "", medicalHistory: "" });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
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
        <h1 className="text-3xl font-bold text-blue-800">Patients</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicalHistory: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPatient ? "Update Patient" : "Add Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {patients.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first patient.
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white/90 rounded-lg shadow border p-4">
          <Table>
            <TableCaption>All Registered Patients</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Medical History</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.medicalHistory}</TableCell>
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
