import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { localStorageService, Patient } from "@/services/localStorageService";
import { useLanguage } from "@/contexts/LanguageContext";

const PatientEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const found = localStorageService.getPatients().find((p) => p.id === id);
      if (found) setFormData(found);
    }
    setLoading(false);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    localStorageService.updatePatient(id, formData);
    navigate(`/patient/${id}`);
  };

  if (loading) return <div className="p-6">{t('loading') || 'Loading...'}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('editPatient') || 'Edit Patient'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">{t('fullName') || 'Full Name'}</label>
            <Input name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1">{t('email') || 'Email'}</label>
            <Input name="email" value={formData.email || ''} onChange={handleChange} type="email" />
          </div>
          <div>
            <label className="block mb-1">{t('phoneNumber') || 'Phone'}</label>
            <Input name="contact" value={formData.contact || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">{t('gender') || 'Gender'}</label>
            <Input name="gender" value={formData.gender || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">{t('age') || 'Age'}</label>
            <Input name="age" value={formData.age || ''} onChange={handleChange} type="number" min="0" />
          </div>
          <div>
            <label className="block mb-1">{t('description') || 'Description'}</label>
            <Textarea name="description" value={formData.description || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">{t('medicalHistory') || 'Medical History'}</label>
            <Textarea name="medicalHistory" value={formData.medicalHistory || ''} onChange={handleChange} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>{t('cancel') || 'Cancel'}</Button>
            <Button type="submit">{t('save') || 'Save'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientEdit;
