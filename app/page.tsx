import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/matrix/actions';

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/chat');
  } else {
    redirect('/login');
  }
}

