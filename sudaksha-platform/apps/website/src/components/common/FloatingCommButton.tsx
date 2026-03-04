'use client';

import { useState } from 'react';
import { MessageCircle, Phone, Mail, X, HelpCircle, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCommButton() {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            icon: MessageCircle,
            label: 'Request a Callback',
            href: '/contact',
            color: 'bg-green-500'
        },
        {
            icon: Phone,
            label: 'Call Us',
            href: 'tel:+919121044435',
            color: 'bg-blue-600'
        },
        {
            icon: GraduationCap, // Replaced BookOpen with GraduationCap which exists in lucide-react
            label: 'Enroll Now',
            href: '/courses',
            color: 'bg-purple-600'
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <div className="mb-4 space-y-3">
                        {actions.map((action, index) => (
                            <motion.a
                                key={index}
                                href={action.href}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-end group"
                            >
                                <span className="mr-3 px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    {action.label}
                                </span>
                                <div className={`w-10 h-10 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors duration-300 ${isOpen ? 'bg-gray-800' : 'bg-blue-600'}`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <HelpCircle className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
