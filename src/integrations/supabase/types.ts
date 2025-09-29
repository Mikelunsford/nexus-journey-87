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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          request_id: string | null
          row_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          request_id?: string | null
          row_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          request_id?: string | null
          row_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      carrier_appointments: {
        Row: {
          carrier: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          org_id: string
          owner_id: string | null
          reference: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
          window_end: string
          window_start: string
        }
        Insert: {
          carrier: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          org_id: string
          owner_id?: string | null
          reference?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
          window_end: string
          window_start: string
        }
        Update: {
          carrier?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          org_id?: string
          owner_id?: string | null
          reference?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_appointments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          reactions: Json | null
          reply_to_id: string | null
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          metadata: Json | null
          name: string
          org_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          metadata?: Json | null
          name: string
          org_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          metadata?: Json | null
          name?: string
          org_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          email: string | null
          id: string
          is_test: boolean | null
          name: string
          org_id: string
          owner_id: string | null
          phone: string | null
          search_vector: unknown | null
          settings: Json | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          is_test?: boolean | null
          name: string
          org_id: string
          owner_id?: string | null
          phone?: string | null
          search_vector?: unknown | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          is_test?: boolean | null
          name?: string
          org_id?: string
          owner_id?: string | null
          phone?: string | null
          search_vector?: unknown | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          default_bucket: Database["public"]["Enums"]["role_bucket_enum"]
          deleted_at: string | null
          id: string
          name: string
          org_id: string
          parent_id: string | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          default_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          deleted_at?: string | null
          id?: string
          name: string
          org_id: string
          parent_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          default_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          deleted_at?: string | null
          id?: string
          name?: string
          org_id?: string
          parent_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          checksum: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          entity_id: string
          entity_type: string
          id: string
          is_test: boolean | null
          metadata: Json | null
          mime_type: string
          name: string
          org_id: string
          original_name: string
          owner_id: string | null
          search_vector: unknown | null
          size_bytes: number
          storage_path: string
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          url: string
          version: number | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          mime_type: string
          name: string
          org_id: string
          original_name: string
          owner_id?: string | null
          search_vector?: unknown | null
          size_bytes: number
          storage_path: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          url: string
          version?: number | null
        }
        Update: {
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          mime_type?: string
          name?: string
          org_id?: string
          original_name?: string
          owner_id?: string | null
          search_vector?: unknown | null
          size_bytes?: number
          storage_path?: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          url?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_outbox: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          org_id: string
          payload: Json
          retry_count: number | null
          topic: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          org_id: string
          payload: Json
          retry_count?: number | null
          topic: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          org_id?: string
          payload?: Json
          retry_count?: number | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          color: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          owner_id: string | null
          scope: string
          slug: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          color: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          owner_id?: string | null
          scope: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          color?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          owner_id?: string | null
          scope?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "labels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          assigned_by: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          expires_at: string | null
          id: string
          org_id: string
          role_bucket: Database["public"]["Enums"]["role_bucket_enum"]
          team_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          assigned_by: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          id?: string
          org_id: string
          role_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          team_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          assigned_by?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          id?: string
          org_id?: string
          role_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          team_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          bcc_emails: string[] | null
          body: string
          cc_emails: string[] | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          data: Json | null
          deleted_at: string | null
          department_id: string | null
          from_email: string
          id: string
          is_test: boolean | null
          org_id: string
          owner_id: string | null
          project_id: string | null
          search_vector: unknown | null
          sent_at: string | null
          status: string | null
          subject: string
          to_emails: string[]
          type: Database["public"]["Enums"]["message_type_enum"]
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          bcc_emails?: string[] | null
          body: string
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          data?: Json | null
          deleted_at?: string | null
          department_id?: string | null
          from_email: string
          id?: string
          is_test?: boolean | null
          org_id: string
          owner_id?: string | null
          project_id?: string | null
          search_vector?: unknown | null
          sent_at?: string | null
          status?: string | null
          subject: string
          to_emails: string[]
          type?: Database["public"]["Enums"]["message_type_enum"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          bcc_emails?: string[] | null
          body?: string
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          data?: Json | null
          deleted_at?: string | null
          department_id?: string | null
          from_email?: string
          id?: string
          is_test?: boolean | null
          org_id?: string
          owner_id?: string | null
          project_id?: string | null
          search_vector?: unknown | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          to_emails?: string[]
          type?: Database["public"]["Enums"]["message_type_enum"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          metadata: Json | null
          org_id: string
          owner_id: string | null
          read_at: string | null
          status: Database["public"]["Enums"]["notification_status_enum"] | null
          title: string
          type: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          metadata?: Json | null
          org_id: string
          owner_id?: string | null
          read_at?: string | null
          status?:
            | Database["public"]["Enums"]["notification_status_enum"]
            | null
          title: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          org_id?: string
          owner_id?: string | null
          read_at?: string | null
          status?:
            | Database["public"]["Enums"]["notification_status_enum"]
            | null
          title?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          email: string
          id: string
          name: string | null
          org_id: string
          phone: string | null
          search_vector: unknown | null
          settings: Json | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email: string
          id: string
          name?: string | null
          org_id: string
          phone?: string | null
          search_vector?: unknown | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string | null
          org_id?: string
          phone?: string | null
          search_vector?: unknown | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          deleted_at: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_test: boolean | null
          metadata: Json | null
          org_id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["priority_enum"] | null
          progress: number | null
          quote_id: string | null
          search_vector: unknown | null
          status: Database["public"]["Enums"]["project_status_enum"]
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          org_id: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"] | null
          progress?: number | null
          quote_id?: string | null
          search_vector?: unknown | null
          status?: Database["public"]["Enums"]["project_status_enum"]
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          org_id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"] | null
          progress?: number | null
          quote_id?: string | null
          search_vector?: unknown | null
          status?: Database["public"]["Enums"]["project_status_enum"]
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          deleted_at: string | null
          department_id: string | null
          expires_at: string | null
          id: string
          is_test: boolean | null
          line_items: Json | null
          notes: string | null
          org_id: string
          owner_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["quote_status_enum"]
          total: number
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          deleted_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          id?: string
          is_test?: boolean | null
          line_items?: Json | null
          notes?: string | null
          org_id: string
          owner_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["quote_status_enum"]
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          deleted_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          id?: string
          is_test?: boolean | null
          line_items?: Json | null
          notes?: string | null
          org_id?: string
          owner_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["quote_status_enum"]
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          address: string
          carrier: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          delivered_at: string | null
          department_id: string | null
          id: string
          is_test: boolean | null
          items: Json | null
          metadata: Json | null
          org_id: string
          owner_id: string | null
          project_id: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["shipment_status_enum"]
          tracking_number: string | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          address: string
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          department_id?: string | null
          id?: string
          is_test?: boolean | null
          items?: Json | null
          metadata?: Json | null
          org_id: string
          owner_id?: string | null
          project_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipment_status_enum"]
          tracking_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          address?: string
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          department_id?: string | null
          id?: string
          is_test?: boolean | null
          items?: Json | null
          metadata?: Json | null
          org_id?: string
          owner_id?: string | null
          project_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipment_status_enum"]
          tracking_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string
          description: string | null
          id: string
          lead_id: string | null
          name: string
          org_id: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name: string
          org_id: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          org_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          description: string
          entry_date: string
          hourly_rate: number | null
          hours: number
          id: string
          metadata: Json | null
          org_id: string
          owner_id: string | null
          project_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          version: number | null
          work_order_id: string | null
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description: string
          entry_date?: string
          hourly_rate?: number | null
          hours: number
          id?: string
          metadata?: Json | null
          org_id: string
          owner_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          version?: number | null
          work_order_id?: string | null
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string
          entry_date?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          metadata?: Json | null
          org_id?: string
          owner_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          version?: number | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          created_at: string
          department_id: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          name: string | null
          org_id: string
          role_bucket: Database["public"]["Enums"]["role_bucket_enum"]
          status: string
          token: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          name?: string | null
          org_id: string
          role_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          status?: string
          token: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          name?: string | null
          org_id?: string
          role_bucket?: Database["public"]["Enums"]["role_bucket_enum"]
          status?: string
          token?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_test: boolean | null
          metadata: Json | null
          org_id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["priority_enum"] | null
          project_id: string
          quantity: number | null
          status: Database["public"]["Enums"]["work_order_status_enum"]
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          org_id: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"] | null
          project_id: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["work_order_status_enum"]
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_test?: boolean | null
          metadata?: Json | null
          org_id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"] | null
          project_id?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["work_order_status_enum"]
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_customer_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_bucket: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["role_bucket_enum"]
      }
      is_customer_owner: {
        Args: { customer_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      approval_status_enum: "pending" | "approved" | "rejected"
      message_type_enum: "email" | "note" | "system"
      notification_status_enum: "unread" | "read"
      priority_enum: "low" | "medium" | "high" | "critical"
      project_status_enum:
        | "draft"
        | "quoted"
        | "approved"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "archived"
      quote_status_enum: "draft" | "sent" | "approved" | "rejected"
      role_bucket_enum: "admin" | "management" | "operational" | "external"
      shipment_status_enum: "created" | "in_transit" | "delivered"
      work_order_status_enum: "queued" | "wip" | "paused" | "done"
      workflow_step_status_enum:
        | "pending"
        | "in_progress"
        | "completed"
        | "skipped"
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
      approval_status_enum: ["pending", "approved", "rejected"],
      message_type_enum: ["email", "note", "system"],
      notification_status_enum: ["unread", "read"],
      priority_enum: ["low", "medium", "high", "critical"],
      project_status_enum: [
        "draft",
        "quoted",
        "approved",
        "in_progress",
        "on_hold",
        "completed",
        "archived",
      ],
      quote_status_enum: ["draft", "sent", "approved", "rejected"],
      role_bucket_enum: ["admin", "management", "operational", "external"],
      shipment_status_enum: ["created", "in_transit", "delivered"],
      work_order_status_enum: ["queued", "wip", "paused", "done"],
      workflow_step_status_enum: [
        "pending",
        "in_progress",
        "completed",
        "skipped",
      ],
    },
  },
} as const
