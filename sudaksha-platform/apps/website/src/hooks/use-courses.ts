'use client';

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Course, CourseFilters } from "../types/course";
import { CreateCourse, UpdateCourse } from "../lib/schemas/course";

// API base URL (public, no auth required)
const API_BASE = "/api/courses";

// API functions
export const courseApi = {
    getCourses: async (filters: CourseFilters): Promise<{ courses: Course[]; pagination: any }> => {
        try {
            const params = new URLSearchParams();
            if (filters.page) params.set("page", String(filters.page));
            if (filters.search) params.set("search", filters.search);
            const domainVal = Array.isArray(filters.domain) ? filters.domain[0] : (filters.domain as any);
            if (domainVal && domainVal !== "All") params.set("domain", domainVal);
            if (filters.courseTypes?.length) params.set("courseTypes", filters.courseTypes.join(","));
            if (filters.categories?.length) params.set("categories", filters.categories.join(","));
            if (filters.targetLevels?.length) params.set("targetLevels", filters.targetLevels.join(","));
            if (filters.industries?.length) params.set("industries", filters.industries.join(","));
            if (filters.deliveryModes?.length) params.set("deliveryModes", filters.deliveryModes.join(","));
            if (filters.sort) params.set("sort", filters.sort as string);

            const response = await fetch(`${API_BASE}?${params.toString()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.courses) {
                    return {
                        courses: result.courses,
                        pagination: result.pagination || { page: 1, pageSize: 12, total: result.courses.length, totalPages: 1, hasNextPage: false, hasPrevPage: false }
                    };
                }
            }
            return {
                courses: [],
                pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
            };
        } catch (error) {
            console.error("Error fetching courses:", error);
            return {
                courses: [],
                pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
            };
        }
    },

    createCourse: async (course: CreateCourse): Promise<{ success: boolean; courseId: string }> => {
        try {
            console.log('🚀 [Hook] Sending course creation request:', course);
            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course),
            });

            console.log('📡 [Hook] Response status:', response.status, response.statusText);

            const result = await response.json();
            console.log('📦 [Hook] Response body:', result);

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            if (result.success && result.courseId) {
                console.log('✅ [Hook] Course created successfully with ID:', result.courseId);
                return result;
            } else {
                throw new Error(result.error || 'Course creation failed - no ID returned');
            }
        } catch (error) {
            console.error('❌ [Hook] Course creation error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Database connection required. Please ensure database is configured and running.");
        }
    },

    updateCourse: async (id: string, updates: UpdateCourse): Promise<{ success: boolean; courseId: string }> => {
        try {
            const response = await fetch(`/api/admin/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.courseId) {
                    return result;
                }
            }
            throw new Error('Failed to update course');
        } catch (error) {
            throw new Error("Database connection required. Please ensure database is configured and running.");
        }
    },

    deleteCourse: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`/api/admin/courses/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                return;
            }
            throw new Error('Failed to delete course');
        } catch (error) {
            throw new Error("Database connection required. Please ensure database is configured and running.");
        }
    },
};

export const useCourses = (filters: CourseFilters) => {
    return useQuery({
        queryKey: ["courses", filters],
        queryFn: () => courseApi.getCourses(filters),
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
    });
};

export const useInfiniteCourses = (baseFilters: CourseFilters) => {
    return useInfiniteQuery({
        queryKey: ['courses', 'infinite', baseFilters],
        queryFn: ({ pageParam = 1 }) =>
            courseApi.getCourses({ ...baseFilters, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.pagination.hasNextPage ? allPages.length + 1 : undefined,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCourse = (slug: string) => {
    return useQuery({
        queryKey: ['course', slug],
        queryFn: async () => {
            // Use updated public API which returns { success: true, course: ... } directly
            const res = await fetch(`/api/courses?slug=${slug}`);
            const data = await res.json();
            if (data.success) return data.course;
            throw new Error(data.error || 'Failed to fetch course');
        },
        enabled: !!slug,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: courseApi.createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error) => {
            console.error("Create course error:", error);
        }
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, { id: string; updates: UpdateCourse }, unknown>({
        mutationFn: ({ id, updates }) => courseApi.updateCourse(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error) => {
            console.error("Update course error:", error);
        }
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: courseApi.deleteCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error) => {
            console.error("Delete course error:", error);
        }
    });
};

export const useFilters = (initialFilters: Partial<CourseFilters>) => {
    const [filters, setFilters] = useState<CourseFilters>(initialFilters as CourseFilters);

    const updateFilter = (key: keyof CourseFilters, value: any) => {
        setFilters((prev: CourseFilters) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters(initialFilters as CourseFilters);
    };

    return { filters, updateFilter, clearFilters };
};

export const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};
