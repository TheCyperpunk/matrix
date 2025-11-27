'use client';

import { useMatrixContext } from '@/components/providers/MatrixProvider';

interface UseMatrixClientProps {
    accessToken?: string;
    userId?: string;
}

export function useMatrixClient(props?: UseMatrixClientProps) {
    return useMatrixContext();
}
