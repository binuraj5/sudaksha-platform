/**
 * API Response Utilities
 * 
 * Standardized response formatters for API routes.
 * Ensures consistent response structure across all endpoints.
 */

import { NextResponse } from 'next/server';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Send a success response
 * 
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Optional success message
 */
export function sendSuccess<T>(
    data: T,
    statusCode: number = 200,
    message?: string
): NextResponse {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (message) {
        (response as any).message = message;
    }

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Send an error response
 * 
 * @param code - Error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param details - Optional additional error details
 */
export function sendError(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
): NextResponse {
    const response: ApiResponse = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Send a paginated response
 * 
 * @param data - Array of items
 * @param total - Total number of items (across all pages)
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export function sendPaginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): NextResponse {
    const response: ApiResponse<T[]> = {
        success: true,
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    };

    return NextResponse.json(response);
}

/**
 * Common error responses
 */
export const ErrorResponses = {
    unauthorized: (message = 'Unauthorized') => {
        return sendError('UNAUTHORIZED', message, 401);
    },

    forbidden: (message = 'Forbidden') => {
        return sendError('FORBIDDEN', message, 403);
    },

    notFound: (resource = 'Resource') => {
        return sendError('NOT_FOUND', `${resource} not found`, 404);
    },

    badRequest: (message = 'Bad request', details?: any) => {
        return sendError('BAD_REQUEST', message, 400, details);
    },

    conflict: (message = 'Resource already exists') => {
        return sendError('CONFLICT', message, 409);
    },

    validationError: (errors: any) => {
        return sendError('VALIDATION_ERROR', 'Validation failed', 422, errors);
    },

    internalError: (message = 'Internal server error') => {
        return sendError('INTERNAL_ERROR', message, 500);
    },

    methodNotAllowed: (allowed: string[]) => {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: `Method not allowed. Allowed: ${allowed.join(', ')}`,
                },
            },
            {
                status: 405,
                headers: {
                    Allow: allowed.join(', '),
                },
            }
        );
    },
};

/**
 * Parse pagination parameters from query string
 * 
 * @param searchParams - URLSearchParams object
 * @returns Pagination parameters with defaults
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
} {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));

    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize,
    };
}

/**
 * Parse filter parameters from query string
 * 
 * Converts query params like ?status=ACTIVE&type=PROJECT
 * into a Prisma where clause
 * 
 * @param searchParams - URLSearchParams object
 * @param allowedFilters - Array of allowed filter field names
 * @returns Prisma where clause object
 */
export function parseFilterParams(searchParams: URLSearchParams, allowedFilters: string[]): Record<string, any> {
    const filters: Record<string, any> = {};

    for (const key of allowedFilters) {
        const value = searchParams.get(key);
        if (value) {
            filters[key] = value;
        }
    }

    return filters;
}

