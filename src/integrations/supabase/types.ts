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
      categorias: {
        Row: {
          cor_categoria: string | null
          created_at: string
          id: string
          is_default: boolean | null
          nome_categoria: string
          tipo_categoria: string
          user_id: string
        }
        Insert: {
          cor_categoria?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          nome_categoria: string
          tipo_categoria: string
          user_id: string
        }
        Update: {
          cor_categoria?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          nome_categoria?: string
          tipo_categoria?: string
          user_id?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          ativa: boolean | null
          created_at: string
          id: string
          nome_conta: string
          saldo_atual: number
          saldo_inicial: number
          tipo_conta: string
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          id?: string
          nome_conta: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo_conta: string
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          id?: string
          nome_conta?: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo_conta?: string
          user_id?: string
        }
        Relationships: []
      }
      metas_financeiras: {
        Row: {
          ativa: boolean | null
          created_at: string
          data_limite: string | null
          id: string
          nome_meta: string
          user_id: string
          valor_atual: number
          valor_meta: number
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          data_limite?: string | null
          id?: string
          nome_meta: string
          user_id: string
          valor_atual?: number
          valor_meta: number
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          data_limite?: string | null
          id?: string
          nome_meta?: string
          user_id?: string
          valor_atual?: number
          valor_meta?: number
        }
        Relationships: []
      }
      perfis_usuario: {
        Row: {
          created_at: string
          id: string
          nome_completo: string | null
          nome_empresa: string | null
          tipo_perfil: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_completo?: string | null
          nome_empresa?: string | null
          tipo_perfil: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_completo?: string | null
          nome_empresa?: string | null
          tipo_perfil?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria_id: string
          conta_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          frequencia_recorrencia: string | null
          id: string
          observacao: string | null
          recorrente: boolean | null
          status: string | null
          tipo_transacao: string
          transacao_pai_id: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria_id: string
          conta_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          frequencia_recorrencia?: string | null
          id?: string
          observacao?: string | null
          recorrente?: boolean | null
          status?: string | null
          tipo_transacao: string
          transacao_pai_id?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria_id?: string
          conta_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          frequencia_recorrencia?: string | null
          id?: string
          observacao?: string | null
          recorrente?: boolean | null
          status?: string | null
          tipo_transacao?: string
          transacao_pai_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_transacoes_categoria"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transacoes_conta"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_transacao_pai_id_fkey"
            columns: ["transacao_pai_id"]
            isOneToOne: false
            referencedRelation: "transacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencias: {
        Row: {
          conta_destino_id: string
          conta_origem_id: string
          created_at: string
          data_transferencia: string | null
          descricao: string | null
          id: string
          user_id: string
          valor: number
        }
        Insert: {
          conta_destino_id: string
          conta_origem_id: string
          created_at?: string
          data_transferencia?: string | null
          descricao?: string | null
          id?: string
          user_id: string
          valor: number
        }
        Update: {
          conta_destino_id?: string
          conta_origem_id?: string
          created_at?: string
          data_transferencia?: string | null
          descricao?: string | null
          id?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_transferencias_conta_destino"
            columns: ["conta_destino_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transferencias_conta_origem"
            columns: ["conta_origem_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_conta_destino_id_fkey"
            columns: ["conta_destino_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_conta_origem_id_fkey"
            columns: ["conta_origem_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_categorias_padrao: {
        Args: { p_tipo_perfil: string; p_user_id: string }
        Returns: undefined
      }
      criar_conta_padrao: {
        Args: { p_tipo_perfil: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
