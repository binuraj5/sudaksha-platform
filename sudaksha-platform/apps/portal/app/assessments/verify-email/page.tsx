"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const errorParam = searchParams?.get("error");
    const emailParam = searchParams?.get("email") ?? "";

    const [email, setEmail] = useState(emailParam);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Auto-send if we have an email from registration redirect
    useEffect(() => {
        if (emailParam && !errorParam) {
            handleResend(emailParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResend = async (targetEmail?: string) => {
        const emailToUse = targetEmail ?? email;
        if (!emailToUse) {
            toast.error("Please enter your email address.");
            return;
        }
        setSending(true);
        try {
            const res = await fetch("/api/auth/send-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToUse }),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                toast.success(data.message || "Verification email sent!");
            } else {
                toast.error(data.error || "Failed to send verification email.");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const errorMessages: Record<string, string> = {
        missing_token: "The verification link is missing a token. Please request a new one.",
        invalid_or_expired: "This verification link has expired or is invalid. Please request a new one.",
        invalid_token: "The verification token is not valid. Please request a new one.",
        server_error: "A server error occurred. Please try again later.",
    };

    const isError = !!errorParam;
    const errorMessage = errorParam ? errorMessages[errorParam] ?? "An unexpected error occurred." : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 p-10 space-y-7">

                    {/* Icon */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isError ? "bg-red-50" : sent ? "bg-green-50" : "bg-indigo-50"}`}>
                            {isError ? (
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            ) : sent ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            ) : (
                                <Mail className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>

                        <h1 className="text-2xl font-black text-slate-900">
                            {isError ? "Verification Failed" : sent ? "Check Your Email" : "Verify Your Email"}
                        </h1>

                        <p className="text-slate-500 text-sm leading-relaxed">
                            {isError
                                ? errorMessage
                                : sent
                                    ? `We've sent a verification link to ${email || "your email address"}. Click the link in the email to activate your account.`
                                    : "Enter your registration email below to receive a verification link. The link expires in 24 hours."}
                        </p>
                    </div>

                    {/* Email + Resend */}
                    {!sent && (
                        <div className="space-y-3">
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <Button
                                onClick={() => handleResend()}
                                disabled={sending || !email}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                                {sending ? "Sending…" : "Send Verification Email"}
                            </Button>
                        </div>
                    )}

                    {/* Resend from "sent" or "error" state */}
                    {(sent || isError) && (
                        <div className="space-y-3">
                            {isError && (
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200"
                                />
                            )}
                            <Button
                                variant="outline"
                                onClick={() => { setSent(false); handleResend(); }}
                                disabled={sending}
                                className="w-full h-11 rounded-xl border-slate-200 font-semibold"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                {sending ? "Sending…" : "Resend Verification Email"}
                            </Button>
                        </div>
                    )}

                    {/* Info box */}
                    {sent && !isError && (
                        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-800 border border-blue-100 space-y-1">
                            <p className="font-semibold">Didn't receive the email?</p>
                            <ul className="text-blue-700 space-y-0.5 list-disc list-inside text-xs">
                                <li>Check your spam or junk folder</li>
                                <li>Make sure you registered with this email</li>
                                <li>The link expires after 24 hours</li>
                            </ul>
                        </div>
                    )}

                    {/* Back to login */}
                    <p className="text-center text-sm text-slate-400">
                        Already verified?{" "}
                        <button
                            onClick={() => router.push("/assessments/login")}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold underline-offset-2 hover:underline"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
