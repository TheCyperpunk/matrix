/**
 * Login Form Component - Clean & Minimal Design
 */

'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/matrix/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-base hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
            {pending ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <span>→</span>
                </span>
            )}
        </button>
    );
}

export default function LoginForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(loginAction, null);

    // Handle client-side redirect when login succeeds
    useEffect(() => {
        if (state?.success) {
            router.push('/chat');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
            <div className="w-full max-w-[440px]">
                {/* Logo/Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-2xl overflow-hidden">
                        <img src="/xmo-logo.png" alt="XMO Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">XMO</h1>
                    <p className="text-purple-300/90 text-lg font-medium">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl pt-12 pb-8 px-20 border border-white/10">
                    <form action={formAction} style={{ marginLeft: '2rem', marginRight: '2rem' }}>
                        {/* Error Message */}
                        {state && !state.success && 'error' in state && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>⚠️</span>
                                    <p className="text-sm font-medium">{state.error}</p>
                                </div>
                            </div>
                        )}

                        {/* Username Field */}
                        <div style={{ marginTop: '2rem' }}>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                placeholder="Username"
                                className="w-full px-4 py-4 bg-white/8 border border-white/20 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white/12 transition-all duration-200 hover:border-white/30 text-center placeholder:text-center"
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                placeholder="Password"
                                className="w-full px-4 py-4 bg-white/8 border border-white/20 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white/12 transition-all duration-200 hover:border-white/30 text-center placeholder:text-center"
                            />
                        </div>

                        {/* Submit Button */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <SubmitButton />
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="text-center my-6">
                        <span className="text-sm text-purple-400">or</span>
                    </div>

                    {/* Signup Link */}
                    <div className="text-center">
                        <p className="text-purple-200 text-sm">
                            Don't have an account?{' '}
                            <a
                                href="https://app.element.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Create one now
                            </a>
                        </p>
                    </div>
                </div>


            </div>
        </div>
    );
}
