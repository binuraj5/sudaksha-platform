'use client';

import { motion } from 'framer-motion';
import { Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

const countries = [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'UAE', flag: '🇦🇪' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Germany', flag: '🇩🇪' }
];

export function GlobalPresence() {
    return (
        <section className="bg-navy-900 border-t border-navy-800 py-6 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">

                    {/* Label */}
                    <Link href="/corporates/international" className="group flex items-center gap-3 flex-shrink-0">
                        <div className="p-2 bg-navy-800 rounded-lg border border-navy-700 group-hover:border-blue-500/50 transition-colors">
                            <Globe className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-white text-sm font-semibold tracking-wide">GLOBAL PRESENCE</h3>
                            <p className="text-gray-400 text-xs group-hover:text-blue-400 transition-colors">Delivering excellence worldwide &rarr;</p>
                        </div>
                    </Link>

                    {/* Divider for desktop */}
                    <div className="hidden md:block w-px h-10 bg-navy-700"></div>

                    {/* Countries List */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                        {countries.map((country, index) => (
                            <Link
                                key={country.name}
                                href="/corporates/international"
                                className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <span className="text-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{country.flag}</span>
                                <span className="text-sm font-medium">{country.name}</span>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
