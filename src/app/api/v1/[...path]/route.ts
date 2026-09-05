import { createBackendProxy } from '@/lib/api-proxy';

const handlers = createBackendProxy('v1');

export const dynamic = 'force-dynamic';
export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const OPTIONS = handlers.OPTIONS;
