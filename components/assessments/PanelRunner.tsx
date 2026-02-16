"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, Loader2, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

interface PanelConfig {
    panelId: string;
    competencyName: string;
    targetLevel: string;
    durationMinutes: number;
}

interface PanelRunnerProps {
    userComponentId: string;
    questionId: string;
    panelConfig: PanelConfig;
    sectionName: string;
    assessmentId: string;
    componentId: string;
    onComplete: () => void;
}

export function PanelRunner({
    userComponentId,
    questionId,
    panelConfig,
    sectionName,
    assessmentId,
    componentId,
    onComplete,
}: PanelRunnerProps) {
    const [saving, setSaving] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [scheduledInterview, setScheduledInterview] = useState<{ scheduledTime: string; meetingLink?: string | null } | null>(null);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");

    const handleSchedule = async () => {
        const date = scheduleDate.trim();
        const time = scheduleTime.trim();
        if (!date || !time) {
            toast.error("Please select date and time");
            return;
        }
        const scheduledDt = new Date(`${date}T${time}`);
        if (Number.isNaN(scheduledDt.getTime())) {
            toast.error("Invalid date or time");
            return;
        }
        const scheduledTime = scheduledDt.toISOString();
        setScheduling(true);
        try {
            const res = await fetch("/api/assessments/panels/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    panelId: panelConfig.panelId,
                    memberAssessmentId: assessmentId,
                    componentId,
                    scheduledTime,
                    durationMinutes: panelConfig.durationMinutes,
                    meetingLink: meetingLink.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to schedule");
                return;
            }
            const data = await res.json();
            setScheduledInterview({
                scheduledTime: data.scheduledTime ?? scheduledTime,
                meetingLink: data.meetingLink ?? (meetingLink.trim() || null),
            });
            toast.success("Panel interview scheduled. You'll receive a calendar invite.");
        } catch (e) {
            toast.error((e as Error).message || "Failed to schedule");
        } finally {
            setScheduling(false);
        }
    };

    const handleContinue = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/assessments/runner/response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userComponentId,
                    questionId,
                    responseData: {
                        type: "PANEL_INTERVIEW",
                        panelId: panelConfig.panelId,
                        scheduledSeparately: true,
                        competencyName: panelConfig.competencyName,
                        targetLevel: panelConfig.targetLevel,
                        durationMinutes: panelConfig.durationMinutes,
                    },
                    maxPoints: 100,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to save. You can continue to the next section.");
            }
            onComplete();
        } catch (e) {
            toast.error((e as Error).message || "Failed to save. You can continue to the next section.");
            onComplete();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-navy-600" />
                        {sectionName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {panelConfig.competencyName} • {panelConfig.targetLevel} Level
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border">
                        <Calendar className="h-5 w-5 text-navy-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">Panel interview – scheduled separately</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                This section is a live panel interview ({panelConfig.durationMinutes} min). You will receive
                                a separate invitation with the scheduled time and meeting link. You can continue to the
                                next section now.
                            </p>
                        </div>
                    </div>

                    {scheduledInterview ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CalendarCheck className="h-5 w-5 text-green-600 shrink-0" />
                            <div>
                                <p className="font-medium text-green-900">Scheduled</p>
                                <p className="text-sm text-green-700">
                                    {new Date(scheduledInterview.scheduledTime).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                    {scheduledInterview.meetingLink && (
                                        <>
                                            {" · "}
                                            <a
                                                href={scheduledInterview.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                Join meeting
                                            </a>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Schedule your panel interview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="panel-date">Date</Label>
                                        <Input
                                            id="panel-date"
                                            type="date"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="panel-time">Time</Label>
                                        <Input
                                            id="panel-time"
                                            type="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="panel-meeting">Meeting link (optional)</Label>
                                    <Input
                                        id="panel-meeting"
                                        type="url"
                                        placeholder="https://..."
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSchedule}
                                    disabled={scheduling}
                                >
                                    {scheduling ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scheduling…
                                        </>
                                    ) : (
                                        "Schedule"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Button className="w-full" onClick={handleContinue} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Continue to next section"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
