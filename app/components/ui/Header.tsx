'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogPanel,
} from '@headlessui/react'
// Replaced heroicons with simple symbols for better performance
import { Link } from '@remix-run/react'
// Lazy load typing animation to reduce initial bundle size
import { isAdmin } from '~/lib/constants';
import { AuroraText } from '~/components/common/magicui/aurora-text';

// Clerk imports
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from '@clerk/remix'

const navigation = [
  { name: '个人简历', href: '/cv' },
  { name: '影像记忆', href: '/photo' },
  { name: '音乐之旅', href: '/music' },
  { name: '游戏世界', href: '/game' },
  { name: 'RAG-Nemesis', href: '/chat' },
  { name: '动漫回', href: '/anime' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const userIsAdmin = isAdmin(user?.id)

  return (
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/" prefetch="intent" className="-m-1.5 p-1.5">
            <div className="text-3xl font-bold text-gray-900">
              GREGOR<AuroraText className="text-3xl font-bold">WANG</AuroraText>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">☰</span>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              prefetch="intent"
              className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          {userIsAdmin && (
            <Link 
              to="/admin/messages" 
              prefetch="intent"
              className="text-sm/6 font-semibold text-red-600 hover:text-red-700 relative transition-colors"
            >
              🛡️ 留言管理
            </Link>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="text-sm/6 font-semibold text-gray-900">
                Log in <span aria-hidden="true">&rarr;</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              <div className="relative">
                <UserButton afterSignOutUrl="/" />
                <span className="absolute -right-1 -top-1 inline-block w-2 h-2 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {user?.firstName || user?.username || '用户'}
              </span>
              <SignOutButton>
                <button className="text-sm text-red-600 font-semibold">退出登录</button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" prefetch="intent" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <div className="text-3xl font-bold text-gray-900">
                GREGOR<AuroraText className="text-3xl font-bold">WANG</AuroraText>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">✕</span>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    prefetch="intent"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {userIsAdmin && (
                  <Link
                    to="/admin/messages"
                    prefetch="intent"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🛡️ 留言管理
                  </Link>
                )}
              </div>
              <div className="py-6">
                <SignedOut>
                  <SignInButton>
                    <button className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                      Log in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-base font-semibold text-gray-900 flex-1">
                      {user?.firstName || user?.username || '用户'}
                    </span>
                    <SignOutButton>
                      <button className="text-base font-semibold text-red-600">退出</button>
                    </SignOutButton>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
