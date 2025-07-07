import { UserButton } from '@clerk/remix'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args)
  
  // If there is no userId, redirect to sign-in
  if (!userId) {
    return redirect('/sign-in')
  }
  
  // Return the user data if authenticated
  return json({ userId }, {
    headers: {
      "Cache-Control": "private, max-age=300, stale-while-revalidate=600", // 5分钟私有缓存，用户认证状态
    }
  })
}

export default function Protected() {
  const { userId } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800">受保护的页面</h1>
              <UserButton />
            </div>
            
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-2">🎉 认证成功!</h2>
                <p className="text-green-700">
                  您已成功登录并访问了受保护的页面。这个页面只有已认证的用户才能看到。
                </p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">用户信息</h3>
                <p className="text-blue-700">
                  <strong>用户ID:</strong> {userId}
                </p>
                <p className="text-blue-700 mt-2">
                  这个页面使用了 Clerk 的服务器端认证来保护内容。只有已认证的用户才能访问这里。
                </p>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">技术特性</h3>
                <ul className="text-purple-700 space-y-1">
                  <li>• 服务器端路由保护</li>
                  <li>• 自动重定向到登录页面</li>
                  <li>• Clerk UserButton 组件</li>
                  <li>• Remix Loader 函数认证</li>
                </ul>
              </div>
              
              <div className="text-center pt-6">
                <a 
                  href="/" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  返回首页
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 