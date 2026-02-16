'use client';

/**
 * Catches errors in the root layout (e.g. ChunkLoadError when app/layout chunk fails to load).
 * Must define its own <html> and <body> since it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    (typeof error?.message === 'string' &&
      (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')));

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
            {isChunkError ? 'Page failed to load' : 'Something went wrong'}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '28rem' }}>
            {isChunkError
              ? 'The app failed to load. This can happen after an update or on a slow connection.'
              : error?.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#fff',
              background: '#6366f1',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {!isChunkError && (
            <button
              type="button"
              onClick={reset}
              style={{
                marginLeft: '0.75rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#6366f1',
                background: 'transparent',
                border: '1px solid #6366f1',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          )}
        </div>
      </body>
    </html>
  );
}
