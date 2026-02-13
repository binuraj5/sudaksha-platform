
import React from 'react';
import { CodeChallengeRunner } from "@/components/assessments/admin/code/CodeChallengeRunner";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        challengeId: string;
    }
}

export default async function CodeAssessmentPage({ params }: PageProps) {
    // In a real scenario, we would fetch the specific challenge here
    // For now, we render the component which currently has mocked data, 
    // but eventually we will pass the challenge data as props to the runner.

    // const challenge = await prisma.codeChallenge.findUnique({
    //     where: { id: params.challengeId },
    //     include: { problems: true }
    // });

    // if (!challenge) notFound();

    return (
        <div className="container mx-auto py-4 px-2 max-w-[1600px]">
            <CodeChallengeRunner />
        </div>
    );
}
