import { getCurrentSession } from '@/lib/matrix/actions';
import { redirect } from 'next/navigation';
import { MatrixProvider } from '@/components/providers/MatrixProvider';
import ChatLayout from '@/components/chat/ChatLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    console.log('Chat Layout Session:', {
        userId: session.userId,
        hasAccessToken: !!session.accessToken,
        homeServer: session.homeServer
    });

    return (
        <MatrixProvider
            accessToken={session.accessToken}
            userId={session.userId}
            homeserverUrl={session.homeServer}
        >
            <ChatLayout session={session}>
                {children}
            </ChatLayout>
        </MatrixProvider>
    );
}
