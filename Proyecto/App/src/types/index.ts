export interface Usuario {
  id: number;
  nombre: string | null;
  correo: string;
  telefono: string | null;
  contraseña: string | null;
  foto: string | null;
  cuenta_google: boolean | null;
  googleId: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Mascota {
  id: number;
  id_usuario: number;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: Date;
  sexo: string;
  color: string | null;
  peso: string;
  foto: string | null;
  alergias: string | null;
  enfermedades: string | null;
  observaciones: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Evento {
  id: number;
  id_mascota: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  estado: string;
  repeticion: string | null;
  created_at: Date;
  updated_at: Date;
  mascota?: {
    id: number;
    nombre: string;
    especie: string;
    foto: string | null;
  };
}

export interface Notificacion {
  id: number;
  id_usuario: number;
  id_evento: number;
  tipo: string;
  mensaje: string;
  fecha_programada: Date;
  canal: string;
  enviada: boolean | null;
  created_at: Date;
}

export interface DocumentoMascota {
  id: number;
  id_mascota: number;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  archivo_pdf: string;
  uploadedAt: Date;
}

export interface CarnetDigital {
  id: number;
  id_mascota: number;
  tipo_medicamento: 'Vacuna' | 'Desparasitación';
  nombre_medicamento: string;
  fecha_aplicacion: Date;
  laboratorio: string;
  id_lote: string;
  mes_elaboracion_medicamento: number | null;
  ano_elaboracion_medicamento: number | null;
  mes_vencimiento_medicamento: number;
  ano_vencimiento_medicamento: number;
  peso: number;
  nombre_veterinaria: string;
  telefono_veterinaria: string | null;
  direccion_veterinaria: string;
  proxima_dosis: Date | null;
  observaciones: string | null;
}

export interface Vet {
  id: string;
  name: string;
  address: string;
  schedule: string;
  latitude: number;
  longitude: number;
  phone?: string;
  source?: "amenity" | "shop" | "other";
}

export interface PetFormData {
  nombre: string;
  especie: string;
  raza?: string;
  fecha_nacimiento: string;
  sexo: string;
  color?: string;
  peso?: number;
  foto?: string;
  alergias?: string;
  enfermedades?: string;
  observaciones?: string;
}

export interface EventoFormData {
  id_mascota: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  estado?: string;
  repeticion?: string;
}
