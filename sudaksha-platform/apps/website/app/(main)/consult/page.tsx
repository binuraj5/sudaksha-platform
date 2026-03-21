'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, CheckCircle2, Factory, Monitor, Beaker, Shield,
    BarChart3, Users, Target, Zap, ChevronDown, Check, Star,
    Download, Play, X
} from 'lucide-react';
import { useCTACapture } from '@/hooks/useCTACapture';
import { QuoteRequestModal } from '@/src/components/common/QuoteRequestModal';

// --- Components ---

// 1. Trust Bar
const TrustBar = () => {
    const logos = [
        "TechMahindra", "DRDO", "DrReddys", "TataAdvancedItems", "HCL", "Infosys", "Aurobindo"
    ];
    return (
        <div className="w-full overflow-hidden bg-white/5 py-8 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-slate-400 text-sm tracking-widest uppercase mb-6">Trusted by Industry Leaders</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for Logos - using text for now */}
                    {logos.map((logo, i) => (
                        <span key={i} className="text-xl font-bold text-white">{logo}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 2. Problem Card
const ProblemCard = ({ icon: Icon, stat, title, desc, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-secondary/50 hover:bg-slate-800 transition-all duration-300 group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-lg group-hover:bg-secondary/10 transition-colors">
                <Icon className="w-6 h-6 text-accent group-hover:text-secondary" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">{stat}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
);

// 3. Process Step
const ProcessStep = ({ number, title, desc, deliverables, align }: any) => (
    <div className={`flex flex-col md:flex-row gap-8 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-1">
            <div className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-slate-300 -mt-8 -mr-8 group-hover:text-accent transition-colors duration-500">
                    {number}
                </div>
                <div className="relative z-10">
                    <div className="text-secondary font-bold tracking-widest uppercase text-sm mb-2">Phase {number}</div>
                    <h3 className="text-2xl font-bold text-primary mb-4">{title}</h3>
                    <p className="text-slate-600 mb-6">{desc}</p>
                    <ul className="space-y-2">
                        {deliverables.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-accent mt-1 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="w-full md:w-12 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 border-4 border-white shadow-lg">
                {number}
            </div>
        </div>
        <div className="flex-1 hidden md:block" />
    </div>
);

// 4. Industry Card
const IndustryCard = ({ icon: Icon, title, solutions }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
        <div className="relative z-10">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
            <ul className="space-y-3">
                {solutions.map((sol: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 shrink-0" />
                        {sol}
                    </li>
                ))}
            </ul>
            <button className="mt-6 flex items-center text-accent font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                EXPLORE SOLUTIONS <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </motion.div>
);

// 5. Pricing Card
const PricingCard = ({ title, active, price, features }: any) => (
    <div className={`relative p-8 rounded-2xl transition-all duration-300 ${active ? 'bg-primary text-white shadow-2xl scale-105 z-10' : 'bg-white text-slate-900 border border-slate-200'}`}>
        {active && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
            </div>
        )}
        <h3 className={`text-xl font-bold mb-2 ${active ? 'text-white' : 'text-primary'}`}>{title}</h3>
        <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-bold">{price}</span>
            {price !== 'Custom' && <span className={`text-sm ${active ? 'text-slate-400' : 'text-slate-500'}`}>/project</span>}
        </div>
        <ul className="space-y-4 mb-8">
            {features.map((feat: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className={`w-5 h-5 ${active ? 'text-secondary' : 'text-primary'}`} />
                    <span className={active ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={() => {
                if (active) {
                    // Logic to open QuoteRequestModal with this plan
                }
            }}
            className={`w-full py-3 rounded-xl font-bold transition-all ${active ? 'bg-secondary hover:bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-primary'}`}
        >
            Get Started
        </button>
    </div>
);

export default function ConsultPage() {
    const [activeIndustry, setActiveIndustry] = useState('All');
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: scrollRef });
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const { capture } = useCTACapture();

    // Animations
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div ref={scrollRef} className="min-h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Scroll Progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-secondary z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] bg-primary overflow-hidden flex items-center pt-20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-accent/10 to-transparent" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary rounded-full blur-[128px] opacity-20" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            Now accepting new enterprise partners for Q2 2026
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                            Transform Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                                Workforce DNA
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                            Enterprise-grade Organizational Development strategies that bridge the gap between academic output and industry demand.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => {
                                    capture({ sourcePage: '/consult', ctaLabel: 'Get My Free Diagnostic', intent: 'diagnostic' });
                                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-4 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-secondary/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                            >
                                Get My Free Diagnostic <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    capture({ sourcePage: '/consult', ctaLabel: 'Watch Case Study', intent: 'video_play' });
                                }}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
                            >
                                <Play className="w-5 h-5 fill-current" /> Watch Case Study
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Impact Analysis</h3>
                                    <p className="text-slate-400 text-sm">Real-time workforce transformation metrics</p>
                                </div>
                                <BarChart3 className="w-10 h-10 text-accent" />
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: "Productivity Delta", value: "+42%", color: "bg-accent" },
                                    { label: "Retention Rate", value: "94%", color: "bg-secondary" },
                                    { label: "Skill Gap Closure", value: "8.5/10", color: "bg-emerald-500" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 rounded-xl p-4">
                                        <div className="flex justify-between text-white mb-2">
                                            <span>{stat.label}</span>
                                            <span className="font-bold">{stat.value}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "100%" }}
                                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                                                className={`h-full ${stat.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <TrustBar />

            {/* --- PROBLEM STATEMENT --- */}
            <section className="py-24 bg-primary relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">The Talent Crisis is Real</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Most organizations are bleeding resources through inefficient hiring and training pipelines. Are you one of them?
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <ProblemCard
                            icon={Target}
                            stat="₹4.2 Cr"
                            title="Lost Productivity"
                            desc="Average annual loss for mid-sized enterprises due to prolonged role vacancies and slow onboarding times."
                            delay={0}
                        />
                        <ProblemCard
                            icon={Users}
                            stat="68%"
                            title="Skill Mismatch"
                            desc="Of hiring managers report that fresh graduates lack the critical practical skills needed for day-1 productivity."
                            delay={0.1}
                        />
                        <ProblemCard
                            icon={Zap}
                            stat="3.5x"
                            title="Hiring Cost"
                            desc="The multiplier cost of replacing a bad hire compared to retaining and upskilling an existing high-potential employee."
                            delay={0.2}
                        />
                        <ProblemCard
                            icon={Shield}
                            stat="45 Days"
                            title="Time-to-Productivity"
                            desc="The standard lag time before a new hire becomes fully productive without a structured OD intervention."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* --- PROCESS --- */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-secondary font-bold tracking-widest uppercase mb-3 text-sm">Our Methodology</h2>
                        <h2 className="text-3xl lg:text-4xl font-bold text-primary">The 4-Step Transformation Engine</h2>
                    </div>

                    <div className="relative space-y-24">
                        {/* Connector Line */}
                        <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block -translate-x-1/2" />

                        {[
                            {
                                title: "Diagnostic Deep Dive",
                                desc: "We don't guess. We analyze your current workforce DNA to identify specific skill gaps and cultural bottlenecks.",
                                deliverables: ["Skill Gap Audit", "Cultural Assessment", "Leadership Interviews"]
                            },
                            {
                                title: "Strategic Design",
                                desc: "Developing a bespoke transformation roadmap aligned with your specific business objectives and quarterly goals.",
                                deliverables: ["Custom Curriculum", "Role-Based Learning Paths", "Success Metrics KPI"]
                            },
                            {
                                title: "Agile Implementation",
                                desc: "Deploying training and development interventions with minimal disruption to daily operations.",
                                deliverables: ["Hybrid Workshops", "LMS Deployment", "On-the-job Mentoring"]
                            },
                            {
                                title: "Impact Measurement",
                                desc: "Continuous monitoring and optimization to ensure tangible ROI and sustained behavioral change.",
                                deliverables: ["Post-Training Assessment", "ROI Calculation Report", "Sustainability Playbook"]
                            }
                        ].map((step, i) => (
                            <ProcessStep
                                key={i}
                                number={i + 1}
                                title={step.title}
                                desc={step.desc}
                                deliverables={step.deliverables}
                                align={i % 2 === 0 ? 'left' : 'right'}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- INDUSTRY EXPERTISE --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">Specialized Solutions</h2>
                            <p className="text-slate-600 max-w-xl">Deep vertical expertise tailored to the unique regulatory and operational challenges of key sectors.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <IndustryCard
                            icon={Shield}
                            title="Defense & Aerospace"
                            solutions={["Compliance Training", "Technical Leadership", "Secure Ops Protocols"]}
                        />
                        <IndustryCard
                            icon={Factory}
                            title="Manufacturing 4.0"
                            solutions={["Lean Management", "Shop Floor Digitalization", "Safety Culture"]}
                        />
                        <IndustryCard
                            icon={Monitor}
                            title="IT & SaaS"
                            solutions={["Full Stack Upskilling", "Agile Project Mgmt", "Remote Team Leadership"]}
                        />
                        <IndustryCard
                            icon={Beaker}
                            title="Pharma & Life Sci"
                            solutions={["GXP Compliance", "R&D Innovation", "Sales Force Effectiveness"]}
                        />
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section className="py-24 bg-primary">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Investment Options</h2>
                        <p className="text-slate-400">Transparent engagement models designed for scale.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div onClick={() => { setSelectedPlan('Starter'); setIsQuoteModalOpen(true); capture({ sourcePage: '/consult', ctaLabel: 'Starter Plan', intent: 'corporate_quote', planName: 'Starter' }); }}>
                            <PricingCard
                                title="Starter"
                                price="₹75k"
                                features={[
                                    "Initial Diagnostic Audit",
                                    "Standard Curriculum Access",
                                    "Virtual Training (2 Days)",
                                    "Basic Assessment Report"
                                ]}
                                active={false}
                            />
                        </div>
                        <div onClick={() => { setSelectedPlan('Accelerator'); setIsQuoteModalOpen(true); capture({ sourcePage: '/consult', ctaLabel: 'Accelerator Plan', intent: 'corporate_quote', planName: 'Accelerator' }); }}>
                            <PricingCard
                                title="Accelerator"
                                price="₹2.5L"
                                features={[
                                    "Comprehensive Gap Analysis",
                                    "Customized Learning Path",
                                    "Hybrid Training (1 Week)",
                                    "Pre & Post Assessments",
                                    "Manager De-briefs"
                                ]}
                                active={true}
                            />
                        </div>
                        <div onClick={() => { setSelectedPlan('Enterprise'); setIsQuoteModalOpen(true); capture({ sourcePage: '/consult', ctaLabel: 'Enterprise Plan', intent: 'corporate_quote', planName: 'Enterprise' }); }}>
                            <PricingCard
                                title="Enterprise"
                                price="Custom"
                                features={[
                                    "Full-Scale OD Transformation",
                                    "Dedicated Program Manager",
                                    "LMS Integration & White-labeling",
                                    "Long-term ROI Tracking",
                                    "Executive Coaching"
                                ]}
                                active={false}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- LEAD FORM --- */}
            <section id="contact" className="py-24 bg-white relative">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-primary rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-4">Get Your Free Workforce Diagnostic</h2>
                            <p className="text-slate-300">Identify your organization's biggest talent gaps in 5 minutes. Includes a custom report.</p>
                        </div>

                        <form className="space-y-4 max-w-xl mx-auto relative z-10">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-accent" />
                                <input type="email" placeholder="Work Email" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-accent" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <select className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/50 focus:outline-none focus:border-accent">
                                    <option>Select Industry</option>
                                    <option>IT / Tech</option>
                                    <option>Manufacturing</option>
                                    <option>Defense</option>
                                    <option>Pharma</option>
                                </select>
                                <select className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/50 focus:outline-none focus:border-accent">
                                    <option>Team Size</option>
                                    <option>10 - 50</option>
                                    <option>50 - 200</option>
                                    <option>200+</option>
                                </select>
                            </div>
                            <button 
                                onClick={(e) => { e.preventDefault(); capture({ sourcePage: '/consult', ctaLabel: 'Download Diagnostic Report', intent: 'diagnostic' }); alert('Diagnostic form submitted (captured).'); }}
                                className="w-full py-4 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                                Download Diagnostic Report
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4">We respect your privacy. No spam, ever.</p>
                        </form>
                    </div>
                </div>
            </section>

            <QuoteRequestModal 
                isOpen={isQuoteModalOpen} 
                onClose={() => setIsQuoteModalOpen(false)} 
                sourcePage="/consult" 
                planName={selectedPlan} 
            />
        </div>
    );
}
