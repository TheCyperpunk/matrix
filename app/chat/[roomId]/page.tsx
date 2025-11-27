import { getCurrentSession } from '@/lib/matrix/actions';
import { redirect } from 'next/navigation';

import RoomPageClient from '@/components/chat/RoomPage';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <RoomPageClient params={params} session={session} />
    );
}
