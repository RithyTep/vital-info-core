import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, FileText, Stethoscope, AlertCircle, Check } from "lucide-react";
import { localStorageService, Patient } from "@/services/localStorageService";
import { useLanguage } from "@/contexts/LanguageContext";


interface PatientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSave: (updated: Patient) => void;
}

const PatientEditDialog: React.FC<PatientEditDialogProps> = ({
  open,
  onOpenChange,
  patient,
  onSave
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Partial<Patient>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'medical' | 'contact'>('basic');
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty?: string }[]>([]);

  useEffect(() => {
    setDoctors(localStorageService.getDoctors());
    if (patient) {
      setForm({
        ...patient,
        gender: patient.gender?.toLowerCase(),
        bloodGroup: patient.bloodGroup,
        assignedDoctor: patient.assignedDoctor,
      });
      setHasChanges(false);
    } else {
      setForm({});
    }
    setErrors({});
  }, [patient]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let updatedPatient: Patient | null = null;
      if (patient && patient.id) {
        updatedPatient = localStorageService.updatePatient(patient.id, form) as Patient;
      } else {
        updatedPatient = localStorageService.createPatient(form as Omit<Patient, 'id' | 'createdAt'>);
      }
      if (updatedPatient) {
        onSave(updatedPatient);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to save patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const tabs = [
    { id: 'basic', label: t('basicInfo') || 'Basic Info', icon: User },
    { id: 'medical', label: t('medical') || 'Medical', icon: Stethoscope },
    { id: 'contact', label: t('contactAndInsurance') || 'Contact & Insurance', icon: Phone }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            <User className="inline w-4 h-4 mr-1" />
            {t('fullName') || 'Full Name'} *
          </label>
          <Input
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            className={errors.name ? 'border-red-500' : ''}
            placeholder={t('enterFullName') || "Enter patient's full name"}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('age') || 'Age'}</label>
          <Input
            name="age"
            type="number"
            min="0"
            max="150"
            value={form.age || ''}
            onChange={handleChange}
            className={errors.age ? 'border-red-500' : ''}
            placeholder={t('age') || 'Age'}
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('gender') || 'Gender'}</label>
          <Select value={form.gender ?? undefined} onValueChange={(value) => handleSelectChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectGender') || 'Select gender'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('male') || 'Male'}</SelectItem>
              <SelectItem value="female">{t('female') || 'Female'}</SelectItem>
              <SelectItem value="other">{t('other') || 'Other'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('bloodType') || 'Blood Type'}</label>
          <Select value={form.bloodGroup ?? undefined} onValueChange={(value) => handleSelectChange('bloodGroup', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectBloodType') || 'Select blood type'} />
            </SelectTrigger>
            <SelectContent>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <FileText className="inline w-4 h-4 mr-1" />
          {t('description') || 'Description'}
        </label>
        <Textarea
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          placeholder={t('descriptionPlaceholder') || 'Brief description or notes about the patient'}
          className="min-h-20"
        />
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <Stethoscope className="inline w-4 h-4 mr-1" />
          {t('assignedDoctor') || 'Assigned Doctor'}
        </label>
        <Select value={form.assignedDoctor ?? undefined} onValueChange={(value) => handleSelectChange('assignedDoctor', value)}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectADoctor') || 'Select a doctor'} />
          </SelectTrigger>
          <SelectContent>
            {doctors.map(doc => (
              <SelectItem key={doc.id} value={doc.name}>
                <div className="flex items-center justify-between w-full">
                  <span>{doc.name}</span>
                  {doc.specialty && <Badge variant="secondary" className="ml-2">{doc.specialty}</Badge>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <AlertCircle className="inline w-4 h-4 mr-1" />
          {t('allergies') || 'Allergies'}
        </label>
        <Textarea
          name="allergies"
          value={form.allergies || ''}
          onChange={handleChange}
          placeholder={t('allergiesPlaceholder') || 'List any known allergies (medications, food, environmental, etc.)'}
          className="min-h-20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <FileText className="inline w-4 h-4 mr-1" />
          {t('medicalHistory') || 'Medical History'}
        </label>
        <Textarea
          name="medicalHistory"
          value={form.medicalHistory || ''}
          onChange={handleChange}
          placeholder={t('medicalHistoryPlaceholder') || 'Previous medical conditions, surgeries, chronic illnesses, etc.'}
          className="min-h-32"
        />
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            <Mail className="inline w-4 h-4 mr-1" />
            {t('email') || 'Email'}
          </label>
          <Input
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            className={errors.email ? 'border-red-500' : ''}
            placeholder="patient@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            <Phone className="inline w-4 h-4 mr-1" />
            {t('phoneNumber') || 'Phone Number'}
          </label>
          <Input
            name="contact"
            value={form.contact || ''}
            onChange={handleChange}
            className={errors.contact ? 'border-red-500' : ''}
            placeholder="+1 (555) 123-4567"
          />
          {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <Phone className="inline w-4 h-4 mr-1" />
          {t('emergencyContact') || 'Emergency Contact'}
        </label>
        <Input
          name="emergencyContact"
          value={form.emergencyContact || ''}
          onChange={handleChange}
          placeholder={t('emergencyContactPlaceholder') || 'Emergency contact name and phone number'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {t('insuranceProvider') || 'Insurance Provider'}
        </label>
        <Input
          name="insuranceProvider"
          value={form.insuranceProvider || ''}
          onChange={handleChange}
          placeholder={t('insuranceProviderPlaceholder') || 'Insurance company and policy number'}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('editPatientInformation') || 'Edit Patient Information'}
            {hasChanges && <Badge variant="outline" className="ml-2">Unsaved Changes</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'basic' | 'medical' | 'contact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-1">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'medical' && renderMedicalInfo()}
            {activeTab === 'contact' && renderContactInfo()}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Please fix the errors above before saving.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(errors).length > 0}
              className="min-w-20"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('saving')}...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {t('saveChanges') || 'Save Changes'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientEditDialog;
