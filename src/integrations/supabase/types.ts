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
      agency_members: {
        Row: {
          agency_owner_id: string
          created_at: string
          id: string
          invited_email: string
          member_broker_id: string | null
          role: Database["public"]["Enums"]["agency_seat_role"]
          status: Database["public"]["Enums"]["member_status"]
        }
        Insert: {
          agency_owner_id: string
          created_at?: string
          id?: string
          invited_email: string
          member_broker_id?: string | null
          role?: Database["public"]["Enums"]["agency_seat_role"]
          status?: Database["public"]["Enums"]["member_status"]
        }
        Update: {
          agency_owner_id?: string
          created_at?: string
          id?: string
          invited_email?: string
          member_broker_id?: string | null
          role?: Database["public"]["Enums"]["agency_seat_role"]
          status?: Database["public"]["Enums"]["member_status"]
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_owner_id_fkey"
            columns: ["agency_owner_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_member_broker_id_fkey"
            columns: ["member_broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_subscriptions: {
        Row: {
          agency_owner_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          listings_used_this_cycle: number
          monthly_listing_pool: number
          plan: Database["public"]["Enums"]["agency_plan"]
          razorpay_subscription_id: string | null
          seat_limit: number
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          agency_owner_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          listings_used_this_cycle?: number
          monthly_listing_pool?: number
          plan: Database["public"]["Enums"]["agency_plan"]
          razorpay_subscription_id?: string | null
          seat_limit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          agency_owner_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          listings_used_this_cycle?: number
          monthly_listing_pool?: number
          plan?: Database["public"]["Enums"]["agency_plan"]
          razorpay_subscription_id?: string | null
          seat_limit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_subscriptions_agency_owner_id_fkey"
            columns: ["agency_owner_id"]
            isOneToOne: true
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          agency_id: string | null
          agency_name: string | null
          agency_seat_role:
            | Database["public"]["Enums"]["agency_seat_role"]
            | null
          created_at: string
          id: string
          listing_credits_remaining: number
          name: string
          phone: string
          subdomain_slug: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          agency_id?: string | null
          agency_name?: string | null
          agency_seat_role?:
            | Database["public"]["Enums"]["agency_seat_role"]
            | null
          created_at?: string
          id: string
          listing_credits_remaining?: number
          name?: string
          phone?: string
          subdomain_slug: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          agency_id?: string | null
          agency_name?: string | null
          agency_seat_role?:
            | Database["public"]["Enums"]["agency_seat_role"]
            | null
          created_at?: string
          id?: string
          listing_credits_remaining?: number
          name?: string
          phone?: string
          subdomain_slug?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "brokers_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          balance_after: number
          broker_id: string
          created_at: string
          delta: number
          id: string
          property_id: string | null
          purchase_id: string | null
          reason: string
        }
        Insert: {
          balance_after: number
          broker_id: string
          created_at?: string
          delta: number
          id?: string
          property_id?: string | null
          purchase_id?: string | null
          reason: string
        }
        Update: {
          balance_after?: number
          broker_id?: string
          created_at?: string
          delta?: number
          id?: string
          property_id?: string | null
          purchase_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "credit_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_purchases: {
        Row: {
          amount_paise: number
          broker_id: string
          created_at: string
          credits_granted: number
          id: string
          pack_type: Database["public"]["Enums"]["credit_pack"]
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["purchase_status"]
        }
        Insert: {
          amount_paise?: number
          broker_id: string
          created_at?: string
          credits_granted?: number
          id?: string
          pack_type: Database["public"]["Enums"]["credit_pack"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
        }
        Update: {
          amount_paise?: number
          broker_id?: string
          created_at?: string
          credits_granted?: number
          id?: string
          pack_type?: Database["public"]["Enums"]["credit_pack"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          body: string | null
          broker_id: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          broker_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          broker_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
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
      rate_limit_hits: {
        Row: {
          bucket: string
          created_at: string
          id: string
          subject: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          subject: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          subject?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_agency_invite: { Args: never; Returns: Json }
      hit_rate_limit: {
        Args: {
          _bucket: string
          _limit: number
          _subject: string
          _window_seconds: number
        }
        Returns: boolean
      }
      invite_agency_member: { Args: { _email: string }; Returns: Json }
      pending_agency_invite: { Args: never; Returns: Json }
      publish_property: { Args: { _property_id: string }; Returns: Json }
      remove_agency_member: { Args: { _member_id: string }; Returns: Json }
      track_property_event: {
        Args: {
          _event_type: Database["public"]["Enums"]["event_type"]
          _property_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "solo" | "agency"
      agency_plan: "starter_agency" | "growth_agency"
      agency_seat_role: "owner" | "member"
      credit_pack: "starter" | "launch"
      event_type: "view" | "whatsapp_click" | "call_click" | "enquiry_submit"
      lead_status: "new" | "contacted" | "site_visit" | "closed" | "lost"
      listing_type: "sale" | "rent"
      member_status: "invited" | "active" | "removed"
      notification_type:
        | "new_lead"
        | "low_credits"
        | "payment_success"
        | "agency_invite"
      property_status: "draft" | "active" | "sold" | "rented" | "inactive"
      property_type: "apartment" | "villa" | "plot" | "commercial"
      purchase_status: "created" | "paid" | "failed"
      rera_status: "not_provided" | "provided_unverified"
      subscription_status: "active" | "past_due" | "cancelled"
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
      account_type: ["solo", "agency"],
      agency_plan: ["starter_agency", "growth_agency"],
      agency_seat_role: ["owner", "member"],
      credit_pack: ["starter", "launch"],
      event_type: ["view", "whatsapp_click", "call_click", "enquiry_submit"],
      lead_status: ["new", "contacted", "site_visit", "closed", "lost"],
      listing_type: ["sale", "rent"],
      member_status: ["invited", "active", "removed"],
      notification_type: [
        "new_lead",
        "low_credits",
        "payment_success",
        "agency_invite",
      ],
      property_status: ["draft", "active", "sold", "rented", "inactive"],
      property_type: ["apartment", "villa", "plot", "commercial"],
      purchase_status: ["created", "paid", "failed"],
      rera_status: ["not_provided", "provided_unverified"],
      subscription_status: ["active", "past_due", "cancelled"],
    },
  },
} as const
