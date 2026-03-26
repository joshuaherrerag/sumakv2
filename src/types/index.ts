export type AppRole = 'admin' | 'mentor' | 'alumno' | 'finanzas';

export interface Profile {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  avatar_url: string | null;
  bio: string | null;
  especialidad: string | null;
  redes_sociales: Record<string, string> | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Mentor {
  id: string;
  profile_id: string;
  descripcion: string | null;
  categorias: string[];
  precio_suscripcion: number;
  activo: boolean;
  featured: boolean;
  profile?: Profile;
}

export interface Curso {
  id: string;
  mentor_id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio: number;
  es_incluido_en_suscripcion: boolean;
  estado: 'borrador' | 'pendiente' | 'publicado' | 'rechazado';
  categoria: string;
  created_at: string;
  mentor?: Mentor & { profile?: Profile };
}

export interface Modulo {
  id: string;
  curso_id: string;
  titulo: string;
  orden: number;
  lecciones?: Leccion[];
}

export interface Leccion {
  id: string;
  modulo_id: string;
  titulo: string;
  tipo: 'video' | 'pdf' | 'texto';
  contenido_url: string | null;
  duracion_min: number | null;
  orden: number;
}

export interface Inscripcion {
  id: string;
  alumno_id: string;
  curso_id: string;
  fecha: string;
  estado: 'activa' | 'completada' | 'cancelada';
}

export interface SuscripcionMentor {
  id: string;
  alumno_id: string;
  mentor_id: string;
  estado: 'activa' | 'cancelada' | 'expirada';
  fecha_inicio: string;
  fecha_fin: string | null;
  plan_id_mercadopago: string | null;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

// Países de Latinoamérica
export const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'República Dominicana', 'Uruguay', 'Venezuela',
] as const;

export type PaisLatam = (typeof PAISES_LATAM)[number];

// Categorías disponibles
export const CATEGORIAS = [
  'Desarrollo Personal',
  'Negocios',
  'Salud y Bienestar',
  'Espiritualidad',
  'Relaciones',
  'Finanzas',
  'Creatividad',
  'Liderazgo',
  'Productividad',
  'Mindfulness',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
