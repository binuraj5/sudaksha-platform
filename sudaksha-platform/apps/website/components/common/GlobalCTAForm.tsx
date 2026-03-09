
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Schema
const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface GlobalCTAFormProps {
    isOpen: boolean;
    onClose: () => void;
    ctaSubject?: string; // Changes based on button clicked
    sourceButton?: string;
    sourcePage?: string;
}

export function GlobalCTAForm({
    isOpen,
    onClose,
    ctaSubject = 'Inquire Now',
    sourceButton = 'Generic CTA',
    sourcePage
}: GlobalCTAFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
            // Fetch public IP + geo data
            let geoData: Record<string, string> = {};
            try {
                const geoRes = await fetch('https://ip-api.com/json/?fields=status,country,regionName,city,isp,query', { signal: AbortSignal.timeout(3000) });
                const geo = await geoRes.json();
                if (geo.status === 'success') {
                    geoData = { publicIp: geo.query, city: geo.city, region: geo.regionName, country: geo.country, isp: geo.isp };
                }
            } catch { /* geo lookup is best-effort */ }

            // Collect metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                device: navigator.userAgent,
                pageName: document.title,
                pageUrl: window.location.href,
                ctaButton: sourceButton,
                subject: ctaSubject,
                ...geoData,
            };

            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'GLOBAL_CTA',
                    formName: ctaSubject,
                    formData: { ...data, ...metadata },
                    pageUrl: window.location.href,
                    pageName: document.title
                }),
            });

            if (!response.ok) throw new Error('Submission failed');

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-600">
                                Your request has been received. Our team will contact you shortly.
                            </p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{ctaSubject}</h2>
                                <p className="text-gray-500 text-sm">
                                    Please fill in your details below and we'll get back to you.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="+91 98765 43210"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="I'm interested in..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 flex justify-center items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
