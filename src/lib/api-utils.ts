import { NextResponse } from "next/server";

/**
 * Standard error response for admin APIs
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Standard success response for admin APIs
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
  const body: { success: true; data: T; message?: string } = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}

/**
 * Parse pagination from query/search params object
 */
export function getPaginationParams(searchParams: Record<string, string | undefined>) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.pageSize || "20", 10) || 20));
  return { page, pageSize };
}

/**
 * Build pagination meta for list responses
 */
export function calculatePagination(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
