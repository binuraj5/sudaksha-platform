import { headers } from 'next/headers';

export interface UserContext {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  permissions: string[];
  sessionId: string;
}

export interface RequestMetadata {
  ip: string;
  userAgent: string;
  referer?: string;
  timestamp: string;
  sessionId: string;
  requestId: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
}

export interface ContextualData {
  pageContext: {
    page: string;
    section?: string;
    action?: string;
    filters?: Record<string, any>;
    searchQuery?: string;
  };
  businessContext: {
    entityType?: string;
    entityId?: string;
    operation?: string;
    businessRule?: string;
    department?: string;
  };
  systemContext: {
    environment: string;
    version: string;
    featureFlags: Record<string, boolean>;
    experiments: Record<string, string>;
  };
  performanceContext: {
    loadTime?: number;
    responseTime?: number;
    memoryUsage?: number;
    errorCount?: number;
  };
}

export interface CapturedData {
  userContext: UserContext;
  requestMetadata: RequestMetadata;
  contextualData: ContextualData;
  payload?: any;
  timestamp: string;
  eventId: string;
}

export class DataCaptureService {
  private static instance: DataCaptureService;
  private capturedEvents: CapturedData[] = [];
  private maxEvents = 1000; // In-memory limit

  static getInstance(): DataCaptureService {
    if (!DataCaptureService.instance) {
      DataCaptureService.instance = new DataCaptureService();
    }
    return DataCaptureService.instance;
  }

  /**
   * Capture comprehensive user interaction data
   */
  async captureInteraction(
    userContext: UserContext,
    action: string,
    payload?: any,
    additionalContext?: Partial<ContextualData>
  ): Promise<CapturedData> {
    const requestMetadata = await this.getRequestMetadata();
    const contextualData = this.buildContextualData(action, additionalContext);

    const capturedData: CapturedData = {
      userContext,
      requestMetadata,
      contextualData,
      payload,
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId()
    };

    this.storeEvent(capturedData);
    return capturedData;
  }

  /**
   * Capture API call data
   */
  async captureApiCall(
    userContext: UserContext,
    endpoint: string,
    method: string,
    payload?: any,
    response?: any,
    statusCode?: number,
    responseTime?: number
  ): Promise<CapturedData> {
    const requestMetadata = await this.getRequestMetadata();

    const contextualData: ContextualData = {
      pageContext: {
        page: 'api',
        section: endpoint,
        action: method
      },
      businessContext: {
        operation: `${method} ${endpoint}`,
        entityType: this.extractEntityType(endpoint)
      },
      systemContext: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        featureFlags: this.getFeatureFlags(),
        experiments: this.getExperiments()
      },
      performanceContext: {
        responseTime,
        errorCount: statusCode && statusCode >= 400 ? 1 : 0
      }
    };

    const capturedData: CapturedData = {
      userContext,
      requestMetadata: {
        ...requestMetadata,
        method,
        url: endpoint,
        path: new URL(endpoint, 'http://localhost').pathname
      },
      contextualData,
      payload: {
        request: payload,
        response: response,
        statusCode,
        responseTime
      },
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId()
    };

    this.storeEvent(capturedData);
    return capturedData;
  }

  /**
   * Capture page view data
   */
  async capturePageView(
    userContext: UserContext,
    page: string,
    section?: string,
    filters?: Record<string, any>,
    searchQuery?: string
  ): Promise<CapturedData> {
    const requestMetadata = await this.getRequestMetadata();

    const contextualData: ContextualData = {
      pageContext: {
        page,
        section,
        action: 'view',
        filters,
        searchQuery
      },
      businessContext: {
        department: this.getDepartmentFromPage(page)
      },
      systemContext: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        featureFlags: this.getFeatureFlags(),
        experiments: this.getExperiments()
      },
      performanceContext: {}
    };

    const capturedData: CapturedData = {
      userContext,
      requestMetadata,
      contextualData,
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId()
    };

    this.storeEvent(capturedData);
    return capturedData;
  }

  /**
   * Get request metadata from headers
   */
  private async getRequestMetadata(): Promise<RequestMetadata> {
    try {
      const headersList = await headers();

      return {
        ip: this.getClientIP(headersList),
        userAgent: headersList.get('user-agent') || 'unknown',
        referer: headersList.get('referer') || undefined,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        requestId: this.generateRequestId(),
        method: 'GET', // Default, should be overridden in specific contexts
        url: headersList.get('x-url') || 'unknown',
        path: headersList.get('x-path') || 'unknown',
        query: this.parseQueryParams(headersList.get('x-query')),
        headers: this.serializeHeaders(headersList)
      };
    } catch (error) {
      console.error('Failed to get request metadata:', error);
      return this.getDefaultMetadata();
    }
  }

  /**
   * Build contextual data based on action
   */
  private buildContextualData(action: string, additionalContext?: Partial<ContextualData>): ContextualData {
    return {
      pageContext: {
        page: 'admin',
        action,
        ...additionalContext?.pageContext
      },
      businessContext: {
        operation: action,
        ...additionalContext?.businessContext
      },
      systemContext: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        featureFlags: this.getFeatureFlags(),
        experiments: this.getExperiments(),
        ...additionalContext?.systemContext
      },
      performanceContext: {
        ...additionalContext?.performanceContext
      }
    };
  }

  /**
   * Extract entity type from endpoint
   */
  private extractEntityType(endpoint: string): string {
    const patterns = [
      { pattern: /\/api\/courses/, entity: 'course' },
      { pattern: /\/api\/batches/, entity: 'batch' },
      { pattern: /\/api\/trainers/, entity: 'trainer' },
      { pattern: /\/api\/students/, entity: 'student' },
      { pattern: /\/api\/users/, entity: 'user' },
      { pattern: /\/api\/admin/, entity: 'admin' }
    ];

    for (const { pattern, entity } of patterns) {
      if (pattern.test(endpoint)) {
        return entity;
      }
    }
    return 'unknown';
  }

  /**
   * Get department from page path
   */
  private getDepartmentFromPage(page: string): string {
    if (page.includes('courses')) return 'academics';
    if (page.includes('batches')) return 'operations';
    if (page.includes('trainers')) return 'hr';
    if (page.includes('students')) return 'student-services';
    if (page.includes('admin')) return 'administration';
    return 'general';
  }

  /**
   * Get client IP from headers
   */
  private getClientIP(headersList: Headers): string {
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = headersList.get('x-client-ip');

    return forwarded?.split(',')[0]?.trim() ||
      realIP ||
      clientIP ||
      '127.0.0.1';
  }

  /**
   * Parse query parameters
   */
  private parseQueryParams(queryString: string | null): Record<string, string> {
    if (!queryString) return {};

    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);

    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  /**
   * Serialize headers for storage
   */
  private serializeHeaders(headersList: Headers): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const [key, value] of headersList.entries()) {
      headers[key] = value;
    }

    return headers;
  }

  /**
   * Get feature flags
   */
  private getFeatureFlags(): Record<string, boolean> {
    return {
      newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
      bulkActions: process.env.FEATURE_BULK_ACTIONS === 'true',
      auditLogs: process.env.FEATURE_AUDIT_LOGS === 'true',
      impersonation: process.env.FEATURE_IMPERSONATION === 'true',
      dragDrop: process.env.FEATURE_DRAG_DROP === 'true'
    };
  }

  /**
   * Get experiments
   */
  private getExperiments(): Record<string, string> {
    return {
      uiVariant: process.env.EXPERIMENT_UI_VARIANT || 'control',
      algorithmVersion: process.env.EXPERIMENT_ALGORITHM || 'v1',
      cacheStrategy: process.env.EXPERIMENT_CACHE || 'default'
    };
  }

  /**
   * Generate unique identifiers
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default metadata for error cases
   */
  private getDefaultMetadata(): RequestMetadata {
    return {
      ip: '127.0.0.1',
      userAgent: 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      requestId: this.generateRequestId(),
      method: 'GET',
      url: 'unknown',
      path: 'unknown',
      query: {},
      headers: {}
    };
  }

  /**
   * Store event in memory (in production, this would go to a database)
   */
  private storeEvent(event: CapturedData): void {
    this.capturedEvents.push(event);

    // Keep only the most recent events
    if (this.capturedEvents.length > this.maxEvents) {
      this.capturedEvents = this.capturedEvents.slice(-this.maxEvents);
    }

    // In production, send to analytics service
    this.sendToAnalytics(event);
  }

  /**
   * Send event to analytics service
   */
  private async sendToAnalytics(event: CapturedData): Promise<void> {
    try {
      // In production, this would send to your analytics service
      console.log('Analytics Event:', {
        eventId: event.eventId,
        userId: event.userContext.userId,
        action: event.contextualData.pageContext.action,
        page: event.contextualData.pageContext.page,
        timestamp: event.timestamp
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Get captured events for analysis
   */
  getCapturedEvents(filters?: {
    userId?: string;
    page?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): CapturedData[] {
    let events = [...this.capturedEvents];

    if (filters) {
      if (filters.userId) {
        events = events.filter(e => e.userContext.userId === filters.userId);
      }
      if (filters.page) {
        events = events.filter(e => e.contextualData.pageContext.page === filters.page);
      }
      if (filters.action) {
        events = events.filter(e => e.contextualData.pageContext.action === filters.action);
      }
      const startDate = filters.startDate;
      if (startDate) {
        events = events.filter(e => new Date(e.timestamp) >= startDate);
      }
      const endDate = filters.endDate;
      if (endDate) {
        events = events.filter(e => new Date(e.timestamp) <= endDate);
      }
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalEvents: number;
    uniqueUsers: number;
    topPages: Array<{ page: string; count: number }>;
    topActions: Array<{ action: string; count: number }>;
    avgResponseTime: number;
  } {
    const events = this.capturedEvents;
    const uniqueUsers = new Set(events.map(e => e.userContext.userId));

    const pageCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    events.forEach(event => {
      // Count pages
      const page = event.contextualData.pageContext.page;
      pageCounts[page] = (pageCounts[page] || 0) + 1;

      // Count actions
      const action = event.contextualData.pageContext.action || 'unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;

      // Sum response times
      const responseTime = event.contextualData.performanceContext.responseTime;
      if (responseTime) {
        totalResponseTime += responseTime;
        responseTimeCount++;
      }
    });

    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      uniqueUsers: uniqueUsers.size,
      topPages,
      topActions,
      avgResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0
    };
  }

  /**
   * Clear captured events
   */
  clearEvents(): void {
    this.capturedEvents = [];
  }
}

// Export singleton instance
export const dataCaptureService = DataCaptureService.getInstance();

// Helper functions for common data capture scenarios
export const captureUserLogin = async (user: UserContext, metadata?: any) => {
  return await dataCaptureService.captureInteraction(
    user,
    'login',
    { loginMethod: 'password', ...metadata },
    {
      pageContext: { page: 'auth', section: 'login' },
      businessContext: { operation: 'user_authentication', businessRule: 'login_policy' }
    }
  );
};

export const captureCourseCreation = async (user: UserContext, courseData: any) => {
  return await dataCaptureService.captureInteraction(
    user,
    'create_course',
    courseData,
    {
      pageContext: { page: 'admin', section: 'courses', action: 'create' },
      businessContext: {
        entityType: 'course',
        operation: 'create',
        businessRule: 'course_approval_workflow'
      }
    }
  );
};

export const captureBatchUpdate = async (user: UserContext, batchId: string, changes: any) => {
  return await dataCaptureService.captureInteraction(
    user,
    'update_batch',
    { batchId, changes },
    {
      pageContext: { page: 'admin', section: 'batches', action: 'update' },
      businessContext: {
        entityType: 'batch',
        operation: 'update',
        businessRule: 'batch_capacity_limits'
      }
    }
  );
};

export const captureBulkAction = async (user: UserContext, action: string, entityIds: string[], entityType: string) => {
  return await dataCaptureService.captureInteraction(
    user,
    `bulk_${action}`,
    { entityIds, count: entityIds.length },
    {
      pageContext: { page: 'admin', action: `bulk_${action}` },
      businessContext: {
        entityType,
        operation: `bulk_${action}`,
        businessRule: 'bulk_operation_limits'
      }
    }
  );
};
