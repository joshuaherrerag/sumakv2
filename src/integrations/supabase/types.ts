export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cursos: {
        Row: {
          categoria: string
          created_at: string
          descripcion: string | null
          es_incluido_en_suscripcion: boolean
          estado: Database["public"]["Enums"]["curso_estado"]
          id: string
          imagen_url: string | null
          mentor_id: string
          precio: number
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          descripcion?: string | null
          es_incluido_en_suscripcion?: boolean
          estado?: Database["public"]["Enums"]["curso_estado"]
          id?: string
          imagen_url?: string | null
          mentor_id: string
          precio?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descripcion?: string | null
          es_incluido_en_suscripcion?: boolean
          estado?: Database["public"]["Enums"]["curso_estado"]
          id?: string
          imagen_url?: string | null
          mentor_id?: string
          precio?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentores"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          alumno_id: string
          curso_id: string
          estado: Database["public"]["Enums"]["inscripcion_estado"]
          fecha: string
          id: string
        }
        Insert: {
          alumno_id: string
          curso_id: string
          estado?: Database["public"]["Enums"]["inscripcion_estado"]
          fecha?: string
          id?: string
        }
        Update: {
          alumno_id?: string
          curso_id?: string
          estado?: Database["public"]["Enums"]["inscripcion_estado"]
          fecha?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      lecciones: {
        Row: {
          contenido_url: string | null
          created_at: string
          duracion_min: number | null
          id: string
          modulo_id: string
          orden: number
          tipo: Database["public"]["Enums"]["leccion_tipo"]
          titulo: string
        }
        Insert: {
          contenido_url?: string | null
          created_at?: string
          duracion_min?: number | null
          id?: string
          modulo_id: string
          orden?: number
          tipo?: Database["public"]["Enums"]["leccion_tipo"]
          titulo: string
        }
        Update: {
          contenido_url?: string | null
          created_at?: string
          duracion_min?: number | null
          id?: string
          modulo_id?: string
          orden?: number
          tipo?: Database["public"]["Enums"]["leccion_tipo"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecciones_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      mentores: {
        Row: {
          activo: boolean
          categorias: string[] | null
          created_at: string
          descripcion: string | null
          featured: boolean
          id: string
          precio_suscripcion: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categorias?: string[] | null
          created_at?: string
          descripcion?: string | null
          featured?: boolean
          id?: string
          precio_suscripcion?: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categorias?: string[] | null
          created_at?: string
          descripcion?: string | null
          featured?: boolean
          id?: string
          precio_suscripcion?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          created_at: string
          curso_id: string
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          id?: string
          orden?: number
          titulo: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string
          id: string
          leida: boolean
          mensaje: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leida?: boolean
          mensaje: string
          tipo?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leida?: boolean
          mensaje?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellido: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          especialidad: string | null
          id: string
          nombre: string
          redes_sociales: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apellido?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          especialidad?: string | null
          id?: string
          nombre?: string
          redes_sociales?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apellido?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          especialidad?: string | null
          id?: string
          nombre?: string
          redes_sociales?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progreso_lecciones: {
        Row: {
          alumno_id: string
          completada: boolean
          fecha: string
          id: string
          leccion_id: string
        }
        Insert: {
          alumno_id: string
          completada?: boolean
          fecha?: string
          id?: string
          leccion_id: string
        }
        Update: {
          alumno_id?: string
          completada?: boolean
          fecha?: string
          id?: string
          leccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progreso_lecciones_leccion_id_fkey"
            columns: ["leccion_id"]
            isOneToOne: false
            referencedRelation: "lecciones"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripciones_mentor: {
        Row: {
          alumno_id: string
          created_at: string
          estado: Database["public"]["Enums"]["suscripcion_estado"]
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          mentor_id: string
          plan_id_mercadopago: string | null
        }
        Insert: {
          alumno_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["suscripcion_estado"]
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          mentor_id: string
          plan_id_mercadopago?: string | null
        }
        Update: {
          alumno_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["suscripcion_estado"]
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          mentor_id?: string
          plan_id_mercadopago?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_mentor_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mentor" | "alumno" | "finanzas"
      curso_estado: "borrador" | "pendiente" | "publicado" | "rechazado"
      inscripcion_estado: "activa" | "completada" | "cancelada"
      leccion_tipo: "video" | "pdf" | "texto"
      suscripcion_estado: "activa" | "cancelada" | "expirada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "mentor", "alumno", "finanzas"],
      curso_estado: ["borrador", "pendiente", "publicado", "rechazado"],
      inscripcion_estado: ["activa", "completada", "cancelada"],
      leccion_tipo: ["video", "pdf", "texto"],
      suscripcion_estado: ["activa", "cancelada", "expirada"],
    },
  },
} as const
