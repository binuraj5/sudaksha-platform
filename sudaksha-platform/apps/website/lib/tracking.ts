/**
 * Client-side event tracking — posts to /api/admin/audit so events
 * appear in the admin Audit Trail page.
 */

interface TrackEventPayload {
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  status?: 'SUCCESS' | 'FAILED';
  userName?: string;
}

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await fetch('/api/track/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: payload.action,
        entityType: payload.entityType ?? null,
        entityId: payload.entityId ?? null,
        entityName: payload.entityName ?? null,
        details: payload.details ?? {},
        severity: payload.severity ?? 'INFO',
        status: payload.status ?? 'SUCCESS',
        userName: payload.userName ?? 'visitor',
      }),
    });
  } catch {
    // Tracking must never break the user experience
  }
}
