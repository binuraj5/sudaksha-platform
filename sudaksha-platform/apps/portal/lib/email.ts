import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "SudAssess <noreply@sudaksha.com>";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[EMAIL] RESEND_API_KEY not set — email not sent to:", to);
        return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to,
            subject,
            html,
        });

        if (error) {
            console.error("[EMAIL] Resend error:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[EMAIL] Failed to send email to", to, err);
        return false;
    }
}
