export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      crops: {
        Row: {
          actual_harvest_date: string | null
          area_hectares: number | null
          created_at: string
          expected_harvest_date: string | null
          farm_id: string | null
          growth_stage: string | null
          health_status: string | null
          id: string
          name: string
          notes: string | null
          planted_date: string | null
          updated_at: string
          variety: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          area_hectares?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          farm_id?: string | null
          growth_stage?: string | null
          health_status?: string | null
          id?: string
          name: string
          notes?: string | null
          planted_date?: string | null
          updated_at?: string
          variety?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          area_hectares?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          farm_id?: string | null
          growth_stage?: string | null
          health_status?: string | null
          id?: string
          name?: string
          notes?: string | null
          planted_date?: string | null
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      farm_activities: {
        Row: {
          activity_type: string
          cost: number | null
          created_at: string
          crop_id: string | null
          description: string
          farm_id: string | null
          id: string
          performed_at: string
          quantity: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          cost?: number | null
          created_at?: string
          crop_id?: string | null
          description: string
          farm_id?: string | null
          id?: string
          performed_at: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          cost?: number | null
          created_at?: string
          crop_id?: string | null
          description?: string
          farm_id?: string | null
          id?: string
          performed_at?: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_activities_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_activities_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_hectares: number | null
          created_at: string
          description: string | null
          farm_type: string | null
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string
          description?: string | null
          farm_type?: string | null
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area_hectares?: number | null
          created_at?: string
          description?: string | null
          farm_type?: string | null
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_entries: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      notebooks: {
        Row: {
          audio_overview_generation_status: string | null
          audio_overview_url: string | null
          audio_url_expires_at: string | null
          color: string | null
          created_at: string
          description: string | null
          example_questions: string[] | null
          generation_status: string | null
          icon: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_overview_generation_status?: string | null
          audio_overview_url?: string | null
          audio_url_expires_at?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          example_questions?: string[] | null
          generation_status?: string | null
          icon?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_overview_generation_status?: string | null
          audio_overview_url?: string | null
          audio_url_expires_at?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          example_questions?: string[] | null
          generation_status?: string | null
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          extracted_text: string | null
          id: string
          notebook_id: string
          source_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          extracted_text?: string | null
          id?: string
          notebook_id: string
          source_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          extracted_text?: string | null
          id?: string
          notebook_id?: string
          source_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          content: string | null
          created_at: string
          display_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          notebook_id: string
          processing_status: string | null
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          notebook_id: string
          processing_status?: string | null
          summary?: string | null
          title: string
          type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          display_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          notebook_id?: string
          processing_status?: string | null
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string
          farm_id: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          title: string
          user_id: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          farm_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          title: string
          user_id?: string | null
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          farm_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          title?: string
          user_id?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string
          humidity: number | null
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          precipitation: number | null
          pressure: number | null
          recorded_at: string
          soil_moisture: number | null
          soil_temperature: number | null
          solar_radiation: number | null
          station_id: string | null
          temperature: number | null
          updated_at: string
          wind_direction: number | null
          wind_speed: number | null
          feels_like: number | null
          rainfall: number | null
          cloudiness: number | null
          weather_condition: string | null
          weather_description: string | null
          weather_icon: string | null
          visibility: number | null
          sunrise: string | null
          sunset: string | null
        }
        Insert: {
          created_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          precipitation?: number | null
          pressure?: number | null
          recorded_at: string
          soil_moisture?: number | null
          soil_temperature?: number | null
          solar_radiation?: number | null
          station_id?: string | null
          temperature?: number | null
          updated_at?: string
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          precipitation?: number | null
          pressure?: number | null
          recorded_at?: string
          soil_moisture?: number | null
          soil_temperature?: number | null
          solar_radiation?: number | null
          station_id?: string
          temperature?: number | null
          updated_at?: string
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      weather_stations: {
        Row: {
          created_at: string
          elevation: number | null
          id: string
          installation_date: string | null
          latitude: number
          location_name: string
          longitude: number
          name: string
          station_id: string
          station_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          elevation?: number | null
          id?: string
          installation_date?: string | null
          latitude: number
          location_name: string
          longitude: number
          name: string
          station_id: string
          station_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          elevation?: number | null
          id?: string
          installation_date?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          name?: string
          station_id?: string
          station_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_notebook_owner: {
        Args: { notebook_id_param: string }
        Returns: boolean
      }
      is_notebook_owner_for_document: {
        Args: { doc_metadata: Json }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      source_type: "pdf" | "text" | "website" | "youtube" | "audio"
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
      source_type: ["pdf", "text", "website", "youtube", "audio"],
    },
  },
} as const