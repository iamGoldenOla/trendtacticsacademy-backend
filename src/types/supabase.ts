export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string | null
          email: string | null
          role: 'student' | 'instructor' | 'admin' | null
          avatar: string | null
          phone: string | null
          dashboard_preferences: Json | null
          social_links: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string | null
          email?: string | null
          role?: 'student' | 'instructor' | 'admin' | null
          avatar?: string | null
          phone?: string | null
          dashboard_preferences?: Json | null
          social_links?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          email?: string | null
          role?: 'student' | 'instructor' | 'admin' | null
          avatar?: string | null
          phone?: string | null
          dashboard_preferences?: Json | null
          social_links?: Json | null
        }
      }
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          thumbnail: string | null
          price: number | null
          duration: string | null
          level: 'beginner' | 'intermediate' | 'advanced' | null
          category: string | null
          rating: number | null
          topics: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          thumbnail?: string | null
          price?: number | null
          duration?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          category?: string | null
          rating?: number | null
          topics?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          thumbnail?: string | null
          price?: number | null
          duration?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          category?: string | null
          rating?: number | null
          topics?: string[] | null
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string | null
          title: string
          description: string | null
          order_index: number | null
          is_published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          course_id?: string | null
          title: string
          description?: string | null
          order_index?: number | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string | null
          title?: string
          description?: string | null
          order_index?: number | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string | null
          title: string
          description: string | null
          content: string | null
          video_url: string | null
          order_index: number | null
          is_published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          module_id?: string | null
          title: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          order_index?: number | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          module_id?: string | null
          title?: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          order_index?: number | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      lesson_progress: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          lesson_id: string | null
          completed: boolean | null
          score: number | null
          last_accessed: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          lesson_id?: string | null
          completed?: boolean | null
          score?: number | null
          last_accessed?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          lesson_id?: string | null
          completed?: boolean | null
          score?: number | null
          last_accessed?: string | null
        }
      }
      badges: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          icon: string
          criteria_type: 'course_completion' | 'quiz_score' | 'streak' | 'custom'
          criteria_value: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          icon: string
          criteria_type: 'course_completion' | 'quiz_score' | 'streak' | 'custom'
          criteria_value?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          icon?: string
          criteria_type?: 'course_completion' | 'quiz_score' | 'streak' | 'custom'
          criteria_value?: number | null
        }
      }
      user_badges: {
        Row: {
          id: string
          created_at: string
          user_id: string
          badge_id: string
          awarded_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          badge_id: string
          awarded_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          course_id: string | null
          enrollment_id: string | null
          issued_at: string | null
          certificate_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          course_id?: string | null
          enrollment_id?: string | null
          issued_at?: string | null
          certificate_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          course_id?: string | null
          enrollment_id?: string | null
          issued_at?: string | null
          certificate_url?: string | null
        }
      }
      quiz_questions: {
        Row: {
          id: string
          lesson_id: string | null
          question: string | null
          options: Json | null
          correct_answer: string | null
          explanation: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          question?: string | null
          options?: Json | null
          correct_answer?: string | null
          explanation?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string | null
          question?: string | null
          options?: Json | null
          correct_answer?: string | null
          explanation?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string | null
          lesson_id: string | null
          quiz_data: Json | null
          score: number | null
          passed: boolean | null
          attempted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          quiz_data?: Json | null
          score?: number | null
          passed?: boolean | null
          attempted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          quiz_data?: Json | null
          score?: number | null
          passed?: boolean | null
          attempted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string | null
          course_id: string | null
          progress: number | null
          completed_lessons: string[] | null
          enrollment_date: string | null
          completed_date: string | null
          last_accessed: string | null
          certificate_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          progress?: number | null
          completed_lessons?: string[] | null
          enrollment_date?: string | null
          completed_date?: string | null
          last_accessed?: string | null
          certificate_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          progress?: number | null
          completed_lessons?: string[] | null
          enrollment_date?: string | null
          completed_date?: string | null
          last_accessed?: string | null
          certificate_url?: string | null
          created_at?: string | null
          updated_at?: string | null
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never