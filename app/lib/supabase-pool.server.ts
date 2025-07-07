import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 简化的Supabase连接池管理器
 */
class SupabasePool {
  private static instance: SupabasePool;
  private client: SupabaseClient<Database> | null = null;

  private constructor() {}

  static getInstance(): SupabasePool {
    if (!SupabasePool.instance) {
      SupabasePool.instance = new SupabasePool();
    }
    return SupabasePool.instance;
  }

  /**
   * 获取Supabase客户端 - 单例模式，复用连接
   */
  getClient(): SupabaseClient<Database> {
    if (!this.client) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error('Missing required Supabase environment variables');
      }

      this.client = createClient<Database>(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          realtime: {
            params: {
              eventsPerSecond: -1,
            },
          },
        }
      );

      console.log('[SupabasePool] Created new client connection');
    }

    return this.client;
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      hasConnection: !!this.client,
      url: process.env.SUPABASE_URL?.substring(0, 30) + '...',
    };
  }
}

// 导出单例实例
export const supabasePool = SupabasePool.getInstance(); 