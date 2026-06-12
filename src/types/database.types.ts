// சுபாபேஸ் தரவுத்தள வகைகள் (Supabase Database Types - Placeholder)
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
      issues: {
        Row: {
          id: string;
          title: string;
          created_at: string;
        };
      };
    };
  };
}
