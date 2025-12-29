export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          role: 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin'
          unit: 'excel' | 'crew' | null
          total_donation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
          role?: 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin'
          unit?: 'excel' | 'crew' | null
          total_donation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          avatar_url?: string | null
          role?: 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin'
          unit?: 'excel' | 'crew' | null
          total_donation?: number
          created_at?: string
          updated_at?: string
        }
      }
      seasons: {
        Row: {
          id: number
          name: string
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          start_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      organization: {
        Row: {
          id: number
          unit: 'excel' | 'crew'
          profile_id: string | null
          name: string
          role: string
          parent_id: number | null
          order_index: number
          image_url: string | null
          social_links: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          unit: 'excel' | 'crew'
          profile_id?: string | null
          name: string
          role: string
          parent_id?: number | null
          order_index?: number
          image_url?: string | null
          social_links?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          unit?: 'excel' | 'crew'
          profile_id?: string | null
          name?: string
          role?: string
          parent_id?: number | null
          order_index?: number
          image_url?: string | null
          social_links?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: number
          donor_id: string | null
          donor_name: string
          amount: number
          season_id: number
          unit: 'excel' | 'crew' | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          donor_id?: string | null
          donor_name: string
          amount: number
          season_id: number
          unit?: 'excel' | 'crew' | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          donor_id?: string | null
          donor_name?: string
          amount?: number
          season_id?: number
          unit?: 'excel' | 'crew' | null
          message?: string | null
          created_at?: string
        }
      }
      vip_rewards: {
        Row: {
          id: number
          profile_id: string
          season_id: number
          rank: number
          personal_message: string | null
          dedication_video_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          profile_id: string
          season_id: number
          rank: number
          personal_message?: string | null
          dedication_video_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          profile_id?: string
          season_id?: number
          rank?: number
          personal_message?: string | null
          dedication_video_url?: string | null
          created_at?: string
        }
      }
      vip_images: {
        Row: {
          id: number
          reward_id: number
          image_url: string
          title: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: number
          reward_id: number
          image_url: string
          title?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: number
          reward_id?: number
          image_url?: string
          title?: string | null
          order_index?: number
          created_at?: string
        }
      }
      signatures: {
        Row: {
          id: number
          title: string
          description: string | null
          unit: 'excel' | 'crew'
          member_name: string
          media_type: 'video' | 'image' | 'gif'
          media_url: string
          thumbnail_url: string | null
          tags: string[] | null
          view_count: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          unit: 'excel' | 'crew'
          member_name: string
          media_type: 'video' | 'image' | 'gif'
          media_url: string
          thumbnail_url?: string | null
          tags?: string[] | null
          view_count?: number
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          unit?: 'excel' | 'crew'
          member_name?: string
          media_type?: 'video' | 'image' | 'gif'
          media_url?: string
          thumbnail_url?: string | null
          tags?: string[] | null
          view_count?: number
          is_featured?: boolean
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: number
          title: string
          description: string | null
          unit: 'excel' | 'crew' | null
          event_type: 'broadcast' | 'collab' | 'event' | 'notice' | '休'
          start_datetime: string
          end_datetime: string | null
          location: string | null
          is_all_day: boolean
          color: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          unit?: 'excel' | 'crew' | null
          event_type: 'broadcast' | 'collab' | 'event' | 'notice' | '休'
          start_datetime: string
          end_datetime?: string | null
          location?: string | null
          is_all_day?: boolean
          color?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          unit?: 'excel' | 'crew' | null
          event_type?: 'broadcast' | 'collab' | 'event' | 'notice' | '休'
          start_datetime?: string
          end_datetime?: string | null
          location?: string | null
          is_all_day?: boolean
          color?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      timeline_events: {
        Row: {
          id: number
          event_date: string
          title: string
          description: string | null
          image_url: string | null
          category: string | null
          season_id: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: number
          event_date: string
          title: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          season_id?: number | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: number
          event_date?: string
          title?: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          season_id?: number | null
          order_index?: number
          created_at?: string
        }
      }
      notices: {
        Row: {
          id: number
          title: string
          content: string
          category: 'official' | 'excel' | 'crew'
          thumbnail_url: string | null
          is_pinned: boolean
          view_count: number
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          category: 'official' | 'excel' | 'crew'
          thumbnail_url?: string | null
          is_pinned?: boolean
          view_count?: number
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          category?: 'official' | 'excel' | 'crew'
          thumbnail_url?: string | null
          is_pinned?: boolean
          view_count?: number
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          board_type: 'free' | 'vip'
          title: string
          content: string
          author_id: string
          view_count: number
          like_count: number
          comment_count: number
          is_anonymous: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          board_type: 'free' | 'vip'
          title: string
          content: string
          author_id: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_anonymous?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          board_type?: 'free' | 'vip'
          title?: string
          content?: string
          author_id?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_anonymous?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          author_id: string
          content: string
          parent_id: number | null
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          author_id: string
          content: string
          parent_id?: number | null
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          author_id?: string
          content?: string
          parent_id?: number | null
          is_deleted?: boolean
          created_at?: string
        }
      }
      media_content: {
        Row: {
          id: number
          content_type: 'shorts' | 'vod'
          title: string
          description: string | null
          thumbnail_url: string | null
          video_url: string
          unit: 'excel' | 'crew' | null
          duration: number | null
          view_count: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: number
          content_type: 'shorts' | 'vod'
          title: string
          description?: string | null
          thumbnail_url?: string | null
          video_url: string
          unit?: 'excel' | 'crew' | null
          duration?: number | null
          view_count?: number
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          content_type?: 'shorts' | 'vod'
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          video_url?: string
          unit?: 'excel' | 'crew' | null
          duration?: number | null
          view_count?: number
          is_featured?: boolean
          created_at?: string
        }
      }
      live_status: {
        Row: {
          id: number
          member_id: number
          platform: 'chzzk' | 'twitch' | 'youtube' | 'soop'
          stream_url: string
          thumbnail_url: string | null
          is_live: boolean
          viewer_count: number
          last_checked: string
        }
        Insert: {
          id?: number
          member_id: number
          platform: 'chzzk' | 'twitch' | 'youtube' | 'soop'
          stream_url: string
          thumbnail_url?: string | null
          is_live?: boolean
          viewer_count?: number
          last_checked?: string
        }
        Update: {
          id?: number
          member_id?: number
          platform?: 'chzzk' | 'twitch' | 'youtube' | 'soop'
          stream_url?: string
          thumbnail_url?: string | null
          is_live?: boolean
          viewer_count?: number
          last_checked?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type Season = Tables<'seasons'>
export type Organization = Tables<'organization'>
export type Donation = Tables<'donations'>
export type VipReward = Tables<'vip_rewards'>
export type VipImage = Tables<'vip_images'>
export type Signature = Tables<'signatures'>
export type Schedule = Tables<'schedules'>
export type TimelineEvent = Tables<'timeline_events'>
export type Notice = Tables<'notices'>
export type Post = Tables<'posts'>
export type Comment = Tables<'comments'>
export type MediaContent = Tables<'media_content'>
export type LiveStatus = Tables<'live_status'>

// Unit type
export type Unit = 'excel' | 'crew'

// Role type
export type Role = 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin'
