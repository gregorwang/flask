import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import { createClerkClient } from "@clerk/remix/api.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import styles from "~/styles/index-route.css?url";
import Header from "~/components/ui/Header";
import Faq from "~/components/ui/question";
import Footer from "~/components/ui/foot";
import { ClientOnly } from "~/components/common/ClientOnly";
import { Hero } from "~/components/ui/demo";
import { DefaultRoutePreloader } from "~/components/common/RoutePreloader";
import { calculatePagination } from "~/lib/utils/timeUtils";
import { serverCache, CacheKeys } from "~/lib/server-cache";
import { supabasePool } from "~/lib/supabase-pool.server";

const MESSAGES_PER_PAGE = 10;

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preload", as: "image", href: "/favicon.ico" },
  { rel: "dns-prefetch", href: "https://api.clerk.dev" },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  // 关键路由预加载 - 提升返回首页速度
  { rel: "prefetch", href: "/chat" },
  { rel: "prefetch", href: "/game" },
  { rel: "prefetch", href: "/music" },

  // 预连接关键资源
  { rel: "preconnect", href: "https://api.clerk.dev" },
  { rel: "preconnect", href: "https://supabase.co" },
];

export const meta: MetaFunction = () => {
  return [
        { title: "汪家俊的个人网站" },
        { name: "description", content: "展示现代Web技术与AI结合的个人网站，使用Remix、React、TypeScript构建" },
        { property: "og:title", content: "汪家俊的个人网站" },
        { property: "og:description", content: "一个由AI技术驱动的现代化个人网站" },
        { name: "twitter:card", content: "summary_large_image" },
    ];
};

// Loader function - 使用连接池和服务端缓存，极大提升性能
export const loader = async (args: LoaderFunctionArgs) => {
    console.log('[IndexLoader] Starting...');
    const startTime = Date.now();
    
    const { request } = args;
    const response = new Response();
    const { userId } = await getAuth(args);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    
    // 使用工具函数计算分页 (纯算法逻辑已提取)
    const pagination = calculatePagination(0, MESSAGES_PER_PAGE, page);
    const { rangeStart, rangeEnd } = pagination;

    try {
        // 1. 首先尝试从缓存获取消息数据 - 增加缓存时间提升性能
        const messagesCacheKey = CacheKeys.indexMessages(page);
        const cachedMessages = await serverCache.getOrSet(
            messagesCacheKey,
            async () => {
                console.log('[IndexLoader] Cache miss for messages, fetching from DB...');
                // 使用优化的连接池客户端
                const { supabase } = createSupabaseServerClient({ request, response });
                
                const result = await supabase
                    .from('messages')
                    .select('*', { count: 'exact' })
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .range(rangeStart, rangeEnd);
                
                if (result.error) {
                    console.error('[IndexLoader] Database error:', result.error);
                    // 返回默认数据而不是抛出错误
                    return {
                        messages: [],
                        count: 0
                    };
                }
                
                return {
                    messages: result.data || [],
                    count: result.count || 0
                };
            },
            5 * 60 * 1000 // 增加到5分钟缓存，提升性能
        );

        // 简化权限逻辑 - 移除时间限制，只保留登录检查
        const canPost = !!userId; // 只要登录就可以发表留言
        let currentUser = null;

        // 2. 用户信息缓存（低优先级，不阻塞响应）
        if (userId) {
            const userInfoCacheKey = CacheKeys.userInfo(userId);
            currentUser = serverCache.get(userInfoCacheKey);
            
            // 如果缓存中没有用户信息，异步获取（不阻塞响应）
            if (!currentUser && process.env.NODE_ENV !== 'development') {
                setTimeout(async () => {
                    try {
                        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
                        const user = await clerk.users.getUser(userId);
                        // 缓存用户信息2小时
                        serverCache.set(userInfoCacheKey, user, 2 * 60 * 60 * 1000);
                    } catch (error) {
                        console.error("[IndexLoader] Background user fetch error:", error);
                    }
                }, 0);
            }
        }
        
        // 使用工具函数重新计算正确的分页信息 - 添加安全检查
        const messagesData = cachedMessages || { messages: [], count: 0 };
        const finalPagination = calculatePagination(messagesData.count, MESSAGES_PER_PAGE, page);
        const defaultAvatar = "/favicon.ico"; 

        // 记录性能指标
        const loadTime = Date.now() - startTime;
        console.log(`[IndexLoader] Completed in ${loadTime}ms, cache stats:`, serverCache.getStats());

        // 更激进的缓存策略 - 进一步提升性能
        const cacheControl = userId 
            ? "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" // 登录用户：5分钟本地，15分钟CDN
            : "public, max-age=600, s-maxage=1800, stale-while-revalidate=7200"; // 未登录用户：10分钟本地，30分钟CDN

        return json({ 
            messages: messagesData.messages, 
            totalPages: finalPagination.totalPages, 
            currentPage: page, 
            userId, 
            canPost, 
            defaultAvatar,
            currentUser,
            // 性能调试信息（开发环境）
            ...(process.env.NODE_ENV === 'development' && {
                debug: {
                    loadTime,
                    cacheStats: serverCache.getStats(),
                    poolStatus: supabasePool.getPoolStatus(),
                }
            })
        }, { 
            headers: {
                "Cache-Control": cacheControl,
                "Vary": "Cookie, Authorization",
                // 添加ETag支持精确缓存
                "ETag": `"index-${messagesData.count}-${page}-${userId ? 'auth' : 'anon'}-v3"`,
                // 性能优化headers
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                // 预加载关键资源
                "Link": "</chat>; rel=prefetch, </game>; rel=prefetch, </music>; rel=prefetch",
                // 性能指标
                "Server-Timing": `db;dur=${loadTime};desc="Database Load Time"`,
            }
        });

    } catch (error) {
        console.error("[IndexLoader] Unexpected error:", error);
        
        // 尝试从缓存获取备用数据
        const fallbackData = serverCache.get(CacheKeys.indexMessages(page));
        
        if (fallbackData && typeof fallbackData === 'object' && 'count' in fallbackData && 'messages' in fallbackData) {
            console.log('[IndexLoader] Using fallback cache data');
            const finalPagination = calculatePagination(typeof fallbackData.count === 'number' ? fallbackData.count : 0, MESSAGES_PER_PAGE, page);
            
            return json({ 
                messages: fallbackData.messages || [],
                totalPages: finalPagination.totalPages, 
                currentPage: page, 
                userId, 
                canPost: !!userId, 
                defaultAvatar: "/favicon.ico",
                currentUser: null,
                warning: "数据可能不是最新的，请稍后刷新"
            }, { 
                headers: {
                    "Cache-Control": "public, max-age=60, s-maxage=120",
                    "Vary": "Cookie, Authorization",
                }
            });
        }
        
        // 极端错误情况的优雅降级
        return json({ 
            messages: [], 
            totalPages: 1, 
            currentPage: 1, 
            userId, 
            canPost: !!userId, 
            defaultAvatar: "/favicon.ico",
            currentUser: null,
            error: "服务暂时不可用，请稍后重试"
        }, { 
            status: 200, // 仍然返回200，避免错误页面
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Vary": "Cookie, Authorization",
            }
        });
    }
};

export const action = async (args: ActionFunctionArgs) => {
    const { request } = args;
    const { userId } = await getAuth(args);
    const response = new Response();

    if (!userId) {
        return json({ error: "You must be logged in to post a message." }, { status: 401, headers: response.headers });
    }

    const { supabase, headers } = createSupabaseServerClient({ request, response });
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content || content.trim().length === 0) {
        return json({ error: "Message content cannot be empty." }, { status: 400, headers: response.headers });
    }
    
    // Get user info from Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    let username = `User ${userId.substring(0, 8)}`;
    
    try {
        const user = await clerk.users.getUser(userId);
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const clerkUsername = user.username;
        
        if (firstName || lastName) {
            username = `${firstName} ${lastName}`.trim();
        } else if (clerkUsername) {
            username = clerkUsername;
        } else if (user.emailAddresses && user.emailAddresses.length > 0) {
            username = user.emailAddresses[0].emailAddress.split('@')[0];
        }
    } catch (error) {
        console.error("Error fetching user from Clerk:", error);
    }

    // 移除时间限制检查 - 只保留审核机制
    // 用户可以随时发表留言，留言将进入审核队列

    const { error: insertError } = await supabase
        .from("messages")
        .insert({ 
            user_id: userId.toString(), 
            username: username, 
            content: content.trim(), 
            status: 'pending' 
        });

    if (insertError) {
        console.error("Error inserting message:", insertError);
        return json({ error: "Failed to submit message." }, { status: 500, headers: response.headers });
    }

    headers.forEach((value, key) => {
      response.headers.append(key, value);
    });

    return json({ success: "留言已提交，等待管理员审核！" }, { headers: response.headers });
};

export default function Index() {
  const { messages, userId, canPost, defaultAvatar } = useLoaderData<typeof loader>();
  
  return (
    <div className="font-sans">
      <DefaultRoutePreloader />
      <Header />
      <Hero />
      <main>
        {/* Message Board Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">留言板</h2>
                    <p className="text-xl text-gray-600">
                        欢迎留下您的想法和建议
                    </p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <ClientOnly>
                        {() => {
                            const LazyHomeMessages = React.lazy(() => 
                                import("~/components/messages/HomeMessagesClient.client")
                            );
                            return (
                                <React.Suspense fallback={
                                    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8 max-w-4xl mx-auto">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-32 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                }>
                                    <LazyHomeMessages 
                                        messages={messages}
                                        userId={userId}
                                        canPost={canPost}
                                        defaultAvatar={defaultAvatar}
                                    />
                                </React.Suspense>
                            );
                        }}
                    </ClientOnly>
                </div>
            </div>
        </section>
      </main>
      <Faq />
      <Footer />
    </div>
  );
}