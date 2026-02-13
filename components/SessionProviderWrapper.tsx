"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderWrapperProps {
    session: Session | null | undefined;
    children: React.ReactNode;
}

export function SessionProviderWrapper({ session, children }: SessionProviderWrapperProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}
