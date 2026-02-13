"use client";

import React, { useState } from "react";
import {
    Check,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Zap,
    Shield,
    Star,
    CreditCard,
    Calendar,
    Users,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Plan = "STARTER" | "GROWTH" | "BUSINESS";
type BillingPeriod = "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";

export const CheckoutWizard = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [plan, setPlan] = useState<Plan>("GROWTH");
    const [userCount, setUserCount] = useState(25);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("ANNUAL");
    const [processing, setProcessing] = useState(false);

    const addons = [
        { id: "adv_role", name: "Advanced Role/Comp Mgmt", price: 20, description: "Deep competency mapping and level management." },
        { id: "bulk_upload", name: "Bulk Upload (500+)", price: 15, description: "Handle large scale assessments effortlessly." },
        { id: "custom_reports", name: "Custom Report Builder", price: 30, description: "Visual drag-and-drop analytics dashboard." },
        { id: "career_portal", name: "Career Planning Portal", price: 40, description: "Personalized growth paths for all employees." },
        { id: "ai_questions", name: "AI Question Generation", price: 50, description: "Pedagogical GPT-4o powered question bank creator." }
    ];

    const planPrices = {
        STARTER: 49,
        GROWTH: 199,
        BUSINESS: 599
    };

    const discounts = {
        MONTHLY: 0,
        QUARTERLY: 0.05,
        SEMI_ANNUAL: 0.10,
        ANNUAL: 0.20
    };

    const calculateMonthlySubtotal = () => {
        const base = planPrices[plan];
        const addonsPrice = addons
            .filter(a => selectedAddons.includes(a.id))
            .reduce((sum, a) => sum + a.price, 0);
        return base + addonsPrice;
    };

    const monthlySubtotal = calculateMonthlySubtotal();
    const discount = monthlySubtotal * discounts[billingPeriod];
    const finalMonthly = monthlySubtotal - discount;
    const periodMonths = { MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12 }[billingPeriod];
    const totalToday = finalMonthly * periodMonths;

    const handleToggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleComplete = async () => {
        setProcessing(true);
        try {
            // 1. Call Activation API
            const response = await fetch("/api/billing/subscription/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: "current-tenant-id", // In real flow, get from session/context
                    plan,
                    userCount,
                    billingPeriod,
                    selectedAddons,
                    stripeSessionId: "mock_stripe_" + Math.random().toString(36).slice(2)
                })
            });

            if (!response.ok) throw new Error("Activation failed");

            // 2. Success state
            setTimeout(() => {
                setStep(5);
                setProcessing(false);
                toast.success("Subscription activated!");
            }, 1000);
        } catch (error) {
            toast.error("Failed to process payment. Please try again.");
            setProcessing(false);
        }
    };

    const renderStepNumbers = () => (
        <div className="flex items-center justify-between mb-12 max-w-sm mx-auto">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black italic ${step >= s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                        {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    {s < 4 && <div className={`w-12 h-1 ${step > s ? "bg-indigo-600" : "bg-slate-100"}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            {step < 5 && renderStepNumbers()}

            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Choose Your Plan</h1>
                        <p className="text-slate-500 font-medium">Select the base platform that fits your user count.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(["STARTER", "GROWTH", "BUSINESS"] as Plan[]).map((p) => (
                            <div
                                key={p}
                                onClick={() => setPlan(p)}
                                className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${plan === p ? "border-indigo-600 bg-white shadow-xl ring-2 ring-indigo-50" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                                    }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{p}</h3>
                                        {plan === p && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black italic tracking-tighter text-slate-900">${planPrices[p]}</span>
                                        <span className="text-slate-400 font-bold text-xs lowercase">/mo</span>
                                    </div>
                                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                                        {p === "STARTER" ? "1-10" : p === "GROWTH" ? "11-50" : "51-200"} Users
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-indigo-50/50 border-2 border-indigo-100 space-y-6">
                        <Label className="text-xs font-black uppercase tracking-widest text-indigo-600">Current User Count Estimate</Label>
                        <div className="flex items-center gap-8">
                            <Input
                                type="range"
                                min="1"
                                max="200"
                                step="1"
                                value={userCount}
                                onChange={(e) => setUserCount(parseInt(e.target.value))}
                                className="accent-indigo-600 h-2 bg-indigo-200"
                            />
                            <div className="w-20 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-indigo-100 text-xl font-black italic text-indigo-600">
                                {userCount}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-indigo-400 italic">User count will determine which tiers are available to you.</p>
                    </div>

                    <Button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-2xl gap-3" onClick={() => setStep(2)}>
                        Continue to Add-ons <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Customize Your Plan</h1>
                        <p className="text-slate-500 font-medium">Add premium and AI-powered features to supercharge your assessment engine.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                    <Check className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-black italic text-slate-900">Core Features</p>
                                    <p className="text-xs font-bold text-slate-400 italic">User Mgmt, Depts, Teams, Basic Assessments</p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] uppercase tracking-widest px-3">Included</Badge>
                        </div>

                        <Separator className="my-8" />

                        <div className="grid grid-cols-1 gap-4">
                            {addons.map((addon) => (
                                <div
                                    key={addon.id}
                                    onClick={() => handleToggleAddon(addon.id)}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedAddons.includes(addon.id) ? "border-indigo-600 bg-indigo-50/10 shadow-lg" : "border-slate-100 hover:border-slate-200 bg-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <Checkbox checked={selectedAddons.includes(addon.id)} />
                                        <div>
                                            <p className="text-sm font-black italic text-slate-900">{addon.name}</p>
                                            <p className="text-xs font-medium text-slate-400 italic">{addon.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-indigo-600 italic">+${addon.price}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">per month</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="h-16 px-8 rounded-2xl font-black italic gap-2" onClick={() => setStep(1)}>
                            <ArrowLeft className="w-5 h-5" /> Back
                        </Button>
                        <Button className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-2xl gap-3" onClick={() => setStep(3)}>
                            Select Billing Period <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Billing Period</h1>
                        <p className="text-slate-500 font-medium">Commit longer and save up to 20% on your total subscription.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"] as BillingPeriod[]).map((period) => (
                            <div
                                key={period}
                                onClick={() => setBillingPeriod(period)}
                                className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${billingPeriod === period ? "border-indigo-600 bg-white shadow-xl ring-2 ring-indigo-50" : "border-slate-100 bg-slate-50/20 hover:border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${billingPeriod === period ? "border-indigo-600 bg-indigo-600" : "border-slate-200"
                                        }`}>
                                        {billingPeriod === period && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black italic text-slate-900 leading-tight">
                                            {period.replace("_", " ")}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">
                                            Pay {period === "ANNUAL" ? "Yearly" : period === "SEMI_ANNUAL" ? "Every 6 mo" : period === "QUARTERLY" ? "Every 3 mo" : "Monthly"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-4">
                                        {discounts[period] > 0 && (
                                            <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase">
                                                Save {discounts[period] * 100}%
                                            </Badge>
                                        )}
                                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                                            ${(monthlySubtotal * (1 - discounts[period])).toFixed(0)}
                                            <span className="text-xs font-bold text-slate-400 lowercase italic ml-1">/mo</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Total Due Today</span>
                            <span className="text-4xl font-black italic tracking-tighter text-indigo-400">${totalToday.toFixed(0)}</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">14-day Money Back</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cancel Anytime</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="h-16 px-8 rounded-2xl font-black italic gap-2" onClick={() => setStep(2)}>
                            <ArrowLeft className="w-5 h-5" /> Back
                        </Button>
                        <Button className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-2xl gap-3" onClick={() => setStep(4)}>
                            Review Order <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Final Review</h1>
                        <p className="text-slate-500 font-medium">Verify your selection and complete your purchase securely with Stripe.</p>
                    </div>

                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100">
                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-indigo-600">Plan Summary</Label>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black italic text-slate-900 lowercase"><span className="uppercase">{plan}</span> Tier</h3>
                                        <p className="text-xs font-bold text-slate-400 italic">{userCount} Estimated Users</p>
                                    </div>
                                    <span className="text-xl font-black italic text-slate-900">${planPrices[plan]}/mo</span>
                                </div>
                            </div>

                            <Separator />

                            {selectedAddons.length > 0 && (
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-indigo-600">Selected Add-ons</Label>
                                    <div className="space-y-3">
                                        {addons.filter(a => selectedAddons.includes(a.id)).map(a => (
                                            <div key={a.id} className="flex justify-between items-center italic">
                                                <span className="text-sm font-bold text-slate-600">{a.name}</span>
                                                <span className="text-sm font-black text-slate-900">+${a.price}/mo</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator className="h-px bg-indigo-100" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold text-slate-400 italic">
                                    <span>Subtotal (Monthly)</span>
                                    <span>${monthlySubtotal}/mo</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-green-500 italic">
                                    <span>{billingPeriod.replace("_", " ")} Discount ({discounts[billingPeriod] * 100}%)</span>
                                    <span>-${discount.toFixed(0)}/mo</span>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <span className="text-xl font-black italic text-slate-900 lowercase">Final Subscription Price</span>
                                    <span className="text-2xl font-black italic text-indigo-600 tracking-tighter">${finalMonthly.toFixed(0)}/mo</span>
                                </div>
                            </div>

                            <div className="pt-8 px-8 py-6 rounded-3xl bg-indigo-600 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 italic mb-1">Due today ({periodMonths} months)</p>
                                    <h2 className="text-4xl font-black italic tracking-tighter">${totalToday.toFixed(0)}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 italic mb-1">Next Billing Date</p>
                                    <h3 className="text-sm font-black italic">Aug 1, 2026</h3>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="ghost" className="h-16 rounded-2xl font-black italic text-slate-400 group" onClick={() => setStep(3)}>
                            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" /> Modify Plan
                        </Button>
                        <Button
                            className="h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-2xl gap-3 shadow-indigo-100"
                            onClick={handleComplete}
                            disabled={processing}
                        >
                            {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                            {processing ? "Processing Security..." : `Pay $${totalToday.toFixed(0)} via Stripe`}
                        </Button>
                    </div>

                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic pt-4">
                        🔒 Secure payment powered by Stripe • PCI-DSS Level 1 Compliant
                    </p>
                </div>
            )}

            {step === 5 && (
                <div className="max-w-xl mx-auto space-y-12 text-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className="w-32 h-32 bg-green-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-100 rotate-6 hover:rotate-0 transition-transform duration-700">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase">Payment Successful!</h1>
                        <p className="text-xl text-slate-500 font-medium italic">
                            Welcome to the elite tier of assessment. Your SudAssess subscription is now active.
                        </p>
                    </div>

                    <Card className="border-none shadow-xl rounded-3xl bg-slate-50 py-10 px-8 grid grid-cols-2 gap-8 text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Order ID</p>
                            <p className="text-sm font-black italic text-slate-900">#INV-2026-001234</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Amount Paid</p>
                            <p className="text-sm font-black italic text-slate-900">${totalToday.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Subscription</p>
                            <p className="text-sm font-black italic text-slate-900">{plan} + {selectedAddons.length} Add-ons</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Renew Date</p>
                            <p className="text-sm font-black italic text-slate-900">Aug 2, 2026</p>
                        </div>
                    </Card>

                    <div className="space-y-4 pt-8">
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 italic">Ready to transform your organization?</p>
                        <Button className="w-full h-18 rounded-[2rem] bg-slate-900 hover:bg-black text-2xl font-black italic shadow-2xl gap-4 group" onClick={() => router.push("/assessments/admin/models")}>
                            Enter Admin Dashboard <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
