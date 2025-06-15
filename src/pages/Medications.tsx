
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  _id?: string;
  name: string;
  dosage: string;
  stockQuantity: number;
}

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<Medication>({
    name: '',
    dosage: '',
    stockQuantity: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications');
      const data = await response.json();
      setMedications(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch medications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMedication) {
        const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications/${editingMedication._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Medication updated successfully',
          });
        }
      } else {
        const response = await fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Medication added successfully',
          });
        }
      }

      setDialogOpen(false);
      setEditingMedication(null);
      setFormData({ name: '', dosage: '', stockQuantity: 0 });
      await fetchMedications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save medication',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData(medication);
    setDialogOpen(true);
  };

  const handleDelete = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    try {
      const response = await fetch(`https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications/${medicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Medication deleted successfully',
        });
        await fetchMedications();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete medication',
        variant: 'destructive'
      });
    }
  };

  const openAddDialog = () => {
    setEditingMedication(null);
    setFormData({ name: '', dosage: '', stockQuantity: 0 });
    setDialogOpen(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (quantity < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
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
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMedication ? 'Update Medication' : 'Add Medication'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first medication.</p>
              <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((medication) => {
            const stockStatus = getStockStatus(medication.stockQuantity);
            return (
              <Card key={medication._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{medication.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(medication)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(medication._id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    <strong>Dosage:</strong> {medication.dosage}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Stock:</strong> {medication.stockQuantity} units
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Medications;
