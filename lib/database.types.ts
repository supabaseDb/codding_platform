export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      problems: {
        Row: {
          id: number
          title: string
          description: string
          difficulty: string
          code: string
          constraints: string | null
          input_format: string | null
          output_format: string | null
          sample_input: string | null
          sample_output: string | null
          explanation: string | null
          solution_code: string | null
          time_limit: number | null
          memory_limit: number | null
          author_id: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string | null
          editorial: string | null
          tags: string[] | null
          hints: string[] | null
          category: string | null
          time_complexity: string | null
          space_complexity: string | null
        }
        Insert: {
          id?: number
          title: string
          description: string
          difficulty: string
          code: string
          constraints?: string | null
          input_format?: string | null
          output_format?: string | null
          sample_input?: string | null
          sample_output?: string | null
          explanation?: string | null
          solution_code?: string | null
          time_limit?: number | null
          memory_limit?: number | null
          author_id?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string | null
          editorial?: string | null
          tags?: string[] | null
          hints?: string[] | null
          category?: string | null
          time_complexity?: string | null
          space_complexity?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          difficulty?: string
          code?: string
          constraints?: string | null
          input_format?: string | null
          output_format?: string | null
          sample_input?: string | null
          sample_output?: string | null
          explanation?: string | null
          solution_code?: string | null
          time_limit?: number | null
          memory_limit?: number | null
          author_id?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string | null
          editorial?: string | null
          tags?: string[] | null
          hints?: string[] | null
          category?: string | null
          time_complexity?: string | null
          space_complexity?: string | null
        }
      }
      submissions: {
        Row: {
          id: number
          user_id: string
          problem_id: number
          code: string
          language: string
          status: string
          execution_time: number | null
          memory_used: number | null
          contest_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          problem_id: number
          code: string
          language: string
          status: string
          execution_time?: number | null
          memory_used?: number | null
          contest_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          problem_id?: number
          code?: string
          language?: string
          status?: string
          execution_time?: number | null
          memory_used?: number | null
          contest_id?: number | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          updated_at: string | null
          institution: string | null
          country: string | null
          rating: number | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          updated_at?: string | null
          institution?: string | null
          country?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          updated_at?: string | null
          institution?: string | null
          country?: string | null
          rating?: number | null
        }
      }
      test_cases: {
        Row: {
          id: number
          problem_id: number
          input: string
          expected_output: string
          is_sample: boolean | null
          is_hidden: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          problem_id: number
          input: string
          expected_output: string
          is_sample?: boolean | null
          is_hidden?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          problem_id?: number
          input?: string
          expected_output?: string
          is_sample?: boolean | null
          is_hidden?: boolean | null
          created_at?: string | null
        }
      }
      user_statistics: {
        Row: {
          user_id: string
          problems_solved: number | null
          total_submissions: number | null
          accepted_submissions: number | null
          wrong_submissions: number | null
          compilation_errors: number | null
          runtime_errors: number | null
          time_limit_exceeded: number | null
          easy_solved: number | null
          medium_solved: number | null
          hard_solved: number | null
          last_updated: string | null
        }
        Insert: {
          user_id: string
          problems_solved?: number | null
          total_submissions?: number | null
          accepted_submissions?: number | null
          wrong_submissions?: number | null
          compilation_errors?: number | null
          runtime_errors?: number | null
          time_limit_exceeded?: number | null
          easy_solved?: number | null
          medium_solved?: number | null
          hard_solved?: number | null
          last_updated?: string | null
        }
        Update: {
          user_id?: string
          problems_solved?: number | null
          total_submissions?: number | null
          accepted_submissions?: number | null
          wrong_submissions?: number | null
          compilation_errors?: number | null
          runtime_errors?: number | null
          time_limit_exceeded?: number | null
          easy_solved?: number | null
          medium_solved?: number | null
          hard_solved?: number | null
          last_updated?: string | null
        }
      }
    }
  }
}
