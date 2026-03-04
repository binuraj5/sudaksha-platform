"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/80 backdrop-blur-md border-gray-100 py-3 shadow-sm"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tighter italic">SudAssess</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    <div className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/assessments/login">
                            <Button variant="ghost" className="font-bold text-gray-600">Login</Button>
                        </Link>
                        <Link href="/assessments/register">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black italic rounded-xl px-6 shadow-lg shadow-indigo-100">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-lg font-bold text-gray-800 hover:text-indigo-600"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className="border-gray-50" />
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/assessments/login" className="w-full">
                                <Button variant="outline" className="w-full rounded-xl font-bold">Login</Button>
                            </Link>
                            <Link href="/assessments/register" className="w-full">
                                <Button className="w-full bg-indigo-600 text-white font-bold rounded-xl">Join Free</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
