import { createServerClient, parse, serialize } from "@supabase/ssr";
import { supabasePool } from "./supabase-pool.server";
import type { Database } from "./types";

/**
 * 创建Supabase服务端客户端
 */
export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
      auth: {
        flowType: "pkce",
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return { supabase, headers };
};

/**
 * 获取无认证的Supabase客户端（用于静态数据查询）
 */
export const getSupabaseClient = () => {
  return supabasePool.getClient();
};

/**
 * 检查Supabase环境变量配置
 */
export const validateSupabaseConfig = () => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(`
Missing required Supabase environment variables:
- SUPABASE_URL: ${SUPABASE_URL ? '✓' : '✗ Missing'}
- SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓' : '✗ Missing'}

Please create a .env file in your project root with:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
    `);
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY };
};

/**
 * 连接健康检查
 */
export const checkSupabaseHealth = async (): Promise<{
  isHealthy: boolean;
  latency: number;
  config: any;
}> => {
  const start = Date.now();
  
  try {
    const config = validateSupabaseConfig();
    const client = getSupabaseClient();
    
    // 执行简单查询测试连接
    await client.from('messages').select('id').limit(1);
    
    const latency = Date.now() - start;
    
    return {
      isHealthy: true,
      latency,
      config: {
        url: config.SUPABASE_URL.substring(0, 30) + '...',
        hasKey: !!config.SUPABASE_ANON_KEY,
      },
    };
  } catch (error) {
    console.error('[Supabase Health Check] Failed:', error);
    return {
      isHealthy: false,
      latency: Date.now() - start,
      config: supabasePool.getStatus(),
    };
  }
}; 