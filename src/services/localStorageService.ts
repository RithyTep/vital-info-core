
export interface Patient {
  id: string;
  name: string;
  age: number;
  contact: string;
  medicalHistory: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  stockQuantity: number;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicationId: string;
  instructions: string;
  date: string;
  createdAt: string;
}

class LocalStorageService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generic CRUD operations
  private getItems<T>(key: string): T[] {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  private setItems<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }

  private createItem<T extends { id: string; createdAt: string }>(key: string, item: Omit<T, 'id' | 'createdAt'>): T {
    const items = this.getItems<T>(key);
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    } as T;
    items.push(newItem);
    this.setItems(key, items);
    return newItem;
  }

  private updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    const items = this.getItems<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.setItems(key, items);
      return items[index];
    }
    return null;
  }

  private deleteItem<T extends { id: string }>(key: string, id: string): boolean {
    const items = this.getItems<T>(key);
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length !== items.length) {
      this.setItems(key, filteredItems);
      return true;
    }
    return false;
  }

  // Patients
  getPatients(): Patient[] {
    return this.getItems<Patient>('hms-patients');
  }

  createPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
    return this.createItem<Patient>('hms-patients', patient);
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    return this.updateItem<Patient>('hms-patients', id, updates);
  }

  deletePatient(id: string): boolean {
    return this.deleteItem<Patient>('hms-patients', id);
  }

  // Doctors
  getDoctors(): Doctor[] {
    return this.getItems<Doctor>('hms-doctors');
  }

  createDoctor(doctor: Omit<Doctor, 'id' | 'createdAt'>): Doctor {
    return this.createItem<Doctor>('hms-doctors', doctor);
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    return this.updateItem<Doctor>('hms-doctors', id, updates);
  }

  deleteDoctor(id: string): boolean {
    return this.deleteItem<Doctor>('hms-doctors', id);
  }

  // Medications
  getMedications(): Medication[] {
    return this.getItems<Medication>('hms-medications');
  }

  createMedication(medication: Omit<Medication, 'id' | 'createdAt'>): Medication {
    return this.createItem<Medication>('hms-medications', medication);
  }

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    return this.updateItem<Medication>('hms-medications', id, updates);
  }

  deleteMedication(id: string): boolean {
    return this.deleteItem<Medication>('hms-medications', id);
  }

  // Prescriptions
  getPrescriptions(): Prescription[] {
    return this.getItems<Prescription>('hms-prescriptions');
  }

  createPrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription {
    return this.createItem<Prescription>('hms-prescriptions', prescription);
  }

  updatePrescription(id: string, updates: Partial<Prescription>): Prescription | null {
    return this.updateItem<Prescription>('hms-prescriptions', id, updates);
  }

  deletePrescription(id: string): boolean {
    return this.deleteItem<Prescription>('hms-prescriptions', id);
  }
}

export const localStorageService = new LocalStorageService();
