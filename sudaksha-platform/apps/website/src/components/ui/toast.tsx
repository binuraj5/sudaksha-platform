'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString();
        const newToast: Toast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, toast.duration || 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        className={`
              flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}
                        style={{ minWidth: '300px' }}
                    >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="font-semibold text-sm">{toast.title}</div>
                            {toast.message && (
                                <div className="text-sm opacity-90 mt-1">{toast.message}</div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
