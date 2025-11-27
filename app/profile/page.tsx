import { getCurrentSession, logoutAction } from '@/lib/matrix/actions';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                    <p className="text-purple-200">Your Matrix account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                            {session.userId.charAt(1).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {session.userId.split(':')[0].substring(1)}
                            </h2>
                            <p className="text-purple-200 text-sm">{session.userId}</p>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-purple-200 mb-1">User ID</p>
                            <p className="text-white font-mono text-sm break-all">{session.userId}</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-purple-200 mb-1">Home Server</p>
                            <p className="text-white font-mono text-sm">{session.homeServer || 'matrix.org'}</p>
                        </div>

                        {session.deviceId && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="text-sm text-purple-200 mb-1">Device ID</p>
                                <p className="text-white font-mono text-sm break-all">{session.deviceId}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <a
                            href="/chat"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
                        >
                            Back to Chat
                        </a>
                        <form action={logoutAction} className="flex-1">
                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
