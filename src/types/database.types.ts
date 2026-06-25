// சுபாபேஸ் தரவுத்தள வகைகள் (Supabase Database Types)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'reader' | 'subscriber' | 'editor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'reader' | 'subscriber' | 'editor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'reader' | 'subscriber' | 'editor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      issues: {
        Row: {
          id: string;
          title: string;
          slug: string;
          volume_number: number;
          issue_number: number;
          cover_image_url: string | null;
          description: string | null;
          published_at: string | null;
          status: 'draft' | 'published' | 'archived';
          is_free: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          pdf_url: string | null;
          pdf_generated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          volume_number: number;
          issue_number: number;
          cover_image_url?: string | null;
          description?: string | null;
          published_at?: string | null;
          status?: 'draft' | 'published' | 'archived';
          is_free?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          volume_number?: number;
          issue_number?: number;
          cover_image_url?: string | null;
          description?: string | null;
          published_at?: string | null;
          status?: 'draft' | 'published' | 'archived';
          is_free?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "issues_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      issue_content: {
        Row: {
          id: string;
          issue_id: string;
          title: string;
          body: any;
          content_type: 'article' | 'poem' | 'editorial' | 'story' | 'interview';
          author_name: string | null;
          position: number;
          is_preview: boolean;
          word_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          title: string;
          body: any;
          content_type?: 'article' | 'poem' | 'editorial' | 'story' | 'interview';
          author_name?: string | null;
          position?: number;
          is_preview?: boolean;
          word_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          title?: string;
          body?: any;
          content_type?: 'article' | 'poem' | 'editorial' | 'story' | 'interview';
          author_name?: string | null;
          position?: number;
          is_preview?: boolean;
          word_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "issue_content_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: 'active' | 'cancelled' | 'expired' | 'trialing';
          plan_type: 'monthly' | 'annual';
          razorpay_subscription_id: string | null;
          razorpay_customer_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: 'active' | 'cancelled' | 'expired' | 'trialing';
          plan_type: 'monthly' | 'annual';
          razorpay_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'active' | 'cancelled' | 'expired' | 'trialing';
          plan_type?: 'monthly' | 'annual';
          razorpay_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'captured' | 'failed' | 'refunded';
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount: number;
          currency?: string;
          status: 'pending' | 'captured' | 'failed' | 'refunded';
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'captured' | 'failed' | 'refunded';
          metadata?: any | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          issue_content_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          issue_content_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          issue_content_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_issue_content_id_fkey";
            columns: ["issue_content_id"];
            referencedRelation: "issue_content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      pdf_downloads: {
        Row: {
          id: string;
          user_id: string;
          issue_id: string;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          issue_id: string;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          issue_id?: string;
          downloaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pdf_downloads_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pdf_downloads_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_subscribed: {
        Args: {
          u_id: string;
        };
        Returns: boolean;
      };
      get_user_role: {
        Args: {
          u_id: string;
        };
        Returns: 'reader' | 'subscriber' | 'editor' | 'admin';
      };
    };
    Enums: {
      user_role: 'reader' | 'subscriber' | 'editor' | 'admin';
      subscription_status: 'active' | 'cancelled' | 'expired' | 'trialing';
      payment_status: 'pending' | 'captured' | 'failed' | 'refunded';
      issue_status: 'draft' | 'published' | 'archived';
      content_type: 'article' | 'poem' | 'editorial' | 'story' | 'interview';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
