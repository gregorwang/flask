import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useSearchParams, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export const loader = async () => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Supabase URL and Anon Key must be provided.");
    }

    return json({
        ENV: {
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
        },
    }, {
        headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400", // 环境变量可长时间缓存
        }
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const response = new Response();
    const { supabase, headers } = createSupabaseServerClient({ request, response });
    const formData = await request.formData();
    const { intent, email, password } = Object.fromEntries(formData);
    const redirectTo = new URL(request.url).origin;

    switch (intent) {
        case "sign-in": {
            if (!email || !password) {
                return json({ error: "Please provide email and password." }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            const { error } = await supabase.auth.signInWithPassword({
                email: email.toString(),
                password: password.toString(),
            });
            if (error) {
                response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `Sign in failed: ${error.message}` }, { status: 401, headers: response.headers });
            }
            headers.forEach((value, key) => { response.headers.append(key, value); });
            return redirect("/", { headers: response.headers });
        }
        case "sign-up": {
            if (!email || !password) {
                return json({ error: "Please provide email and password." }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            if (password.toString().length < 6) {
                return json({ error: "Password must be at least 6 characters." }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            const { error } = await supabase.auth.signUp({
                email: email.toString(),
                password: password.toString(),
            });
            if (error) {
                response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `Sign up failed: ${error.message}` }, { status: 500, headers: response.headers });
            }
            headers.forEach((value, key) => { response.headers.append(key, value); });
            response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
            return json({ success: "Sign up successful! Please check your email for verification." }, { headers: response.headers });
        }
        case "google":
        case "microsoft": {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: intent === 'microsoft' ? 'azure' : 'google',
                options: { redirectTo },
            });
            if (error) {
                response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `OAuth failed: ${error.message}` }, { status: 500, headers: response.headers });
            }
            headers.forEach((value, key) => { response.headers.append(key, value); });
            return redirect(data.url, { headers: response.headers });
        }
        default:
            return json({ error: "Invalid intent." }, { 
                status: 400,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                }
            });
    }
};

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const fetcher = useFetcher<typeof action>();
    const isSigningIn = fetcher.formData?.get('intent') === 'sign-in' && fetcher.state !== 'idle';
    const isSigningUp = fetcher.formData?.get('intent') === 'sign-up' && fetcher.state !== 'idle';
    const actionData = fetcher.data;
    const isRegister = searchParams.get('type') === 'register';

    return (
        <div className="flex min-h-full flex-1">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <img
                            alt="Your Company"
                            src="/logo-dark.png"
                            className="h-10 w-auto"
                        />
                        <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
                            {isRegister ? 'Create an account' : 'Sign in to your account'}
                        </h2>
                        <p className="mt-2 text-sm/6 text-gray-500">
                            {isRegister ? (
                                <>
                                    Already a member?{' '}
                                    <Link to="/auth" prefetch="intent" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Sign in
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Not a member?{' '}
                                    <Link to="/auth?type=register" prefetch="intent" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Start a 14 day free trial
                                    </Link>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="mt-10">
                        <div>
                            <fetcher.Form method="POST" className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                        Email address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        Password
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete={isRegister ? "new-password" : "current-password"}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                
                                {actionData && 'error' in actionData && (
                                  <p className="text-sm text-red-600">{actionData.error}</p>
                                )}
                                {actionData && 'success' in actionData && (
                                  <p className="text-sm text-green-600">{actionData.success}</p>
                                )}

                                <div>
                                    <button
                                        type="submit"
                                        name="intent"
                                        value={isRegister ? "sign-up" : "sign-in"}
                                        disabled={isSigningIn || isSigningUp}
                                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-75"
                                    >
                                        {isRegister ? (isSigningUp ? 'Creating account...' : 'Create account') : (isSigningIn ? 'Signing in...' : 'Sign in')}
                                    </button>
                                </div>
                            </fetcher.Form>
                        </div>

                        <div className="mt-10">
                            <div className="relative">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm/6">
                                    <span className="bg-white px-6 font-medium text-gray-900">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <fetcher.Form method="post">
                                    <button type="submit" name="intent" value="google" className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                                            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                        </svg>
                                        <span className="text-sm/6 font-semibold">Google</span>
                                    </button>
                                </fetcher.Form>

                                <fetcher.Form method="post">
                                     <button type="submit" name="intent" value="microsoft" className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="h-5 w-5">
                                          <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                                          <path fill="#F25022" d="M1 1h10.14v10.14H1z"/>
                                          <path fill="#00A4EF" d="M1 11.86h10.14V22H1z"/>
                                          <path fill="#7FBA00" d="M11.86 1h10.14v10.14H11.86z"/>
                                          <path fill="#FFB900" d="M11.86 11.86h10.14V22H11.86z"/>
                                        </svg>
                                        <span className="text-sm/6 font-semibold">Microsoft</span>
                                    </button>
                                </fetcher.Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    alt=""
                    src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    );
} 