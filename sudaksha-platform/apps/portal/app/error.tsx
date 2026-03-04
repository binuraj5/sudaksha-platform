'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    (typeof error?.message === 'string' &&
      (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')));

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        {isChunkError ? 'Load failed' : 'Something went wrong'}
      </h2>
      <p className="text-slate-600 mb-4 max-w-md">
        {isChunkError
          ? 'This part of the app failed to load. Try refreshing the page.'
          : error?.message}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Try again
      </button>
      {!isChunkError && (
        <button
          type="button"
          onClick={reset}
          className="mt-3 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Retry
        </button>
      )}
    </div>
  );
}
