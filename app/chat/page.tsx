import { getCurrentSession } from '@/lib/matrix/actions';
import { redirect } from 'next/navigation';


export default async function ChatPage() {
    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl mb-4">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Matrix Chat</h2>
                <p className="text-slate-400">Select a room to start messaging</p>
            </div>
        </div>
    );
}
