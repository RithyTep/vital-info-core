
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'km';
  setLanguage: (lang: 'en' | 'km') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patients',
    doctors: 'Doctors',
    medications: 'Medications',
    prescriptions: 'Prescriptions',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    contact: 'Contact',
    search: 'Search',
    print: 'Print',
    
    // Dashboard
    totalPatients: 'Total Patients',
    totalDoctors: 'Total Doctors',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    
    // Patients
    addPatient: 'Add Patient',
    patientName: 'Patient Name',
    age: 'Age',
    medicalHistory: 'Medical History',
    
    // Doctors
    addDoctor: 'Add Doctor',
    doctorName: 'Doctor Name',
    specialty: 'Specialty',
    
    // Medications
    addMedication: 'Add Medication',
    medicationName: 'Medication Name',
    dosage: 'Dosage',
    stockQuantity: 'Stock Quantity',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    
    // Auth
    login: 'Login',
    password: 'Password',
    loginRequired: 'Login Required',
    invalidPassword: 'Invalid Password'
  },
  km: {
    // Navigation
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    patients: 'អ្នកជំងឺ',
    doctors: 'វេជ្ជបណ្ឌិត',
    medications: 'ថ្នាំពេទ្យ',
    prescriptions: 'បទវេជ្ជបញ្ជា',
    
    // Common
    add: 'បន្ថែម',
    edit: 'កែប្រែ',
    delete: 'លុប',
    save: 'រក្សាទុក',
    cancel: 'បោះបង់',
    name: 'ឈ្មោះ',
    contact: 'ទំនាក់ទំនង',
    search: 'ស្វែងរក',
    print: 'បោះពុម្ព',
    
    // Dashboard
    totalPatients: 'អ្នកជំងឺសរុប',
    totalDoctors: 'វេជ្ជបណ្ឌិតសរុប',
    quickActions: 'សកម្មភាពរហ័ស',
    recentActivity: 'សកម្មភាពថ្មីៗ',
    
    // Patients
    addPatient: 'បន្ថែមអ្នកជំងឺ',
    patientName: 'ឈ្មោះអ្នកជំងឺ',
    age: 'អាយុ',
    medicalHistory: 'ប្រវត្តិវេជ្ជសាស្ត្រ',
    
    // Doctors
    addDoctor: 'បន្ថែមវេជ្ជបណ្ឌិត',
    doctorName: 'ឈ្មោះវេជ្ជបណ្ឌិត',
    specialty: 'ជំនាញ',
    
    // Medications
    addMedication: 'បន្ថែមថ្នាំពេទ្យ',
    medicationName: 'ឈ្មោះថ្នាំ',
    dosage: 'កម្រិតថ្នាំ',
    stockQuantity: 'បរិមាណស្តុក',
    inStock: 'មានស្តុក',
    lowStock: 'ស្តុកតិច',
    outOfStock: 'អស់ស្តុក',
    
    // Auth
    login: 'ចូលប្រើប្រាស់',
    password: 'ពាក្យសម្ងាត់',
    loginRequired: 'ត្រូវការចូលប្រើប្រាស់',
    invalidPassword: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'km'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('hms-language') as 'en' | 'km';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'km') => {
    setLanguage(lang);
    localStorage.setItem('hms-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
