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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      brokers: {
        Row: {
          agency_name: string | null
          created_at: string
          id: string
          name: string
          phone: string
          plan: Database["public"]["Enums"]["broker_plan"]
          property_limit: number
          subdomain_slug: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          agency_name?: string | null
          created_at?: string
          id: string
          name?: string
          phone?: string
          plan?: Database["public"]["Enums"]["broker_plan"]
          property_limit?: number
          subdomain_slug: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          agency_name?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          plan?: Database["public"]["Enums"]["broker_plan"]
          property_limit?: number
          subdomain_slug?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          broker_id: string
          budget_max: number | null
          budget_min: number | null
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          name: string
          phone: string
          property_id: string
          status: Database["public"]["Enums"]["lead_status"]
          whatsapp_number: string | null
        }
        Insert: {
          broker_id: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          name: string
          phone: string
          property_id: string
          status?: Database["public"]["Enums"]["lead_status"]
          whatsapp_number?: string | null
        }
        Update: {
          broker_id?: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          name?: string
          phone?: string
          property_id?: string
          status?: Database["public"]["Enums"]["lead_status"]
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_text: string | null
          amenities: string[]
          area_sqft: number | null
          bhk: number | null
          broker_id: string
          call_click_count: number
          city: string
          created_at: string
          description: string | null
          facing: string | null
          floor: string | null
          floor_plan_url: string | null
          id: string
          lat: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng: number | null
          locality: string | null
          meta_description: string | null
          parking: string | null
          pdf_url: string | null
          photos: Json
          price: number | null
          price_display: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          rera_number: string | null
          rera_status: Database["public"]["Enums"]["rera_status"]
          slug: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
          view_count: number
          whatsapp_click_count: number
          whatsapp_message: string | null
        }
        Insert: {
          address_text?: string | null
          amenities?: string[]
          area_sqft?: number | null
          bhk?: number | null
          broker_id: string
          call_click_count?: number
          city?: string
          created_at?: string
          description?: string | null
          facing?: string | null
          floor?: string | null
          floor_plan_url?: string | null
          id?: string
          lat?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          locality?: string | null
          meta_description?: string | null
          parking?: string | null
          pdf_url?: string | null
          photos?: Json
          price?: number | null
          price_display?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rera_number?: string | null
          rera_status?: Database["public"]["Enums"]["rera_status"]
          slug: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
          view_count?: number
          whatsapp_click_count?: number
          whatsapp_message?: string | null
        }
        Update: {
          address_text?: string | null
          amenities?: string[]
          area_sqft?: number | null
          bhk?: number | null
          broker_id?: string
          call_click_count?: number
          city?: string
          created_at?: string
          description?: string | null
          facing?: string | null
          floor?: string | null
          floor_plan_url?: string | null
          id?: string
          lat?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          locality?: string | null
          meta_description?: string | null
          parking?: string | null
          pdf_url?: string | null
          photos?: Json
          price?: number | null
          price_display?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rera_number?: string | null
          rera_status?: Database["public"]["Enums"]["rera_status"]
          slug?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
          view_count?: number
          whatsapp_click_count?: number
          whatsapp_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      property_events: {
        Row: {
          broker_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          property_id: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          property_id: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_events_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_property_event: {
        Args: {
          _event_type: Database["public"]["Enums"]["event_type"]
          _property_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      broker_plan: "free" | "starter" | "pro"
      event_type: "view" | "whatsapp_click" | "call_click" | "enquiry_submit"
      lead_status: "new" | "contacted" | "site_visit" | "closed" | "lost"
      listing_type: "sale" | "rent"
      property_status: "draft" | "active" | "sold" | "rented" | "inactive"
      property_type: "apartment" | "villa" | "plot" | "commercial"
      rera_status: "not_provided" | "provided_unverified"
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
      broker_plan: ["free", "starter", "pro"],
      event_type: ["view", "whatsapp_click", "call_click", "enquiry_submit"],
      lead_status: ["new", "contacted", "site_visit", "closed", "lost"],
      listing_type: ["sale", "rent"],
      property_status: ["draft", "active", "sold", "rented", "inactive"],
      property_type: ["apartment", "villa", "plot", "commercial"],
      rera_status: ["not_provided", "provided_unverified"],
    },
  },
} as const
