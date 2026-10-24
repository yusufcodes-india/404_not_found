import { NextResponse } from 'next/server';

export function okResponse<T>(data: T, meta?: Record<string, unknown>, status = 200, requestId?: string) {
  const reqId = requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return NextResponse.json(
    {
      ok: true,
      data,
      ...(meta ? { meta } : {}),
      requestId: reqId,
    },
    {
      status,
      headers: {
        'x-request-id': reqId,
      },
    }
  );
}

export function errorResponse(message: string, code = 'BAD_REQUEST', status = 400, requestId?: string) {
  const reqId = requestId || `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        requestId: reqId,
      },
    },
    {
      status,
      headers: {
        'x-request-id': reqId,
      },
    }
  );
}
