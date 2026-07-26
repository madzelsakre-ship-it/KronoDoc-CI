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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      document_requests: {
        Row: {
          address_details: string | null
          address_ilot: string | null
          address_quartier: string | null
          address_secteur: string | null
          agent_id: string | null
          agent_validated_at: string | null
          applicant_birth_date: string | null
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone: string | null
          commune: string
          created_at: string
          delivered_at: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          host_full_name: string | null
          host_id_number: string | null
          host_signature_data: string | null
          id: string
          is_hosted: boolean
          ocr_match: boolean | null
          ocr_notes: string | null
          officer_id: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          reference: string
          rejection_reason: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
          verification_code: string
        }
        Insert: {
          address_details?: string | null
          address_ilot?: string | null
          address_quartier?: string | null
          address_secteur?: string | null
          agent_id?: string | null
          agent_validated_at?: string | null
          applicant_birth_date?: string | null
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone?: string | null
          commune: string
          created_at?: string
          delivered_at?: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          host_full_name?: string | null
          host_id_number?: string | null
          host_signature_data?: string | null
          id?: string
          is_hosted?: boolean
          ocr_match?: boolean | null
          ocr_notes?: string | null
          officer_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          reference: string
          rejection_reason?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
          verification_code: string
        }
        Update: {
          address_details?: string | null
          address_ilot?: string | null
          address_quartier?: string | null
          address_secteur?: string | null
          agent_id?: string | null
          agent_validated_at?: string | null
          applicant_birth_date?: string | null
          applicant_first_name?: string
          applicant_last_name?: string
          applicant_phone?: string | null
          commune?: string
          created_at?: string
          delivered_at?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          host_full_name?: string | null
          host_id_number?: string | null
          host_signature_data?: string | null
          id?: string
          is_hosted?: boolean
          ocr_match?: boolean | null
          ocr_notes?: string | null
          officer_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          reference?: string
          rejection_reason?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          commune: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          id_document_number: string | null
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          commune?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id: string
          id_document_number?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          commune?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          id_document_number?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      request_documents: {
        Row: {
          created_at: string
          id: string
          kind: string
          ocr_text: string | null
          request_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ocr_text?: string | null
          request_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ocr_text?: string | null
          request_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "document_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          commune: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          commune?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          commune?: string | null
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      verify_document: {
        Args: { _code: string }
        Returns: {
          commune: string
          doc_type: Database["public"]["Enums"]["document_type"]
          holder_name: string
          is_valid: boolean
          reference: string
          signed_at: string
        }[]
      }
    }
    Enums: {
      app_role: "citoyen" | "agent" | "officier" | "admin"
      document_type:
        | "certificat_residence"
        | "extrait_naissance"
        | "certificat_vie"
        | "certificat_celibat"
        | "legalisation"
        | "attestation_hebergement"
      payment_method:
        | "wave"
        | "orange_money"
        | "mtn_money"
        | "moov_money"
        | "especes"
      request_status:
        | "brouillon"
        | "en_attente_paiement"
        | "en_attente_guichet"
        | "en_verification"
        | "en_attente_signature"
        | "signe"
        | "delivre"
        | "rejete"
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
      app_role: ["citoyen", "agent", "officier", "admin"],
      document_type: [
        "certificat_residence",
        "extrait_naissance",
        "certificat_vie",
        "certificat_celibat",
        "legalisation",
        "attestation_hebergement",
      ],
      payment_method: [
        "wave",
        "orange_money",
        "mtn_money",
        "moov_money",
        "especes",
      ],
      request_status: [
        "brouillon",
        "en_attente_paiement",
        "en_attente_guichet",
        "en_verification",
        "en_attente_signature",
        "signe",
        "delivre",
        "rejete",
      ],
    },
  },
} as const
