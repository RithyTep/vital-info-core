
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Search, Printer, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { localStorageService, Medication } from '@/services/localStorageService';
import { printData } from '@/utils/printUtils';
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    stockQuantity: 0,
    imageUrl: ''
  });
  const [view, setView] = useState<'card' | 'table'>('card');
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = () => {
    try {
      const data = localStorageService.getMedications();
      setMedications(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('fetchMedicationsFailed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedication) {
        localStorageService.updateMedication(editingMedication.id, formData);
        toast({
          title: t('success'),
          description: t('medicationUpdatedSuccess'),
        });
      } else {
        localStorageService.createMedication(formData);
        toast({
          title: t('success'),
          description: t('medicationAddedSuccess'),
        });
      }
      setDialogOpen(false);
      setEditingMedication(null);
      setFormData({ name: '', dosage: '', stockQuantity: 0, imageUrl: '' });
      fetchMedications();
    } catch (error) {
      let description = t('medicationSaveFailed');
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'QUOTA_EXCEEDED_ERR')) {
        description = "Image is too large to be saved. Please use a smaller file.";
      }
      toast({
        title: t('error'),
        description: description,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      stockQuantity: medication.stockQuantity,
      imageUrl: medication.imageUrl || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
  };

  const confirmDelete = () => {
    if (!medicationToDelete) return;
    try {
      localStorageService.deleteMedication(medicationToDelete.id);
      toast({
        title: t('success'),
        description: t('medicationDeletedSuccess'),
      });
      fetchMedications();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('medicationDeleteFailed'),
        variant: 'destructive'
      });
    }
    setMedicationToDelete(null);
  };

  const handlePrint = () => {
    const printableData = filteredMedications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      stockQuantity: med.stockQuantity,
      status: getStockStatus(med.stockQuantity).text
    }));
    printData(printableData, t('medications'), ['name', 'dosage', 'stockQuantity', 'status']);
  };

  const openAddDialog = () => {
    setEditingMedication(null);
    setFormData({ name: '', dosage: '', stockQuantity: 0, imageUrl: '' });
    setDialogOpen(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: t('outOfStock'), color: 'text-red-600 bg-red-100' };
    if (quantity < 10) return { text: t('lowStock'), color: 'text-orange-600 bg-orange-100' };
    return { text: t('inStock'), color: 'text-green-600 bg-green-100' };
  };

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('medications')}
          </h1>
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('medications')}
        </h1>
        <div className="flex space-x-2">
          {/* Table/card view switcher button */}
          <Button
            variant={view === 'card' ? "outline" : "default"}
            onClick={() => setView(view === 'card' ? 'table' : 'card')}
            aria-label={view === 'card' ? t('tableView') : t('cardView')}
            className="hover:bg-gray-100"
          >
            {view === 'card' ? (
              <>
                <TableIcon className="h-4 w-4 mr-1" />
                <span>{t('tableView')}</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span>{t('cardView')}</span>
              </>
            )}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="hover:bg-green-50">
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addMedication')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMedication ? t('edit') + ' ' + t('medications') : t('addMedication')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('medicationName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">{t('dosage')}</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">{t('stockQuantity')}</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">{t('image')}</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  {formData.imageUrl && <img src={formData.imageUrl} alt={t('preview')} className="mt-2 h-20 w-20 object-cover rounded" />}
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {editingMedication ? t('save') : t('addMedication')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t('search') + ' ' + t('medications').toLowerCase() + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/70 backdrop-blur-sm"
        />
      </div>

      {/* View Toggling between Card and Table */}
      {filteredMedications.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noMedicationsFound")}</h3>
              <p className="text-gray-600 mb-4">{t("getStartedMedication")}</p>
              <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('addMedication')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        view === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication) => {
              const stockStatus = getStockStatus(medication.stockQuantity);
              return (
                <Card key={medication.id} className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">{medication.name}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medication)}
                          aria-label={t('edit')}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(medication)}
                          aria-label={t('delete')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {medication.imageUrl && <img src={medication.imageUrl} alt={medication.name} className="mb-3 h-32 w-full object-cover rounded-md" />}
                    <p className="text-sm text-gray-600">
                      <strong>{t('dosage')}:</strong> {medication.dosage}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>{t('stockQuantity')}:</strong> {medication.stockQuantity} {t('units')}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200">
            {/* Table view */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('medicationName')}</TableHead>
                  <TableHead>{t('dosage')}</TableHead>
                  <TableHead>{t('stockQuantity')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedications.map(medication => {
                  const stockStatus = getStockStatus(medication.stockQuantity);
                  return (
                    <TableRow key={medication.id}>
                      <TableCell>{medication.name}</TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>
                        {medication.stockQuantity} {t('units')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={t('edit')}
                          onClick={() => handleEdit(medication)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={t('delete')}
                          onClick={() => handleDelete(medication)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )
      )}
      <AlertDialog open={!!medicationToDelete} onOpenChange={(open) => !open && setMedicationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteMedication')}
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

export default Medications;
