/**
 * Feature Flags — Wave 5 AI Runtime Features
 * Controls which major features are live. Toggle here before deploying.
 */

export const FEATURES = {
    ENROLLMENT_IDS: true,            // Task #11 — live
    TENANT_LABELS_HOOK: true,        // Task #12 — live
    DEPT_TEAM_SCOPING: true,         // Task #9 — implemented and verified
    PREVIOUS_ROLES_PAGE: true,       // Task #2 — now building
    SELF_ASSIGN_COMPETENCIES: true,  // Task #3 — implemented self assign UI
    ORG_HIERARCHY: true,             // Task #4 — proceeding now
    POLYMORPHIC_APPROVAL: false,     // Task #1 — high risk
    INTELLIGENT_RECS: true,          // Task #10 — implemented
    ADAPTIVE_AI_RUNTIME: true,       // Task #16 — AI adaptive assessment
    VOICE_INTERVIEW: true,           // Task #17 — AI voice interview (Python backend)
    VIDEO_INTERVIEW: true,           // Task #18 — AI video interview (Python backend)
    CODE_EXTERNAL: true,             // Task #20 — external code sandbox
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled.
 * Can be extended to check user role, tenant plan, env vars, etc.
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
    // Allow env var override: FEATURE_ADAPTIVE_AI_RUNTIME=false will disable even if true above
    const envKey = `NEXT_PUBLIC_FEATURE_${feature}`;
    const envValue =
        typeof process !== "undefined" ? process.env[envKey] : undefined;
    if (envValue === "false") return false;
    if (envValue === "true") return true;
    return FEATURES[feature];
}

/**
 * Assert a feature is enabled. Throws if disabled.
 * Use in server-side API routes.
 */
export function requireFeature(feature: FeatureFlag): void {
    if (!isFeatureEnabled(feature)) {
        throw new Error(`Feature '${feature}' is not enabled.`);
    }
}
