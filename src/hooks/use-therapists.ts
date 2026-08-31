"use client";

/**
 * useTherapists — client-side hook for fetching therapist data
 * Calls the secure /api/therapists proxy (server handles auth).
 */

import { useState, useEffect, useCallback } from 'react';

import { TherapistCard } from '@/types/therapist';

export type { TherapistCard };

export interface UseTherapistsParams {
    city?: string;
    state?: string;
    area?: string;
    specialization?: string;
    slug?: string;
    limit?: number;
    enabled?: boolean; // set false to skip fetching
}

export interface UseTherapistsResult {
    therapists: TherapistCard[];
    total: number;
    isLoading: boolean;
    isError: boolean;
    source: 'live' | 'fallback' | 'error' | null;
    refetch: () => void;
}

export function useTherapists(params: UseTherapistsParams = {}): UseTherapistsResult {
    const { city, state, area, specialization, limit = 1000, enabled = true } = params;

    const [therapists, setTherapists] = useState<TherapistCard[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [source, setSource] = useState<'live' | 'fallback' | 'error' | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick(t => t + 1), []);

    useEffect(() => {
        if (!enabled) return;

        const qs = new URLSearchParams();
        if (city) qs.set('city', city);
        if (state) qs.set('state', state);
        if (area) qs.set('area', area);
        if (specialization) qs.set('specialization', specialization);
        if (params.slug) qs.set('slug', params.slug);
        qs.set('limit', String(limit));

        let cancelled = false;
        setIsLoading(true);
        setIsError(false);

        fetch(`/api/therapists?${qs.toString()}`)
            .then(r => r.json())
            .then(data => {
                if (cancelled) return;
                setTherapists(data.therapists ?? []);
                setTotal(data.total ?? 0);
                setSource(data.source ?? 'live');
            })
            .catch(() => {
                if (cancelled) return;
                setIsError(true);
                setSource('error');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [city, state, area, specialization, limit, enabled, tick]);

    return { therapists, total, isLoading, isError, source, refetch };
}
