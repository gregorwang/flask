import { SignIn } from '@clerk/remix'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">登录</h1>
            <p className="text-gray-600">欢迎回到我们的平台</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SignIn />
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 