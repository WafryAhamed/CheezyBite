"use client";

import { useEffect } from 'react';
import { performCleanup } from '../utils/cleanupStorage';
import { useRouter } from 'next/navigation';

export default function ClientCleanup() {
    const router = useRouter();

    useEffect(() => {
        const wasCleaned = performCleanup();
        if (wasCleaned) {
            router.refresh(); // Soft refresh to ensure components re-read empty storage
        }
    }, [router]);

    return null; // This component renders nothing
}
