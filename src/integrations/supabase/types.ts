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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          organizer: string
          registration_link: string | null
          time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          organizer: string
          registration_link?: string | null
          time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          organizer?: string
          registration_link?: string | null
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          document_number: string | null
          document_type: string | null
          document_url: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          bio: string | null
          created_at: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          resume_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          bio?: string | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          bio?: string | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      contact_interests: {
        Row: {
          id: string
          requester_id: string
          professional_profile_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          requester_id: string
          professional_profile_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          requester_id?: string
          professional_profile_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string
          cover_image_url: string | null
          author_id: string
          status: Database["public"]["Enums"]["blog_status"]
          published_at: string | null
          tags: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content: string
          cover_image_url?: string | null
          author_id: string
          status?: Database["public"]["Enums"]["blog_status"]
          published_at?: string | null
          tags?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          cover_image_url?: string | null
          author_id?: string
          status?: Database["public"]["Enums"]["blog_status"]
          published_at?: string | null
          tags?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_skills: {
        Row: {
          created_at: string | null
          id: string
          professional_id: string
          skill_level: Database["public"]["Enums"]["skill_level"]
          skill_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          professional_id: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          skill_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          professional_id?: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          skill_name?: string
        }
        Relationships: []
      }
      professional_experience: {
        Row: {
          company_name: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          position: string
          professional_id: string
          start_date: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position: string
          professional_id: string
          start_date: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position?: string
          professional_id?: string
          start_date?: string
        }
        Relationships: []
      }
      professional_education: {
        Row: {
          created_at: string | null
          degree: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          institution: string
          professional_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          professional_id: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          professional_id?: string
          start_date?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          company_name: string
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: Database["public"]["Enums"]["company_member_role"]
          created_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: Database["public"]["Enums"]["company_member_role"]
          created_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          created_at?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          id: string
          company_id: string
          invited_email: string
          invited_by: string
          role: Database["public"]["Enums"]["company_member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          created_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          invited_email: string
          invited_by: string
          role?: Database["public"]["Enums"]["company_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          created_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          invited_email?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          created_at?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string | null
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          expires_at: string | null
          id: string
          location: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string | null
          work_mode: Database["public"]["Enums"]["work_mode"] | null
          responsibilities: string | null
          skills_tools: string | null
          requirements: string | null
          benefits: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description: string
          employment_type?: Database["public"]["Enums"]["employment_type"] | null
          expires_at?: string | null
          id?: string
          location?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
          responsibilities?: string | null
          skills_tools?: string | null
          requirements?: string | null
          benefits?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"] | null
          expires_at?: string | null
          id?: string
          location?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
          responsibilities?: string | null
          skills_tools?: string | null
          requirements?: string | null
          benefits?: string | null
        }
        Relationships: []
      }
      job_required_skills: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean
          job_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean
          job_id: string
          skill_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean
          job_id?: string
          skill_name?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          professional_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          professional_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      account_type: "professional" | "company"
      app_role: "admin" | "user"
      company_member_role: "owner" | "admin" | "member"
      invitation_status: "pending" | "accepted" | "declined"
      blog_status: "draft" | "published"
      application_status: "pending" | "reviewed" | "interview" | "accepted" | "rejected"
      availability_status: "available" | "open_to_offers" | "not_looking"
      company_size: "startup" | "small" | "medium" | "large" | "enterprise"
      employment_type: "full_time" | "part_time" | "contract" | "freelance"
      job_status: "draft" | "active" | "closed"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
      work_mode: "remote" | "hybrid" | "onsite"
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
      account_type: ["professional", "company"],
      app_role: ["admin", "user"],
      company_member_role: ["owner", "admin", "member"],
      invitation_status: ["pending", "accepted", "declined"],
      blog_status: ["draft", "published"],
      application_status: ["pending", "reviewed", "interview", "accepted", "rejected"],
      availability_status: ["available", "open_to_offers", "not_looking"],
      company_size: ["startup", "small", "medium", "large", "enterprise"],
      employment_type: ["full_time", "part_time", "contract", "freelance"],
      job_status: ["draft", "active", "closed"],
      skill_level: ["beginner", "intermediate", "advanced", "expert"],
      work_mode: ["remote", "hybrid", "onsite"],
    },
  },
} as const
