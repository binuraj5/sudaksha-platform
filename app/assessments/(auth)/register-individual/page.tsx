"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const registerSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    userMode: z.enum(["PROFESSIONAL", "STUDENT"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterIndividualPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            userMode: "PROFESSIONAL",
        },
    });

    const userMode = watch("userMode");

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register-individual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Registration failed");
            }

            toast.success("Account created successfully! Please log in.");
            router.push("/assessments/login?callbackUrl=/assessments/onboarding");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-indigo-700">Join SudAssess</CardTitle>
                    <CardDescription className="text-center">
                        Create your free individual account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Mode Selection */}
                        <div className="space-y-3 pb-4">
                            <Label className="text-base font-semibold">I am a:</Label>
                            <RadioGroup
                                defaultValue="PROFESSIONAL"
                                className="grid grid-cols-2 gap-4"
                                onValueChange={(val) => setValue("userMode", val as "PROFESSIONAL" | "STUDENT")}
                            >
                                <div className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-slate-50 cursor-pointer ${userMode === "PROFESSIONAL" ? "border-indigo-600 bg-indigo-50" : "border-muted bg-transparent"}`}>
                                    <RadioGroupItem value="PROFESSIONAL" id="mode-pro" className="sr-only" />
                                    <Label htmlFor="mode-pro" className="flex flex-col items-center cursor-pointer w-full">
                                        <Briefcase className={`mb-3 h-6 w-6 ${userMode === "PROFESSIONAL" ? "text-indigo-600" : "text-gray-500"}`} />
                                        <span className="font-semibold text-sm">Professional</span>
                                    </Label>
                                </div>
                                <div className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-slate-50 cursor-pointer ${userMode === "STUDENT" ? "border-indigo-600 bg-indigo-50" : "border-muted bg-transparent"}`}>
                                    <RadioGroupItem value="STUDENT" id="mode-student" className="sr-only" />
                                    <Label htmlFor="mode-student" className="flex flex-col items-center cursor-pointer w-full">
                                        <GraduationCap className={`mb-3 h-6 w-6 ${userMode === "STUDENT" ? "text-indigo-600" : "text-gray-500"}`} />
                                        <span className="font-semibold text-sm">Student</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" {...register("firstName")} />
                                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" {...register("lastName")} />
                                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Free Account"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-500">
                    <div>
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-indigo-600">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-indigo-600">
                            Privacy Policy
                        </Link>
                        .
                    </div>
                    <div className="border-t pt-4 w-full">
                        Already have an account?{" "}
                        <Link href="/assessments/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
