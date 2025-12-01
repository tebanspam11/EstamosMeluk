// Interfaz principal de Mascota
export interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  weight: string; 
  age: string;    
  image: string | null;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'unknown';
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  weight: string;
  age: string;
  image: string | null;
}

// Especies predefinidas
export interface Species {
  id: string;
  name: string;
  icon?: string;
}

// Usuario
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  pets?: Pet[];
}

// Eventos del calendario
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  petId: string;
  type: 'vaccine' | 'vet' | 'grooming' | 'other';
  description?: string;
}

// Documentos médicos
export interface MedicalDocument {
  id: string;
  petId: string;
  title: string;
  type: 'pdf' | 'image' | 'text';
  url: string;
  date: Date;
}

// Vacuna
export interface Vaccine {
  id: string;
  name: string;
  date: Date;
  nextDate?: Date;
  petId: string;
  verified: boolean;
}