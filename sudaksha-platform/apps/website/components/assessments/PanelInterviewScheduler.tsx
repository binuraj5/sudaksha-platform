"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Users, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    memberAssessmentId: string;
    scheduledTime: string;
    durationMinutes: number;
    status: string;
    meetingLink: string | null;
}

interface PanelInterviewSchedulerProps {
    panelId: string;
    panelName: string;
}

export function PanelInterviewScheduler({ panelId, panelName }: PanelInterviewSchedulerProps) {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Form states for the selected interview to evaluate
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [evaluationScore, setEvaluationScore] = useState("");
    const [evaluationFeedback, setEvaluationFeedback] = useState("");
    const [evaluationRecommendation, setEvaluationRecommendation] = useState("HIRE");
    const [submittingEval, setSubmittingEval] = useState(false);

    useEffect(() => {
        fetchInterviews();
    }, [panelId]);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/assessments/panels/${panelId}/interviews`);
            if (!res.ok) throw new Error("Failed to load interviews");
            const data = await res.json();
            setInterviews(data);
        } catch (error) {
            toast.error("Failed to load interviews");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLink = async (interviewId: string, newLink: string) => {
        setUpdating(interviewId);
        try {
            const res = await fetch(`/api/assessments/panels/${panelId}/interviews/${interviewId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingLink: newLink }),
            });
            if (!res.ok) throw new Error("Failed to update link");
            toast.success("Meeting link updated");
            fetchInterviews();
        } catch (error) {
            toast.error("Failed to update meeting link");
        } finally {
            setUpdating(null);
        }
    };

    const handleSubmitEvaluation = async () => {
        if (!selectedInterview) return;
        if (!evaluationScore || isNaN(Number(evaluationScore))) {
            toast.error("Please enter a valid numeric score");
            return;
        }

        setSubmittingEval(true);
        try {
            const res = await fetch(`/api/assessments/panels/${panelId}/interviews/${selectedInterview.id}/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: Number(evaluationScore),
                    feedback: evaluationFeedback,
                    recommendation: evaluationRecommendation,
                }),
            });
            if (!res.ok) throw new Error("Failed to submit evaluation");
            toast.success("Evaluation submitted successfully");
            setSelectedInterview(null);
            fetchInterviews();
        } catch (error) {
            toast.error("Failed to submit evaluation");
        } finally {
            setSubmittingEval(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Panel Interviews</h2>
                    <p className="text-sm text-muted-foreground">Manage scheduled interviews and submit evaluations for {panelName}</p>
                </div>
                <Button variant="outline" onClick={fetchInterviews}>
                    Refresh
                </Button>
            </div>

            {interviews.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground mb-2">No interviews scheduled yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {interviews.map((interview) => (
                        <Card key={interview.id} className="overflow-hidden flex flex-col">
                            <CardHeader className="bg-slate-50 border-b pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-4 w-4 text-navy-600" />
                                    {interview.candidateName || "Candidate"}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(interview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1.5 hover:text-navy-600 transition-colors">Meeting Link</p>
                                    <div className="flex gap-2">
                                        <Input
                                            className="h-8 text-sm"
                                            placeholder="https://..."
                                            defaultValue={interview.meetingLink || ""}
                                            onBlur={(e) => {
                                                if (e.target.value !== interview.meetingLink) {
                                                    handleUpdateLink(interview.id, e.target.value);
                                                }
                                            }}
                                        />
                                        {interview.meetingLink && (
                                            <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" asChild>
                                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-auto pt-2 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                            {interview.status}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        variant={interview.status === "COMPLETED" ? "secondary" : "default"}
                                        onClick={() => {
                                            setSelectedInterview(interview);
                                            setEvaluationScore("");
                                            setEvaluationFeedback("");
                                            setEvaluationRecommendation("HIRE");
                                        }}
                                    >
                                        {interview.status === "COMPLETED" ? "View/Edit Evaluation" : "Evaluate Candidate"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Evaluation Modal/Flyout (simplified as inline for now) */}
            {selectedInterview && (
                <Card className="border-navy-200 mt-8">
                    <CardHeader className="bg-navy-50/50">
                        <CardTitle className="text-lg">
                            Evaluate: {selectedInterview.candidateName || "Candidate"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Score (0-100)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={evaluationScore}
                                    onChange={(e) => setEvaluationScore(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Recommendation</Label>
                                <Select value={evaluationRecommendation} onValueChange={setEvaluationRecommendation}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIRE">Hire</SelectItem>
                                        <SelectItem value="NO_HIRE">No Hire</SelectItem>
                                        <SelectItem value="HOLD">Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Detailed Feedback</Label>
                            <Textarea
                                placeholder="Enter your evaluation notes here..."
                                className="min-h-[100px]"
                                value={evaluationFeedback}
                                onChange={(e) => setEvaluationFeedback(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setSelectedInterview(null)}>Cancel</Button>
                            <Button onClick={handleSubmitEvaluation} disabled={submittingEval}>
                                {submittingEval && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Submit Evaluation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
