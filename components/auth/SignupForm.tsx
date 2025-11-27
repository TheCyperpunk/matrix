/**
 * Signup Form Component - Clean & Minimal Design
 */

'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupAction } from '@/lib/matrix/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white py-3.5 px-6 rounded-lg font-semibold text-base hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
            {pending ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <span>→</span>
                </span>
            )}
        </button>
    );
}

export default function SignupForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(signupAction, null);

    // Handle client-side redirect when signup succeeds
    useEffect(() => {
        if (state?.success) {
            router.push('/chat');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-purple-300 text-base">Join the Matrix network</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-10 border border-white/10">
                    <form action={formAction} className="space-y-6">
                        {/* Error Message */}
                        {state && !state.success && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>⚠️</span>
                                    <p className="text-sm font-medium">{state.error}</p>
                                </div>
                            </div>
                        )}

                        {/* Registration Note */}
                        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg">
                            <div className="flex gap-2">
                                <span className="flex-shrink-0">ℹ️</span>
                                <p className="text-xs"><strong>Note:</strong> Registration on matrix.org may be restricted. If you encounter issues, try logging in with an existing account.</p>
                            </div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-white">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    placeholder="Choose a username"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-white">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="Create a password"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    placeholder="Confirm your password"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-slate-900/80 text-purple-400">or</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-purple-200 text-sm">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-purple-400/60 text-sm">
                        Powered by <span className="font-semibold text-purple-300">Matrix.org</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
