// import { prisma } from '@/lib/prisma'; // Commented out for now

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userEmail: string;
  oldValue?: any;
  newValue?: any;
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    [key: string]: any;
  };
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'create' | 'update' | 'delete' | 'login' | 'system';
}

export class AdminAuditService {
  /**
   * Log an audit event to the database
   */
  static async logAuditEvent(data: AuditLogData) {
    try {
      // In a real implementation, this would save to a database table
      // For now, we'll simulate the logging with console output
      console.log('Audit Log Event:', {
        ...data,
        timestamp: new Date().toISOString(),
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      // Real implementation would be:
      // await prisma.adminAuditLog.create({
      //   data: {
      //     action: data.action,
      //     entityType: data.entityType,
      //     entityId: data.entityId,
      //     entityName: data.entityName,
      //     userId: data.userId,
      //     userName: data.userName,
      //     userEmail: data.userEmail,
      //     oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
      //     newValue: data.newValue ? JSON.stringify(data.newValue) : null,
      //     metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      //     severity: data.severity,
      //     category: data.category,
      //     timestamp: new Date(),
      //   }
      // });

      return { success: true, id: `audit_${Date.now()}` };
    } catch (error) {
      console.error('Failed to log audit event:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getAuditLogs(filters: {
    entityType?: string;
    userId?: string;
    severity?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      // In a real implementation, this would query the database
      console.log('Getting audit logs with filters:', filters);

      // Mock implementation
      const mockLogs = [
        {
          id: '1',
          action: 'Created',
          entityType: 'course',
          entityId: 'course-1',
          entityName: 'AI/ML Engineering',
          userId: 'admin-1',
          userName: 'Admin User',
          userEmail: 'admin@sudaksha.com',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          oldValue: null,
          newValue: { name: 'AI/ML Engineering', price: 55000, duration: 16 },
          metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
          severity: 'success',
          category: 'create'
        }
      ];

      return { success: true, data: mockLogs, total: mockLogs.length };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return { success: false, error: (error as Error).message, data: [], total: 0 };
    }
  }

  /**
   * Get version history for an entity
   */
  static async getVersionHistory(entityType: string, entityId: string) {
    try {
      console.log(`Getting version history for ${entityType}:${entityId}`);

      // Mock implementation - in real app, this would query version history
      const mockVersions = [
        {
          id: 'v1',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          author: 'Admin User',
          changes: 'Initial creation',
          data: { name: 'AI/ML Engineering', price: 55000, duration: 16 }
        },
        {
          id: 'v2',
          timestamp: new Date('2024-01-15T14:20:00Z'),
          author: 'Admin User',
          changes: 'Updated price from 50000 to 55000',
          data: { name: 'AI/ML Engineering', price: 55000, duration: 16 }
        }
      ];

      return { success: true, data: mockVersions };
    } catch (error) {
      console.error('Failed to get version history:', error);
      return { success: false, error: (error as Error).message, data: [] };
    }
  }

  /**
   * Restore entity to a previous version
   */
  static async restoreVersion(entityType: string, entityId: string, versionId: string) {
    try {
      console.log(`Restoring ${entityType}:${entityId} to version ${versionId}`);

      // In a real implementation, this would:
      // 1. Get the version data
      // 2. Create a backup of current state
      // 3. Restore the entity to the version state
      // 4. Log the restore action

      return { success: true, message: 'Entity restored successfully' };
    } catch (error) {
      console.error('Failed to restore version:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Export audit logs to CSV/Excel
   */
  static async exportAuditLogs(filters: any = {}) {
    try {
      console.log('Exporting audit logs with filters:', filters);

      // In a real implementation, this would:
      // 1. Query the audit logs with filters
      // 2. Format as CSV/Excel
      // 3. Return file data or download URL

      const csvData = `Timestamp,Action,Entity,User,Severity,Category
2024-01-15T10:30:00Z,Created,AI/ML Engineering,Admin User,success,create
2024-01-15T11:15:00Z,Updated,Java Full Stack - Batch A,Admin User,info,update`;

      return { 
        success: true, 
        data: csvData, 
        filename: `audit_logs_${new Date().toISOString().split('T')[0]}.csv` 
      };
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get user metadata for audit logging
   */
  static getUserMetadata(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    return {
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a middleware for automatic audit logging
   */
  static auditMiddleware(action: string, entityType: string) {
    return async (req: any, entityId: string, entityName: string, oldValue?: any, newValue?: any) => {
      // This would be used in API routes to automatically log changes
      const user = req.user; // Assuming user is attached to request
      const metadata = this.getUserMetadata(req);

      if (user) {
        await this.logAuditEvent({
          action,
          entityType,
          entityId,
          entityName,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          oldValue,
          newValue,
          metadata,
          severity: 'info',
          category: action.toLowerCase() as any
        });
      }
    };
  }
}

// Helper function to create audit log entries
export const createAuditLog = (data: AuditLogData) => {
  return AdminAuditService.logAuditEvent(data);
};

// Predefined audit log creators
export const logCourseCreation = (courseData: any, user: any, metadata?: any) => {
  return createAuditLog({
    action: 'Created',
    entityType: 'course',
    entityId: courseData.id,
    entityName: courseData.name,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    newValue: courseData,
    metadata,
    severity: 'success',
    category: 'create'
  });
};

export const logBatchUpdate = (batchId: string, batchName: string, oldValue: any, newValue: any, user: any, metadata?: any) => {
  return createAuditLog({
    action: 'Updated',
    entityType: 'batch',
    entityId: batchId,
    entityName: batchName,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    oldValue,
    newValue,
    metadata,
    severity: 'info',
    category: 'update'
  });
};

export const logUserLogin = (user: any, metadata?: any) => {
  return createAuditLog({
    action: 'Login',
    entityType: 'user',
    entityId: user.id,
    entityName: user.name,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    metadata,
    severity: 'info',
    category: 'login'
  });
};

export const logSystemError = (error: string, metadata?: any) => {
  return createAuditLog({
    action: 'System Error',
    entityType: 'system',
    entityId: 'system-1',
    entityName: 'System',
    userId: 'system',
    userName: 'System',
    userEmail: 'system@sudaksha.com',
    newValue: { error, ...metadata },
    metadata,
    severity: 'error',
    category: 'system'
  });
};
