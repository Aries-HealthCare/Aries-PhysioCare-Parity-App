export interface ApiEnvelope<T = any> {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
  count?: number;
  [key: string]: any;
}

export function unwrap<T = any>(envelope: ApiEnvelope<T> | null | undefined): any {
  if (!envelope) return null;
  if (envelope.result !== undefined && envelope.result !== null) return envelope.result;
  if (envelope.data !== undefined && envelope.data !== null) return envelope.data;
  return envelope;
}

export function unwrapList(envelope: ApiEnvelope | null | undefined, ...keys: string[]): any[] {
  if (!envelope) return [];
  for (const key of keys) {
    const direct = (envelope as any)[key];
    if (Array.isArray(direct)) return direct;
    const nestedResult = (envelope as any).result?.[key];
    if (Array.isArray(nestedResult)) return nestedResult;
    const nestedData = (envelope as any).data?.[key];
    if (Array.isArray(nestedData)) return nestedData;
  }
  if (Array.isArray(envelope.result)) return envelope.result as any[];
  if (Array.isArray(envelope.data)) return envelope.data as any[];
  if (Array.isArray(envelope)) return envelope as any;
  return [];
}
